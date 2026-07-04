from typing import Dict, Any, List
from app.services.storage.storage_provider import StorageProvider, LocalStorageProvider
import json
import csv
import io
import zipfile

class ReportStorage:
    def __init__(self, provider: StorageProvider = None):
        self.provider = provider or LocalStorageProvider()

    def save_pdf(self, workspace_id: str, report_id: str, pdf_bytes: bytes) -> str:
        """Saves the PDF and returns its URI."""
        path = f"reports/{workspace_id}/{report_id}/executive_report.pdf"
        return self.provider.save(path, pdf_bytes)

    def save_csv(self, workspace_id: str, report_id: str, filename: str, data: List[Dict[str, Any]]) -> str:
        """Saves a CSV file and returns its URI."""
        if not data:
            return ""
            
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        
        path = f"reports/{workspace_id}/{report_id}/{filename}"
        return self.provider.save(path, output.getvalue())

    def save_csv_zip(self, workspace_id: str, report_id: str, filename: str, datasets: Dict[str, List[Dict[str, Any]]]) -> str:
        """Saves multiple datasets into a single zip file containing CSVs."""
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for name, data in datasets.items():
                if not data:
                    continue
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
                zip_file.writestr(f"{name}.csv", output.getvalue())
        
        path = f"reports/{workspace_id}/{report_id}/{filename}"
        return self.provider.save(path, zip_buffer.getvalue())

    def save_json(self, workspace_id: str, report_id: str, filename: str, data: Dict[str, Any]) -> str:
        """Saves a JSON file and returns its URI."""
        path = f"reports/{workspace_id}/{report_id}/{filename}"
        return self.provider.save(path, json.dumps(data, indent=2))
        
    def get_file(self, file_path: str) -> bytes:
        # file_path might be absolute or relative depending on provider. For local it's relative.
        # Normalize path separators
        file_path = file_path.replace("\\", "/")
        
        # Our get_uri returns storage/reports/... so we strip "storage/"
        if file_path.startswith("storage/"):
            file_path = file_path[len("storage/"):]
            
        return self.provider.get(file_path)
