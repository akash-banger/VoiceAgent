import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const App = () => {
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');

    useEffect(() => {
        const newSocket = io('http://127.0.0.1:8000', {
            transports: ['websocket'],
            upgrade: false,
        });

        newSocket.on('connect', () => {
            console.log('Connected to the server');
            setConnectionStatus('Connected');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectionStatus('Error connecting');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from the server');
            setConnectionStatus('Disconnected');
        });

        newSocket.on('message', (data) => {
            console.log('Received message from server:', data);
        });

        newSocket.on('connection_established', (data) => {
            console.log('Server confirmed connection:', data);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const sendMessage = () => {
        if (socket) {
            socket.emit('ask_question', 'What is your question?');
        } else {
            console.error('Socket not connected');
        }
    };

    return (
        <div>
            <h1>Socket.IO with FastAPI</h1>
            <p>Connection status: {connectionStatus}</p>
            <button onClick={sendMessage}>Ask Question</button>
        </div>
    );
};

export default App;