from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import Dict, Any
import json
import logging

from app.api.dependencies import get_db
from app.services.ingestion import IngestionService
from app.models.ingestion_job import IngestionJob

router = APIRouter()
logger = logging.getLogger(__name__)

def process_file_background(file_content: bytes, job_id: str):
    """Background task to process the file and update the job status."""
    from app.db.session import SessionLocal
    from app.services.graph_sync_service import GraphSyncService
    from app.services.risk_engine import RiskEngine
    from app.graph.session import neo4j_manager
    
    db = SessionLocal()
    try:
        json_data = json.loads(file_content)
        ingestion_service = IngestionService(db)
        
        # Update job to running
        job = db.query(IngestionJob).filter(IngestionJob.job_id == job_id).first()
        if job:
            job.status = 'running'
            db.commit()
            
        stats = ingestion_service.process_cloudtrail_json(json_data, job_id=job_id)
        
        # Sync Neo4j graph and evaluate risk scores
        neo4j_session = None
        try:
            neo4j_session = neo4j_manager.get_session()
            
            # Sync graph
            graph_sync = GraphSyncService(db, neo4j_session)
            graph_sync.sync_all()
            
            # Calculate risk scores
            risk_engine = RiskEngine(db, neo4j_session)
            risk_engine.evaluate_all()
            
        finally:
            if neo4j_session:
                neo4j_session.close()
        
        # Update job to completed
        job = db.query(IngestionJob).filter(IngestionJob.job_id == job_id).first()
        if job:
            job.status = 'completed'
            job.events_processed = stats.get('total_events', 0)
            job.completed_at = func.now()
            db.commit()
            
    except Exception as e:
        logger.error(f"Background processing failed for job {job_id}: {str(e)}")
        db.rollback()
        job = db.query(IngestionJob).filter(IngestionJob.job_id == job_id).first()
        if job:
            job.status = 'failed'
            job.completed_at = func.now()
            db.commit()
    finally:
        db.close()


@router.post("/upload", response_model=Dict[str, Any])
async def upload_cloudtrail_logs(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a JSON file containing AWS CloudTrail logs.
    The file will be processed synchronously for real-time UI updates.
    """
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are supported.")
        
    try:
        content = await file.read()
        
        # Create Ingestion Job record
        job = IngestionJob(
            s3_bucket_name="manual-upload", # Fallback since we aren't pulling from S3 directly
            status="pending"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Process the file in the background to avoid blocking the HTTP thread
        background_tasks.add_task(process_file_background, content, str(job.job_id))
        
        return {
            "message": "File uploaded and processed successfully.",
            "job_id": str(job.job_id),
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
