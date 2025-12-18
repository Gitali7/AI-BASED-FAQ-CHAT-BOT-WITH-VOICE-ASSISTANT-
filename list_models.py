import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    api_key = api_key.strip()

if not api_key:
    print("Error: API Key not found in .env")
    exit()

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        models = response.json().get('models', [])
        print("Available Models:")
        for m in models:
            if "generateContent" in m.get("supportedGenerationMethods", []):
                print(f"- {m['name']} (Display: {m.get('displayName')})")
    else:
        print(f"Error fetching models: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
