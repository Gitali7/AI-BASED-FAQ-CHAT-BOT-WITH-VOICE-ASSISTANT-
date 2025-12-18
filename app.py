import os
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Gemini API Key with whitespace cleaning
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    GEMINI_API_KEY = GEMINI_API_KEY.strip()

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in .env file. Please add it.")

# List of models to try in order
# List of models to try in order (Verified available models)
MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    if not GEMINI_API_KEY or "PASTE" in GEMINI_API_KEY:
        return jsonify({"response": "⚠️ Error: Invalid API Key. Please update .env file."}), 500

    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"response": "Please say something."}), 400

    # Updated Prompt: Balanced Paragraph Answer
    system_instruction = (
        "You are Nova. Answer in **one clear, concise paragraph** (about 3-4 sentences). "
        "Provide enough detail to be helpful and accurate, but keep it natural for speech. "
        "Do not use bullet points or complex formatting."
    )

    # Try models in order
    for model_name in MODELS_TO_TRY:
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": user_message}]}],
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 150}
        }
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(api_url, json=payload, headers=headers)
            
            # rate limit check
            if response.status_code == 429:
                if model_name == MODELS_TO_TRY[-1]:
                    return jsonify({"response": "⚠️ Usage Limit Reached. Please wait a minute and try again."}), 429
                continue

            response_data = response.json()

            # Success Case
            if "candidates" in response_data:
                try:
                    bot_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
                    return jsonify({"response": bot_text})
                except (KeyError, IndexError):
                    pass # Try next model if empty response

            # If error, check if it's a model not found error
            if "error" in response_data:
                err_message = response_data['error'].get('message', '')
                print(f"Model {model_name} failed: {err_message}")
                
                if "Quota" in err_message or "429" in str(err_message):
                     if model_name == MODELS_TO_TRY[-1]:
                        return jsonify({"response": "⚠️ Daily Quote Exceeded. Please try again tomorrow or use a different key."}), 429
                     continue

                # If it's the last model, return the error
                if model_name == MODELS_TO_TRY[-1]:
                    return jsonify({"response": f"⚠️ API Error: {err_message}"}), 500
                continue # Try next model

                
        except Exception as e:
            print(f"Network Error with {model_name}: {e}")
            if model_name == MODELS_TO_TRY[-1]:
                 return jsonify({"response": "⚠️ Connection Failed. Check internet."}), 500

    return jsonify({"response": "⚠️ No suitable AI model found for your key."}), 500

if __name__ == '__main__':
    app.run(debug=True)
