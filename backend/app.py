from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import io
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()
app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Use env for credentials
VALID_USER = {
    "email": os.getenv("AUTH_EMAIL", "test@example.com"),
    "password": os.getenv("AUTH_PASSWORD", "123456")
}

ALLOWED_EXTENSIONS = {"flac", "m4a", "mp3", "mp4", "mpeg", "mpga", "oga", "ogg", "wav", "webm"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_speech_rate(transcript, duration_seconds):
    """Calculate speaking rate in words per minute."""
    if duration_seconds == 0:
        return 0
    word_count = len(transcript.split())
    minutes = duration_seconds / 60
    return round(word_count / minutes) if minutes > 0 else 0


def generate_follow_up_question(transcript):
    """Generate a follow-up question that digs deeper and challenges an assumption."""

    follow_up_prompt = (
        "You are a demanding interviewer who pushes back politely. "
        "Read the candidate's response below and generate a single follow-up question that:\n"
        "- challenges their assumptions,\n"
        "- asks them to defend or justify an assertion,\n"
        "- and forces them to explain the impact of their statement.\n\n"
        "Answer with exactly one direct question; do not add commentary.\n\n"
        f"Candidate response: {transcript}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional interviewer who challenges assumptions."},
                {"role": "user", "content": follow_up_prompt},
            ],
            temperature=0.7,
            max_tokens=80,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return None

@app.route('/login', methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "message": "Invalid JSON"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    if email == VALID_USER["email"] and password == VALID_USER["password"]:
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": "jwt-token-placeholder"
        })

    return jsonify({"success": False, "message": "Invalid email or password"}), 401


@app.route("/api/analyse", methods=["POST"])
def analyse():
    if "file" not in request.files:
        return jsonify({"error": "No file in request"}), 400

    audio_file = request.files["file"]

    if audio_file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(audio_file.filename):
        return jsonify({"error": f"Unsupported format. Use: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    try:
        audio_bytes = io.BytesIO(audio_file.read())
        audio_bytes.seek(0)
        audio_bytes.name = audio_file.filename

        transcript_obj = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_bytes
        )

        transcript_text = transcript_obj.text
        # Estimate duration from file size (rough approximation)
        audio_bytes.seek(0)
        file_size = len(audio_bytes.read())
        estimated_duration = file_size / 16000  # Rough estimate

        speed = calculate_speech_rate(transcript_text, estimated_duration)

        # Basic filler word analysis (whole words only, not substrings)
        import re
        filler_words = ["um", "uh", "like", "you know", "actually", "basically", "right", "so"]
        lower = transcript_text.lower()
        filler_counts = {}
        for word in filler_words:
            # Use word boundaries to match whole words only
            pattern = r'\b' + re.escape(word) + r'\b'
            count = len(re.findall(pattern, lower))
            filler_counts[word] = count
        total_fillers = sum(filler_counts.values())

        # Coaching feedback via OpenAI text model
        coach_prompt = (
            "You are a professional communication coach for consultants preparing for client interviews. "
            "Analyze the transcript and provide DETAILED, ACTIONABLE feedback in the following structure:\n\n"
            "1. **Overall Performance** (1-2 sentences summary)\n"
            "2. **Speaking Pace** (was it too fast/slow? Ideal is 120-150 wpm for interviews)\n"
            "3. **Filler Words** (list specific examples, suggest alternatives)\n"
            "4. **Clarity & Tone** (was it clear? Too quiet/loud? Professional tone?)\n"
            "5. **Content Structure** (did they stay on topic? Logical flow?)\n"
            "6. **Key Improvements** (3-4 specific, prioritized tips)\n"
            "7. **Strengths** (what they did well)\n\n"
            "Be encouraging but honest. Use bullet points. Keep it concise but detailed.\n\n"
            f"Transcript: {transcript_text}\n"
            f"Speaking Rate: {speed} words per minute\n"
            f"Filler Words Used: {', '.join([f'{k} ({v})' for k,v in filler_counts.items() if v > 0])}"
        )

        coach_feedback = None
        try:
            coach_resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful coaching assistant."},
                    {"role": "user", "content": coach_prompt},
                ],
                temperature=0.3,
                max_tokens=500,
            )
            coach_feedback = coach_resp.choices[0].message.content
        except Exception:
            coach_feedback = None

        follow_up_question = generate_follow_up_question(transcript_text)

        return jsonify({
            "transcript": transcript_text,
            "speed": speed,
            "fillers": filler_counts,
            "totalFillers": total_fillers,
            "coachFeedback": coach_feedback,
            "followUpQuestion": follow_up_question,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"{e.__class__.__name__}: {str(e)}"}), 500


if __name__ == '__main__':
    debug_mode = os.getenv("FLASK_DEBUG", "True") == "True"
    app.run(debug=debug_mode, port=5001)
