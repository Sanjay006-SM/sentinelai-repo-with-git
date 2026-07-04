from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
import json
import logging
import time
from typing import Dict, Any

from app.api.dependencies import get_db, get_current_workspace
from app.models.ingestion_job import IngestionJob
from app.models.tenant import User, Workspace
from app.services.ingestion import IngestionService
from app.services.ingestion_sources.base import IngestionSource
from app.services.ingestion_sources.file_upload import FileUploadSource

from app.core.events.bus import event_bus
from app.core.events.contracts import AuditEvent
from app.core.events.event_types import ActorClassification, EventCategory, EventSeverity, EventStatus, ResourceClassification

router = APIRouter()
logger = logging.getLogger(__name__)

def execute_ingestion_pipeline(source: IngestionSource, job_id: str, workspace_id: str = None) -> dict:
    """Background task to fetch events from the source, normalize, validate and update the job status."""
    from app.db.session import SessionLocal
    from app.services.graph_sync_service import GraphSyncService
    from app.services.risk_engine import RiskEngine
    from app.graph.session import neo4j_manager
    from app.services.cloudtrail_parser import CloudTrailParser
    
    start_time = time.time()
    db = SessionLocal()
    
    try:
        # Get metadata
        meta = source.get_source_metadata()
        identifier = meta.get("identifier", "unknown")
        source_type = meta.get("sourceType", "unknown")

        print("\n------------------------------------------------")
        print(f"Ingestion Started [{source_type}]")
        print(f"identifier={identifier}")
        print("------------------------------------------------")

        # Fetch raw JSON via the source
        json_data = source.fetch_events()

        # Normalization Info Logging
        if isinstance(json_data, list):
            format_name = "Array of Events"
            records_count = len(json_data)
        elif isinstance(json_data, dict):
            if "eventID" in json_data or "eventTime" in json_data:
                format_name = "Single Event"
                records_count = 1
            else:
                # Find standard wrappers
                keys_lower = [k.lower() for k in json_data.keys()]
                if "records" in keys_lower:
                    format_name = "Standard CloudTrail Log File"
                elif "events" in keys_lower:
                    format_name = "Events List"
                else:
                    format_name = "Custom Log Format"
                
                # Extract records count safely
                normalized_temp = CloudTrailParser.normalize_json(json_data)
                records_count = len(normalized_temp.get("Records", []))
        else:
            format_name = "Unknown Format"
            records_count = 0
            
        print("Normalization")
        print(f"Detected Format:\n{format_name}")
        print(f"Normalized:\n{records_count} Records")
        print("------------------------------------------------")
        
        # Validation Info Logging
        # parse_log_file will validate and throw descriptive ValueError if invalid
        events = CloudTrailParser.parse_log_file(json_data)
        print("Validation")
        print("Passed")
        print("------------------------------------------------")

        # Update job to running
        job = db.query(IngestionJob).filter(IngestionJob.job_id == job_id).first()
        if job:
            job.status = 'running'
            db.commit()
            
        ingestion_service = IngestionService(db)
        stats = ingestion_service.process_cloudtrail_json(json_data, job_id=job_id, filename=identifier, workspace_id=workspace_id)
        
        print("Ingestion")
        print(f"Inserted:\n{stats['inserted']}")
        print(f"Duplicates:\n{stats['duplicates']}")
        print(f"Failed:\n{stats['failed']}")
        print("------------------------------------------------")
        
        print("Identity Discovery")
        print(f"Created:\n{stats.get('identities_created_count', 0)}")
        print(f"Updated:\n{stats.get('identities_updated_count', 0)}")
        print("------------------------------------------------")

        # Sync Neo4j graph and evaluate risk scores ONLY for newly inserted events
        neo4j_session = None
        neo4j_stats = {"nodes_created": 0, "relationships_created": 0}
        findings_count = 0
        
        try:
            if stats["new_logs"]:
                neo4j_session = neo4j_manager.get_session()
                
                # Sync graph incrementally
                graph_sync = GraphSyncService(db, neo4j_session)
                neo4j_stats = graph_sync.sync_new_events(stats["new_logs"], workspace_id=workspace_id)
                
                # Calculate risk scores incrementally
                risk_engine = RiskEngine(db, neo4j_session)
                findings_count = risk_engine.evaluate_new_identities(list(stats["new_identity_arns"]), workspace_id=workspace_id)
                
        finally:
            if neo4j_session:
                neo4j_session.close()
                
        print("Risk Engine")
        print(f"Processed:\n{len(stats['new_identity_arns'])}")
        print(f"Findings:\n{findings_count}")
        print("------------------------------------------------")
        
        print("Neo4j")
        print(f"Nodes:\n{neo4j_stats['nodes_created']}")
        print(f"Relationships:\n{neo4j_stats['relationships_created']}")
        print("------------------------------------------------")

        # Update job to completed
        job = db.query(IngestionJob).filter(IngestionJob.job_id == job_id).first()
        if job:
            job.status = 'completed'
            job.events_processed = stats.get('total_events', 0)
            job.completed_at = func.now()
            db.commit()
            
        duration = time.time() - start_time
        print("Completed")
        print(f"Duration:\n{duration:.2f} sec")
        print("------------------------------------------------\n")
        
        # Merge stats
        stats["risk_findings_generated"] = findings_count
        stats["neo4j_nodes_created"] = neo4j_stats["nodes_created"]
        stats["neo4j_relationships_created"] = neo4j_stats["relationships_created"]
        stats["processing_time_ms"] = int(duration * 1000)
        stats["status"] = "completed"
        
        return stats
        
    except ValueError as ve:
        logger.error(f"Validation or format mismatch error: {str(ve)}")
        db.rollback()
        job = db.query(IngestionJob).filter(IngestionJob.job_id == job_id).first()
        if job:
            job.status = 'failed'
            job.completed_at = func.now()
            db.commit()
        # Raise standard HTTPException with custom message matching requirements
        raise HTTPException(status_code=400, detail=str(ve))
        
    except Exception as e:
        logger.error(f"Background processing failed for job {job_id}: {str(e)}")
        db.rollback()
        job = db.query(IngestionJob).filter(IngestionJob.job_id == job_id).first()
        if job:
            job.status = 'failed'
            job.completed_at = func.now()
            db.commit()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/upload", response_model=Dict[str, Any])
async def upload_cloudtrail_logs(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace)
):
    """
    Upload a JSON file containing AWS CloudTrail logs.
    The file will be processed synchronously for real-time UI updates.
    """
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are supported.")
        
    try:
        content = await file.read()
        print(f"DEBUG: file read length: {len(content)}")
        print(f"DEBUG: file content preview: {content[:100]}")
        # Create Ingestion Job record
        job = IngestionJob(
            workspace_id=workspace.id,
            s3_bucket_name="manual-upload", # Fallback since we aren't pulling from S3 directly
            status="pending"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Initialize the file upload source
        source = FileUploadSource(content, file.filename)

        # Process the file synchronously for real-time UI updates and gather stats
        stats = execute_ingestion_pipeline(source, str(job.job_id), str(workspace.id))
        
        event_bus.publish(AuditEvent(
            workspace_id=str(workspace.id),
            organization_id=str(workspace.organization_id),
            actor="SYSTEM",
            actor_type=ActorClassification.INTERNAL_ENGINE,
            module="Ingestion",
            action="UPLOAD_COMPLETED",
            category=EventCategory.INGESTION,
            severity=EventSeverity.INFO,
            status=EventStatus.SUCCESS,
            resource_type=ResourceClassification.SYSTEM,
            metadata={"filename": file.filename, "stats": stats}
        ))
        
        return {
            "message": "File uploaded and processed successfully.",
            "job_id": str(job.job_id),
            "filename": file.filename,
            "status": "completed",
            "total_events": stats.get("total_events", 0),
            "inserted": stats.get("inserted", 0),
            "duplicates": stats.get("duplicates", 0),
            "failed": stats.get("failed", 0),
            "identities_discovered": stats.get("identities_discovered", 0),
            "risk_findings_generated": stats.get("risk_findings_generated", 0),
            "neo4j_nodes_created": stats.get("neo4j_nodes_created", 0),
            "neo4j_relationships_created": stats.get("neo4j_relationships_created", 0),
            "processing_time_ms": stats.get("processing_time_ms", 0)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        event_bus.publish(AuditEvent(
            workspace_id=str(workspace.id),
            organization_id=str(workspace.organization_id),
            actor="SYSTEM",
            actor_type=ActorClassification.INTERNAL_ENGINE,
            module="Ingestion",
            action="UPLOAD_FAILED",
            category=EventCategory.INGESTION,
            severity=EventSeverity.HIGH,
            status=EventStatus.FAILED,
            resource_type=ResourceClassification.SYSTEM,
            metadata={"filename": file.filename, "error": str(e)}
        ))
        raise HTTPException(status_code=500, detail=str(e))
