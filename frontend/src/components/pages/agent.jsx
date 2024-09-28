import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play } from 'lucide-react';
import { useParams } from 'react-router-dom';
import TextToSpeech from '../deepgram-service/textToSpeech';
import { API_URL } from '../constants';
import io from 'socket.io-client';

const Agent = () => {
    const [question, setQuestion] = useState(null);
    const [displayedQuestion, setDisplayedQuestion] = useState('');
    const [questionId, setQuestionId] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [userName, setUserName] = useState('');
    const [clientAudioUrl, setClientAudioUrl] = useState('');
    const [showUI, setShowUI] = useState(false);
    const mediaRecorder = useRef(null);
    const { userId } = useParams();
    const { getAudio, audioUrl, loading, error, setAudioUrl } = TextToSpeech();
    const [audioPlaying, setAudioPlaying] = useState(true);
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [socketLoading, setSocketLoading] = useState(true);

    useEffect(() => {
        if (showUI) {
            if(question){
                getAudio(question);
            }
            if (connectionStatus !== 'Connected' && connectionStatus !== 'DisconnectedByServer') {
                const newSocket = io(`${API_URL}?userId=${userId}`, {
                    transports: ['websocket', 'polling'],
                    upgrade: false,
                });

                newSocket.on('connection_established', (message) => {
                    setQuestion(message.question);
                    setQuestionId(message.question_id);
                    setUserName(message.user_name);
                    setConnectionStatus('Connected');
                    setSocketLoading(false);

                    if (!message.question_id){
                        newSocket.disconnect();
                    }
                });

                newSocket.on('send_question', (message) => {
                    setQuestion(message.question);
                    setQuestionId(message.question_id);
                    setSocketLoading(false);
                });

                newSocket.on('conversation_concluded', (message) => {
                    setQuestion(message.conclusion);
                    setSocketLoading(false);
                    newSocket.disconnect();
                });

                newSocket.on('user_not_found_message', (message) => {
                    setQuestion(message.message);
                    setSocketLoading(false);
                    newSocket.disconnect();
                    setConnectionStatus('DisconnectedByServer');
                });

                newSocket.on('disconnect', (reason) => {
                    console.log(`Disconnected from the server due to: ${reason}`);
                    setConnectionStatus('DisconnectedByServer');
                });
                setSocket(newSocket);
            }
        }
    }, [question, showUI]);

    useEffect(() => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            setAudioPlaying(true);
            console.log('Playing audio');
            
            let index = 0;
            const intervalId = setInterval(() => {
                if (index <= question.length) {
                    setDisplayedQuestion(question.slice(0, index));
                    index++;
                } else {
                    clearInterval(intervalId);
                }
            }, 45);

            audio.play().catch(error => {
                console.error("Error playing audio:", error);
            })

            audio.onended = () => {
                console.log('Audio playback finished');
                setAudioPlaying(false);
                setDisplayedQuestion(question);
                if (connectionStatus === 'DisconnectedByServer') {
                    setTimeout(() => {
                        setShowUI(false);
                        setQuestion(null);
                        setQuestionId(null);
                        setAudioUrl(null);
                    }, 1000);
                }
            };

            return () => clearInterval(intervalId);
        }
    }, [audioUrl]);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);

            const audioChunks = [];
            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const clientAudioUrl = URL.createObjectURL(audioBlob);
                setClientAudioUrl(clientAudioUrl);

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result; // Base64 encoded audio file
                    if (socket) {
                        console.log('Emitting get_answer event');
                        socket.emit('get_answer', { userId, audio: base64Audio, "prevQuestionId": questionId, "prevQuestion": question, userName });
                        setTimeout(() => {
                            setSocketLoading(true);
                        }, 1000);
                    } else {
                        console.error('Socket not connected');
                    }
                };

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

    const handleStart = () => {
        setShowUI(true);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-4xl font-bold mb-6">Evva Health VoiceAgent</h1>

            {!showUI ? (
                <button
                    onClick={handleStart}
                    className="flex items-center justify-center px-6 py-3 rounded-full text-lg font-semibold bg-green-600 hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <Play className="mr-2" size={24} />
                    Start
                </button>
            ) : (
                <>
                    {displayedQuestion && (
                        <div className="text-xl mb-8 text-center max-w-2xl">
                            <p>{displayedQuestion}</p>
                        </div>
                    )}

                    <div className="relative mb-8">
                        <div className={`w-64 h-64 rounded-full ${loading || socketLoading || (!isListening & !audioPlaying) ? 'bg-blue-700' : 'bg-blue-500'} flex items-center justify-center transition-all duration-300`}>
                            {/* Animated bars / loader */}
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 mx-1 bg-white rounded-full ${loading || socketLoading || (!isListening & !audioPlaying) ? 'animate-pulse' : 'animate-bounce'}`}
                                    style={{
                                        height: `${Math.random() * 50 + 5}%`,
                                        animationDelay: `${index * 0.15}s`,
                                        animationDuration: loading || socketLoading || (!isListening & !audioPlaying) ? '1s' : '0.6s'
                                    }}
                                ></div>
                            ))}
                        </div>
                        {(loading || socketLoading) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-48 border-t-4 border-blue-300 border-solid rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {loading || socketLoading ? (
                        <p className="text-lg mb-4">The agent is thinking...</p>
                    ) : (
                        <button
                            onClick={isListening ? stopListening : startListening}
                            disabled={audioPlaying}
                            className={`flex items-center justify-center px-6 py-3 rounded-full text-lg font-semibold transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isListening
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            } ${audioPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Mic className={`mr-2 ${audioPlaying ? 'text-gray-400' : 'text-white'}`} size={24} />
                            {isListening ? 'Stop' : (audioPlaying ? 'Please wait...' : 'Tap to Speak')}
                        </button>
                    )}
                    {audioPlaying && !loading && !socketLoading && (
                        <div className="mt-2 text-sm text-gray-300 animate-pulse">
                            Audio is playing. You can speak when it finishes.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Agent;