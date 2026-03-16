import React, { useEffect, useRef, useState } from "react";
import WebcamView from "./components/WebcamView";
import FeedbackPanel from "./components/FeedbackPanel";
import { styles } from "./styles/session";
import { FaUsers, FaLightbulb, FaHandshake, FaTrophy, FaMicrophone, FaCheckCircle, FaStar } from "react-icons/fa";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";

const QUESTION_CATEGORIES = {
  "About You": {
    icon: <FaUsers />,
    color: "#4A90E2",
    questions: [
      "Tell me about yourself and your professional background.",
      "What are your greatest strengths and how have you applied them in your career?",
      "Describe a challenging situation you've faced and how you overcame it."
    ]
  },
  "Problem Solving": {
    icon: <FaLightbulb />,
    color: "#7ED321",
    questions: [
      "Walk me through your approach to solving a complex problem.",
      "Describe a time when you had to make a decision with incomplete information.",
      "How do you prioritize when you have multiple competing deadlines?"
    ]
  },
  "Teamwork": {
    icon: <FaHandshake />,
    color: "#50E3C2",
    questions: [
      "Tell me about a time you worked effectively in a team. What was your role?",
      "How do you handle disagreements or conflicts with colleagues?",
      "Describe a time when you had to adapt your communication style to work with different personalities."
    ]
  },
  "Career Goals": {
    icon: <FaTrophy />,
    color: "#F5A623",
    questions: [
      "Where do you see yourself in 5 years, and how does this role fit into your career path?",
      "What motivates you in your professional work?",
      "Describe a goal you set and achieved, and what you learned from the process."
    ]
  }
};

export default function Session() {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [progress, setProgress] = useState(0); // 0: choose category, 1: choose question, 2: record, 3: feedback
  const [score, setScore] = useState(0);

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setCurrentQuestion("");
    setAnalysisData(null);
    setError(null);
    setProgress(1); // Move to question selection
  };

  const selectQuestion = (question) => {
    setCurrentQuestion(question);
    setAnalysisData(null);
    setError(null);
    setProgress(2); // Move to recording
  };

  /* -------------------- BACKEND ANALYSIS -------------------- */
  const handleAnalyse = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      setIsAnalysing(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/analyse`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await response.json();
      setAnalysisData(data);
      
      // Calculate score based on feedback
      let calculatedScore = 50; // Base score
      
      // Adjust based on speech rate (ideal: 120-160 wpm)
      const speechRate = data.speech_rate || 0;
      if (speechRate >= 120 && speechRate <= 160) {
        calculatedScore += 20;
      } else if (speechRate >= 100 && speechRate <= 180) {
        calculatedScore += 10;
      }
      
      // Adjust based on filler words (fewer is better)
      const fillerCount = data.filler_words?.length || 0;
      if (fillerCount === 0) {
        calculatedScore += 20;
      } else if (fillerCount <= 2) {
        calculatedScore += 10;
      } else if (fillerCount <= 5) {
        calculatedScore += 5;
      }
      
      // Cap at 100
      calculatedScore = Math.min(calculatedScore, 100);
      setScore(calculatedScore);
    } catch (err) {
      console.error("Error analyzing audio:", err);
      setError(err.message || "Failed to analyze audio");
    } finally {
      setIsAnalysing(false);
    }
  };

  /* -------------------- RECORDING -------------------- */
  const startRecording = async () => {
    try {
      setError(null);
      setAnalysisData(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: true
      });

      streamRef.current = stream;
      const audioTracks = stream.getAudioTracks();
      const audioStream = new MediaStream(audioTracks);
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType: "audio/webm" });

      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setProgress(2); // Analyzing
        await handleAnalyse(audioBlob);
        setProgress(3); // Feedback
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
    } catch (err) {
      setError("Microphone access denied");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  /* -------------------- CLEANUP -------------------- */
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current?.stop();
    };
  }, []);

  /* -------------------- UI -------------------- */
  return (
    <div style={styles.pageWrapper}>
      <h1 style={styles.title}>Interview Practice Platform</h1>
      <p style={styles.subtitle}>Master your interview skills with AI-powered feedback</p>

      {/* Progress bar - always visible */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          {["Choose Category", "Choose Question", "Record Response", "Review Feedback"].map((step, index) => (
            <div key={step} style={styles.progressStep}>
              <div style={{
                ...styles.progressCircle,
                backgroundColor: progress >= index ? "#28a745" : "#ddd",
                color: progress >= index ? "white" : "#666"
              }}>
                {progress > index ? <FaCheckCircle /> : index + 1}
              </div>
              <span style={styles.progressLabel}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {progress === 0 ? (
        // Roadmap view for first page
        <div style={styles.roadmapContainer}>
          <h2 style={styles.roadmapTitle}>Your Interview Preparation Journey</h2>
          <div style={{...styles.roadmapTrack, width: "100%"}}>
            {Object.entries(QUESTION_CATEGORIES).map(([category, data], index) => (
              <div key={category} style={styles.roadmapItem}>
                <button
                  onClick={() => selectCategory(category)}
                  style={{
                    ...styles.roadmapButton,
                    backgroundColor: data.color,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.08)";
                    e.target.style.boxShadow = "0 12px 32px rgba(0,0,0,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
                  }}
                >
                  <div style={styles.roadmapIcon}>{data.icon}</div>
                  <div style={styles.roadmapButtonText}>{category}</div>
                </button>
                <div style={styles.roadmapDescription}>
                  {index === 0 && "Start with personal introduction questions"}
                  {index === 1 && "Practice analytical thinking questions"}
                  {index === 2 && "Demonstrate collaboration skills"}
                  {index === 3 && "Articulate your career vision"}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Other content when not on first page
        <>
          {progress === 1 && selectedCategory && (
            <div style={styles.categorySelection}>
              <h2 style={{marginBottom: "20px"}}>Select a Question</h2>
              <button
                onClick={() => { setSelectedCategory(""); setProgress(0); }}
                style={{...styles.changeCategoryButton, marginBottom: "30px"}}
              >
                ← Back
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", maxWidth: "900px", margin: "0 auto" }}>
                {QUESTION_CATEGORIES[selectedCategory].questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => selectQuestion(question)}
                    style={{
                      padding: "20px",
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: "2px solid #ccc",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      color: "#333",
                      fontWeight: "400",
                      transition: "all 0.3s ease",
                      textAlign: "left"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = QUESTION_CATEGORIES[selectedCategory].color;
                      e.target.style.boxShadow = `0 6px 16px ${QUESTION_CATEGORIES[selectedCategory].color}20`;
                      e.target.style.transform = "translateX(8px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "#ccc";
                      e.target.style.boxShadow = "none";
                      e.target.style.transform = "translateX(0)";
                    }}
                  >
                    <strong>Question {index + 1}:</strong> {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {progress >= 2 && (
            <>
              <div style={styles.questionCard}>
                <h3 style={{margin: "0 0 15px 0"}}>Your Question</h3>
                <p style={styles.questionText}>{currentQuestion}</p>
                <button
                  onClick={() => { setSelectedCategory(""); setProgress(0); }}
                  style={styles.changeCategoryButton}
                >
                  Back to Categories
                </button>
              </div>

              <div style={styles.containerStyle}>
                <WebcamView />
                {error && <div style={styles.errorBox}>{error}</div>}
                <div style={styles.buttonGroup}>
                  <button
                    onClick={startRecording}
                    disabled={isRecording || isAnalysing}
                    style={{ ...styles.button, opacity: isRecording || isAnalysing ? 0.6 : 1 }}
                    onMouseEnter={(e) => {
                      if (!isRecording && !isAnalysing) {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = "0 6px 20px rgba(255,107,107,0.6)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "0 4px 15px rgba(255,107,107,0.4)";
                    }}
                  >
                    <FaMicrophone style={{ marginRight: "8px" }} />
                    {isRecording ? "Recording..." : "Start Recording"}
                  </button>
                  <button
                    onClick={stopRecording}
                    disabled={!isRecording}
                    style={{ ...styles.button, opacity: !isRecording ? 0.6 : 1 }}
                    onMouseEnter={(e) => {
                      if (isRecording) {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = "0 6px 20px rgba(255,107,107,0.6)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "0 4px 15px rgba(255,107,107,0.4)";
                    }}
                  >
                    Stop Recording
                  </button>
                </div>
                {isAnalysing && <p style={styles.loading}>Analyzing your response...</p>}
              </div>
            </>
          )}

          {progress === 3 && <FeedbackPanel analysisData={analysisData} score={score} />}
        </>
      )}
    </div>
  );
}
