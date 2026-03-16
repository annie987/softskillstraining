import React from "react";
import Webcam from "react-webcam";

const webcamStyle = {
  width: "100%",
  maxWidth: "500px",
  borderRadius: "8px",
  aspectRatio: "16 / 9",
};

export default function WebcamView() {
  return (
    <Webcam
      audio={false}
      videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
      style={webcamStyle}
    />
  );
}
