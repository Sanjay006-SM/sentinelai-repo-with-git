import os
import json
import logging
from typing import Dict, Any
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings

logger = logging.getLogger(__name__)

class AIAnalystService:
    def __init__(self):
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY environment variable is missing.")
        
        self.client = genai.Client(api_key=api_key)

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        before_sleep=lambda retry_state: logger.warning(
            f"Gemini API call failed. Retrying (attempt {retry_state.attempt_number})..."
        )
    )
    def _call_gemini_api(self, prompt: str) -> str:
        # Note: the new SDK config format
        response = self.client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return response.text

    def call_llm(self, prompt: str) -> Dict[str, Any]:
        """
        Calls Gemini 3.5 Flash with retry and timeout constraints, returning the parsed JSON.
        """
        logger.info("Calling Gemini 3.5 Flash for identity investigation...")
        raw_response = ""
        try:
            raw_response = self._call_gemini_api(prompt)
            if not raw_response:
                raise ValueError("Received empty response from Gemini API.")
            
            # Parse the JSON response
            parsed_response = json.loads(raw_response)
            
            # Validate output keys
            required_keys = ["executive_summary", "risk_assessment", "attack_path_analysis", "findings", "recommendations"]
            for key in required_keys:
                if key not in parsed_response:
                    parsed_response[key] = "" if "analysis" in key or "summary" in key or "assessment" in key else []
            
            return parsed_response
            
        except Exception as e:
            logger.error(f"Error in AIAnalystService: {e}", exc_info=True)
            raise ValueError(f"AI Analysis Failed: {str(e)}")

