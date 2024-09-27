import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

const Agent = () => {
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorder = useRef(null);

  useEffect(() => {
    // Simulating agent asking a question
    setQuestion("What's your favorite color?");
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      const audioChunks = [];
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      setIsListening(true);
      mediaRecorder.current.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopListening = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6">VoiceAgent</h1>
      
      {question && (
        <div className="text-xl mb-8 text-center max-w-2xl">
          <p>{question}</p>
        </div>
      )}

      <div className="relative mb-8">
        <div className="w-64 h-64 rounded-full bg-blue-500 flex items-center justify-center">
          {/* Animated bars */}
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="w-2 mx-1 bg-white rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 50 + 20}%`,
                animationDelay: `${index * 0.15}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <button
        onClick={isListening ? stopListening : startListening}
        className={`flex items-center justify-center px-6 py-3 rounded-full text-lg font-semibold transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isListening
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <Mic className="mr-2" size={24} />
        {isListening ? 'Stop' : 'Tap to Speak'}
      </button>

    </div>
  );
};

export default Agent;
