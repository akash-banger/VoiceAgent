import React, { useState, useEffect } from "react";
import { createClient } from "@deepgram/sdk";

const TextToSpeech = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const getAudio = async (text) => {
    setLoading(true);
    setError(null);

    const requestBody = {
      text
    };

    console.log("Request Body:", JSON.stringify(requestBody));

    try {
      const response = await fetch("https://api.deepgram.com/v1/speak?model=aura-arcas-en", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REACT_APP_DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Response:", errorData);
        throw new Error("Error generating audio");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error("Error generating audio:", err);
      setError("Failed to generate audio");
    } finally {
      setLoading(false);
    }
  };

  return {
    getAudio,
    loading,
    error,
    audioUrl,
    setAudioUrl,
  };
};

export default TextToSpeech;
