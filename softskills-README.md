# 🎤 Soft Skills Training App

An AI-powered interview practice tool that records your spoken answers, transcribes them, and gives you detailed coaching feedback — including speaking pace, filler word analysis, and a follow-up question to push your thinking further.

---

## Features

- Choose from interview question categories: About You, Problem Solving, Teamwork, Career Goals
- Record your answer via microphone directly in the browser
- Transcription powered by OpenAI Whisper
- AI coaching feedback covering:
  - Speaking pace (words per minute)
  - Filler word detection (um, uh, like, etc.)
  - Clarity, tone, and content structure
  - Strengths and key improvements
- AI-generated follow-up question that challenges your answer
- Webcam view during practice sessions
- Score tracking across questions

---

## Tech Stack

| Area | Technology |
|------|------------|
| Frontend | React |
| Backend | Python / Flask |
| Transcription | OpenAI Whisper |
| Coaching Feedback | OpenAI GPT-4o mini |
| Audio Recording | Browser MediaRecorder API |
| Video | React Webcam |

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- An [OpenAI API key](https://platform.openai.com/api-keys)

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/annie987/softskillstraining.git
cd softskillstraining
```

### 2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxx
AUTH_EMAIL=your@email.com
AUTH_PASSWORD=yourpassword
```

Start the backend:
```bash
python app.py
```
The API will run on `http://localhost:5001`.

### 3. Set up the frontend
```bash
cd frontend
npm install
npm start
```
The app will open at `http://localhost:3000`.

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `backend/.env` | Your OpenAI API key |
| `AUTH_EMAIL` | `backend/.env` | Login email for the app |
| `AUTH_PASSWORD` | `backend/.env` | Login password for the app |
| `REACT_APP_API_URL` | `frontend/.env` | Backend URL (defaults to `http://localhost:5001`) |

---

## Project Structure

```
softskillstraining/
├── backend/
│   ├── app.py              # Flask API (transcription, analysis, login)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── session.jsx         # Main practice session flow
    │   ├── login.jsx           # Login screen
    │   ├── components/
    │   │   ├── WebcamView.jsx  # Webcam display
    │   │   └── FeedbackPanel.jsx # AI feedback display
    │   └── styles/
└── package.json
```

---

## Future Improvements

- Save session history and track progress over time
- More question categories and difficulty levels
- Facial expression analysis via webcam
- Export feedback as PDF report
- Multi-user support with proper authentication
