import React from "react";

const panelStyles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    border: "1px solid #ddd",
    padding: "30px",
    borderRadius: "12px",
    minHeight: "150px",
    backgroundColor: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    overflowY: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  transcript: {
    textAlign: "left",
    width: "100%",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: "1.7",
    fontSize: "15px",
    color: "#333",
  },
  placeholder: {
    color: "#999",
    fontSize: "14px",
  },
};

export default function FeedbackPanel({ analysisData, score }) {
  return (
    <div style={panelStyles.container}>
      {analysisData ? (
        <>
          {/* Score Display */}
          <div style={{
            textAlign: "center",
            marginBottom: "30px",
            padding: "25px",
            backgroundColor: score >= 80 ? "#d4edda" : score >= 60 ? "#fff3cd" : "#f8d7da",
            borderRadius: "12px",
            border: `2px solid ${score >= 80 ? "#28a745" : score >= 60 ? "#ffc107" : "#dc3545"}`,
            width: "100%"
          }}>
            <h2 style={{ margin: "0 0 12px 0", color: score >= 80 ? "#155724" : score >= 60 ? "#856404" : "#721c24", fontSize: "28px" }}>
              Your Score: {score}/100
            </h2>
            <div style={{ fontSize: "16px", fontWeight: "500", color: score >= 80 ? "#155724" : score >= 60 ? "#856404" : "#721c24" }}>
              {score >= 80 ? "Excellent! You're interview-ready!" : 
               score >= 60 ? "Good job! Room for improvement." : 
               "Keep practicing! You've got this!"}
            </div>
          </div>
          
          <div style={panelStyles.transcript}>
            <strong>Transcript</strong>
            <p style={{ marginTop: "10px", color: "#555" }}>{analysisData.transcript}</p>
            
            {analysisData.speed != null && (
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #ddd" }}>
                <strong>Speaking Rate</strong>
                <p style={{ marginTop: "8px", color: "#555" }}>{analysisData.speed} words per minute</p>
              </div>
            )}
            
            {analysisData.fillers && (
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #ddd" }}>
                <strong>Filler Words Detected</strong>
                <ul style={{ margin: "10px 0 0 20px", color: "#555" }}>
                  {Object.entries(analysisData.fillers).map(([word, count]) => (
                    <li key={word} style={{ marginBottom: "6px" }}>
                      <strong>{word}</strong>: {count} {count === 1 ? "occurrence" : "occurrences"}
                    </li>
                  ))}
                </ul>
                <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                  Total filler words: {analysisData.totalFillers ?? 0}
                </p>
              </div>
            )}
            
            {analysisData.coachFeedback && (
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #ddd" }}>
                <strong>Coaching Feedback</strong>
                <div style={{ marginTop: "12px", whiteSpace: "pre-wrap", lineHeight: "1.7", color: "#555", backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "8px" }}>
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
