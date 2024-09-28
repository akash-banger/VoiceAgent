import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/pages/home';
import Agent from './components/pages/agent';
const App = () => {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/agent/:userId" element={<Agent />} />
            </Routes>
        </Router>
    );
};

export default App;