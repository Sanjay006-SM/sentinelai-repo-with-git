import json
from typing import Dict, Any
from app.services.ingestion_sources.base import IngestionSource

class FileUploadSource(IngestionSource):
    """
    Ingestion source for manually uploaded CloudTrail JSON files.
    """
    def __init__(self, file_content: bytes, filename: str = "unknown"):
        self.file_content = file_content
        self.filename = filename

    def fetch_events(self) -> Dict[str, Any]:
        """
        Parses the raw file content into a JSON dictionary.
        Raises ValueError if the content is empty or malformed.
        """
        if not self.file_content:
            raise ValueError("Uploaded file is empty.")
        try:
            # Decode using utf-8-sig to automatically strip BOM if present
            decoded_content = self.file_content.decode('utf-8-sig')
            json_data = json.loads(decoded_content)
            return json_data
        except json.JSONDecodeError as e:
            preview = self.file_content[:100]
            raise ValueError(f"Malformed JSON upload file. Content preview: {preview}")

    def get_source_metadata(self) -> Dict[str, Any]:
        return {
            "sourceType": "FileUpload",
            "identifier": self.filename
        }
