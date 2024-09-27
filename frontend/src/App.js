import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/pages/home';
import Agent from './components/pages/agent';
const App = () => {
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');

    // useEffect(() => {
    //     const newSocket = io('http://127.0.0.1:8000', {
    //         transports: ['websocket'],
    //         upgrade: false,
    //     });

    //     newSocket.on('connect', () => {
    //         console.log('Connected to the server');
    //         setConnectionStatus('Connected');
    //     });

    //     newSocket.on('connect_error', (error) => {
    //         console.error('Connection error:', error);
    //         setConnectionStatus('Error connecting');
    //     });

    //     newSocket.on('disconnect', () => {
    //         console.log('Disconnected from the server');
    //         setConnectionStatus('Disconnected');
    //     });

    //     newSocket.on('message', (data) => {
    //         console.log('Received message from server:', data);
    //     });

    //     newSocket.on('connection_established', (data) => {
    //         console.log('Server confirmed connection:', data);
    //     });

    //     setSocket(newSocket);

    //     return () => {
    //         newSocket.disconnect();
    //     };
    // }, []);

    // const sendMessage = () => {
    //     if (socket) {
    //         socket.emit('ask_question', 'What is your question?');
    //     } else {
    //         console.error('Socket not connected');
    //     }
    // };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/agent" element={<Agent />} />
            </Routes>
        </Router>
    );
};

export default App;