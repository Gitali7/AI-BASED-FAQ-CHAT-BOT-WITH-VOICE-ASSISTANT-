# 🤖 AI-Based FAQ Chatbot with Voice Assistant

![Aurora UI](https://img.shields.io/badge/UI-Aurora_Glassmorphism-blueviolet) ![Voice Enabled](https://img.shields.io/badge/Voice-Web_Speech_API-success) ![AI Power](https://img.shields.io/badge/AI-Google_Gemini-orange)

An intelligent, voice-enabled FAQ assistant that provides concise, accurate answers using Google's Gemini AI. Features a stunning "Aurora" glassmorphism interface, real-time voice visualization, and natural speech synthesis.

## 🌟 Features

*   **🎙️ Voice-First Interface**: Speak completely naturally to the AI.
*   **🧠 Advanced AI**: Powered by **Google Gemini 2.5 Flash / 1.5 Flash** for smart, context-aware responses.
*   **🎨 Stunning UI**: "Deep Space Aurora" theme with glassmorphism, glowing orbs, and dynamic gradients.
*   **📊 Audio Visualizer**: Real-time frequency bars that react to your voice pitch and volume.
*   **🔊 Text-to-Speech**: The AI reads answers back to you with a fast, natural voice.
*   **⚡ Smart Fallback**: Automatically switches between AI models to ensure 100% uptime.

---

## 🏗️ System Architecture

The system follows a modern 3-Layer Architecture:

```mermaid
graph TD
    subgraph Frontend ["Frontend Layer (Browser)"]
        UI[User Interface (HTML/CSS)]
        MIC[Microphone Input] <--> WS[Web Speech API]
        VIS[Canvas Visualizer]
        TTS[Text-to-Speech Output]
    end

    subgraph Backend ["Backend Layer (Flask/Python)"]
        SRV[Flask Server]
        LOG[Logic & Prompt Engineering]
        EXC[Error Handling]
    end

    subgraph Cloud ["AI & Cloud Layer"]
        GEM[Google Gemini API]
    end

    UI --> MIC
    MIC --> WS
    WS -->|Transcript| UI
    UI -->|JSON Request| SRV
    SRV --> LOG
    LOG -->|API Call| GEM
    GEM -->|Generative Text| LOG
    LOG -->|JSON Response| UI
    UI --> TTS
    MIC -.->|Audio Stream| VIS
```

### Workflow
1.  **Input**: User speaks or types a question.
2.  **Visualization**: If speaking, the canvas renders real-time audio frequency bars.
3.  **Processing**: Browser converts speech to text (Speech-to-Text).
4.  **Backend**: Flask receives the text, selects the best available Gemini model, and sends a strictly prompted request.
5.  **AI Generation**: Gemini generates a concise, one-paragraph answer.
6.  **Output**: Backend sends the text back. The browser displays it and reads it aloud (Text-to-Speech).

---

## 📂 Project Structure

| File | Description |
| :--- | :--- |
| **`app.py`** | **The Brain.** Flask server handling routing, API key validation, model selection, and API communication. |
| **`templates/index.html`** | **The Body.** Structure of the chat interface, sidebar, and visualizer canvas. |
| **`static/style.css`** | **The Look.** Contains the 'Aurora' animations, glassmorphism effects, and responsive layout rules. |
| **`static/script.js`** | **The Nerves.** Handles microphone logic, audio visualization (Canvas API), API fetch calls, and speech synthesis. |
| **`.env`** | **Secrets.** Stores the `GEMINI_API_KEY` securely. |
| **`requirements.txt`** | **Dependencies.** List of Python libraries needed (`flask`, `requests`, `python-dotenv`). |

---

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Gitali7/AI-BASED-FAQ-CHAT-BOT-WITH-VOICE-ASSISTANT-.git
cd AI-FAQ-Chatbot
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure API Key
Create a `.env` file and add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Run the Application
```bash
python app.py
```
Open your browser and visit: `http://127.0.0.1:5000`

---

## 🛠️ Technologies Used
*   **Python (Flask)**: Backend server.
*   **JavaScript (Vanilla)**: Frontend logic.
*   **HTML5 & CSS3**: Visuals and animations.
*   **Web Speech API**: Native browser speech recognition & synthesis.
*   **Google Gemini API**: LLM intelligence.
