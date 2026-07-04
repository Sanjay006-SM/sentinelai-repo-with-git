import os
import sys

key = os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY")
try:
    from google import genai
    client = genai.Client(api_key=key)
    response = client.models.generate_content(
        model='gemini-3.5-flash',
        contents='say hello',
    )
    print("New SDK Success:", response.text)
except Exception as e:
    print("New SDK Error:", e)

