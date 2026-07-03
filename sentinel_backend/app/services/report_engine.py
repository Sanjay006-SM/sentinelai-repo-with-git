import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
import logging
import json
from datetime import datetime

from app.models.report import Report, ScheduledReport, ReportHistory
from app.db.session import SessionLocal

from app.services.report_pipeline.report_data_aggregator import ReportDataAggregator
from app.services.ai.ai_analyst_service import AIAnalystService
from app.services.report_pipeline.pdf_generator import PDFGenerator
from app.services.report_pipeline.report_storage import ReportStorage

logger = logging.getLogger(__name__)

class ReportEngineService:
    def __init__(self, db: Session):
        self.db = db

    def _log_history(self, report_id: str, workspace_id: str, status: str, user_id: str = None, duration_ms: str = None, stage: str = None, error_message: str = None):
        history = ReportHistory(
            report_id=uuid.UUID(report_id),
            workspace_id=uuid.UUID(workspace_id),
            status=status,
            user_id=uuid.UUID(user_id) if user_id else None,
            duration_ms=duration_ms,
            stage=stage,
            error_message=error_message
        )
        self.db.add(history)
        self.db.commit()

    def generate_report(self, background_tasks, workspace_id: str, organization_id: str, name: str, report_type: str, filters: Dict[str, Any], user_id: str = None) -> Report:
        """Kicks off the report generation pipeline asynchronously."""
        report = Report(
            workspace_id=uuid.UUID(workspace_id),
            organization_id=uuid.UUID(organization_id),
            name=name,
            type=report_type,
            status="QUEUED",
            metadata_json={"filters": filters}
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        report_id = str(report.id)
        self._log_history(report_id, workspace_id, "QUEUED", user_id, stage="QUEUE")
        
        # FastAPI BackgroundTasks runs sync functions in a threadpool automatically
        background_tasks.add_task(self._execute_pipeline, report_id, workspace_id, name, user_id, organization_id)
        
        return report

    def _execute_pipeline(self, report_id: str, workspace_id: str, name: str, user_id: str = None, organization_id: str = None):
        # We need a new session for the background task thread
        db = SessionLocal()
        start_time = datetime.utcnow()
        stage = "INITIALIZATION"
        try:
            report = db.query(Report).filter(Report.id == uuid.UUID(report_id)).first()
            if not report:
                return
            
            history_helper = ReportEngineService(db)
            
            # GENERATING
            stage = "GENERATING"
            report.status = stage
            db.commit()
            history_helper._log_history(report_id, workspace_id, stage, user_id, stage=stage)
            
            # 1. Aggregate Data
            logger.info(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "STARTED"}))
            aggregator = ReportDataAggregator(db)
            metrics = aggregator.aggregate(workspace_id)
            logger.info(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "SUCCESS"}))
            
            # VALIDATING & AI
            stage = "VALIDATING"
            report.status = stage
            db.commit()
            history_helper._log_history(report_id, workspace_id, stage, user_id, stage=stage)
            logger.info(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "STARTED"}))
            
            ai_service = AIAnalystService()
            ai_summary = ai_service.generate_executive_report_summary(metrics)
            logger.info(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "SUCCESS"}))
            
            # RENDERING
            stage = "RENDERING"
            report.status = stage
            db.commit()
            history_helper._log_history(report_id, workspace_id, stage, user_id, stage=stage)
            logger.info(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "STARTED"}))
            
            pdf_gen = PDFGenerator()
            pdf_bytes = pdf_gen.generate(name, metrics, ai_summary)
            logger.info(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "SUCCESS"}))
            
            # UPLOADING
            stage = "UPLOADING"
            report.status = stage
            db.commit()
            history_helper._log_history(report_id, workspace_id, stage, user_id, stage=stage)
            logger.info(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "STARTED"}))
            
            storage = ReportStorage()
            pdf_uri = storage.save_pdf(workspace_id, report_id, pdf_bytes)
            
            # CSV Zip Export
            datasets = {}
            if metrics.get("identity", {}).get("identities"):
                datasets["identities"] = metrics["identity"]["identities"]
            if metrics.get("risk", {}).get("top_findings"):
                datasets["findings"] = metrics["risk"]["top_findings"]
                
            if datasets:
                csv_uri = storage.save_csv_zip(workspace_id, report_id, "export.zip", datasets)
                report.csv_url = csv_uri
            
            logger.info(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "SUCCESS"}))
                
            # COMPLETED
            stage = "COMPLETED"
            report.status = stage
            report.file_url = pdf_uri
            report.report_size_bytes = str(len(pdf_bytes))
            duration = str(int((datetime.utcnow() - start_time).total_seconds() * 1000))
            db.commit()
            
            history_helper._log_history(report_id, workspace_id, stage, user_id, duration_ms=duration, stage=stage)
            logger.info(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "SUCCESS", "duration_ms": duration}))
            
        except Exception as e:
            error_msg = str(e)
            logger.error(json.dumps({"workspace_id": workspace_id, "report_id": report_id, "stage": stage, "status": "FAILED", "error": error_msg}))
            db.rollback()
            report = db.query(Report).filter(Report.id == uuid.UUID(report_id)).first()
            if report:
                report.status = "FAILED"
                db.commit()
                history_helper = ReportEngineService(db)
                duration = str(int((datetime.utcnow() - start_time).total_seconds() * 1000))
                history_helper._log_history(report_id, workspace_id, "FAILED", user_id, duration_ms=duration, stage=stage, error_message=error_msg)
        finally:
            db.close()

    def get_reports(self, workspace_id: str, skip: int = 0, limit: int = 100) -> List[Report]:
        return self.db.query(Report).filter(
            Report.workspace_id == uuid.UUID(workspace_id)
        ).order_by(desc(Report.created_at)).offset(skip).limit(limit).all()
        
    def get_report_history(self, report_id: str, workspace_id: str) -> List[ReportHistory]:
        return self.db.query(ReportHistory).filter(
            ReportHistory.report_id == uuid.UUID(report_id),
            ReportHistory.workspace_id == uuid.UUID(workspace_id)
        ).order_by(desc(ReportHistory.timestamp)).all()

    def get_report_statistics(self, workspace_id: str) -> Dict[str, Any]:
        reports = self.db.query(Report).filter(Report.workspace_id == uuid.UUID(workspace_id)).all()
        scheduled = self.db.query(ScheduledReport).filter(ScheduledReport.workspace_id == uuid.UUID(workspace_id)).all()
        
        total = len(reports)
        failed = sum(1 for r in reports if r.status == "FAILED")
        
        return {
            "total_reports": total,
            "reports_generated": total - failed,
            "scheduled_reports": len(scheduled),
            "failed_reports": failed
        }
