import React from "react";

const panelStyles = {
  container: {
    maxWidth: "980px",
    margin: "0 auto",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "30px",
    borderRadius: "18px",
    minHeight: "180px",
    backgroundColor: "rgba(10, 18, 32, 0.9)",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    overflowY: "auto",
    boxShadow: "0 14px 38px rgba(0,0,0,0.35)",
  },
  followUpCard: {
    width: "100%",
    padding: "20px",
    marginBottom: "16px",
    background: "rgba(24, 32, 54, 0.92)",
    borderRadius: "14px",
    border: "1px solid rgba(14, 165, 233, 0.3)",
    boxShadow: "0 14px 28px rgba(0,0,0,0.25)",
  },
  followUpLabel: {
    fontSize: "14px",
    marginBottom: "10px",
    color: "#0ea5e9",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    fontWeight: 700,
  },
  followUpText: {
    margin: "0 0 16px 0",
    color: "rgba(255,255,255,0.85)",
    lineHeight: "1.65",
    fontSize: "15px",
  },
  followUpButton: {
    padding: "12px 18px",
    backgroundColor: "rgba(14, 165, 233, 0.95)",
    color: "#010f1b",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    letterSpacing: "0.3px",
    transition: "transform 160ms ease, box-shadow 160ms ease",
  },
  scoreCard: {
    width: "100%",
    padding: "24px",
    borderRadius: "16px",
    border: "2px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(15, 25, 40, 0.85)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  },
  scoreTitle: {
    margin: "0 0 12px 0",
    fontSize: "28px",
  },
  scoreSubtitle: {
    fontSize: "16px",
    fontWeight: "500",
  },
  transcript: {
    textAlign: "left",
    width: "100%",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: "1.7",
    fontSize: "15px",
    color: "rgba(255,255,255,0.85)",
  },
  section: {
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
  },
  sectionTitle: {
    margin: "0 0 10px 0",
    color: "rgba(255,255,255,0.85)",
    fontSize: "15px",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },
  sectionText: {
    margin: 0,
    color: "rgba(255,255,255,0.8)",
    lineHeight: "1.6",
    fontSize: "14px",
  },
  list: {
    margin: "10px 0 0 20px",
    color: "rgba(255,255,255,0.8)",
  },
};

export default function FeedbackPanel({ analysisData, score, onFollowUp }) {
  const getScoreColor = () => {
    if (score >= 8) return "#22c55e";
    if (score >= 6) return "#fbbf24";
    return "#ef4444";
  };

  const getScoreMessage = () => {
    if (score >= 8) return "Strong performance — keep sharpening.";
    if (score >= 6) return "Decent, but you need to tighten up.";
    return "Needs improvement — focus on clarity and relevance.";
  };

  return (
    <div style={panelStyles.container}>
      {analysisData ? (
        <>
          {analysisData.followUpQuestion && (
            <div style={panelStyles.followUpCard}>
              <div style={panelStyles.followUpLabel}>Pushback Challenge</div>
              <p style={panelStyles.followUpText}>{analysisData.followUpQuestion}</p>
              <button
                style={panelStyles.followUpButton}
                onClick={onFollowUp}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 14px 26px rgba(14, 165, 233, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Ask this follow-up
              </button>
            </div>
          )}

          <div style={panelStyles.scoreCard}>
            <h2 style={{ ...panelStyles.scoreTitle, color: getScoreColor() }}>
              Your Score: {score}/10
            </h2>
            <div style={{ ...panelStyles.scoreSubtitle, color: getScoreColor() }}>
              {getScoreMessage()}
            </div>
          </div>

          <div style={panelStyles.transcript}>
            <strong>Transcript</strong>
            <p style={{ marginTop: "10px", color: "rgba(255,255,255,0.75)" }}>
              {analysisData.transcript}
            </p>

            {analysisData.speed != null && (
              <div style={panelStyles.section}>
                <div style={panelStyles.sectionTitle}>Speaking Rate</div>
                <p style={panelStyles.sectionText}>{analysisData.speed} words per minute</p>
              </div>
            )}

            {analysisData.fillers && (
              <div style={panelStyles.section}>
                <div style={panelStyles.sectionTitle}>Filler Words Detected</div>
                <ul style={panelStyles.list}>
                  {Object.entries(analysisData.fillers).map(([word, count]) => (
                    <li key={word} style={{ marginBottom: "6px" }}>
                      <strong>{word}</strong>: {count} {count === 1 ? "occurrence" : "occurrences"}
                    </li>
                  ))}
                </ul>
                <p style={{ ...panelStyles.sectionText, marginTop: "10px" }}>
                  Total filler words: {analysisData.totalFillers ?? 0}
                </p>
              </div>
            )}

            {analysisData.coachFeedback && (
              <div style={panelStyles.section}>
                <div style={panelStyles.sectionTitle}>Coaching Feedback</div>
                <div style={{ ...panelStyles.sectionText, whiteSpace: "pre-wrap" }}>
                  {analysisData.coachFeedback}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <p style={panelStyles.placeholder}>No analysis yet. Record and submit to see results.</p>
      )}
    </div>
  );
}
