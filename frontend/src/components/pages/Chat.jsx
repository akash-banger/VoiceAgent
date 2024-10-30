import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../../constants';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import AutoSimHubLogo from './AutoSimHub.png';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
    const { userId } = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('New Product Introduction Department');
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const newSocket = io(API_URL, {
      query: { userId }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join_chat', { userId });
    });

    newSocket.on('message_response', (data) => {
      setIsLoading(false);
      if (data.message.trim() && !data.message.startsWith('""')) {
        console.log(data);
        if (data.type !== 'user') {
          setMessages(prev => [...prev, {
            type: data.type,
            user: data.type === 'system' ? 'System' : `${data.user}`,
            message: data.message
          }]);
        }
      }
    });

    newSocket.on('message_response_user', (data) => {
      if (data.message.trim() && !data.message.startsWith('""')) {
        setIsLoading(false);
        setMessages(prev => [...prev, {
          type: data.userId === userId ? 'user' : 'other_user',
          user: `${data.username} (${data.role})`,
          message: data.message
        }]);
      }
    });

    newSocket.on('simulation_reset', (data) => {
      setMessages([{
        type: 'system',
        user: 'System',
        message: data.message
      }]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && socket) {
      const userMessage = {
        type: 'user',
        user: `${username} (${selectedRole})`,
        message: inputMessage
      };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      socket.emit('chat_message', {
        userId,
        message: inputMessage,
        role: selectedRole,
        username
      });
      setInputMessage('');
    }
  };

  const resetSimulation = (e) => {
    e.preventDefault();
    socket.emit('reset_simulation_event', { data: { userId } });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 flex flex-col">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto w-full mb-8"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <motion.img 
              whileHover={{ scale: 1.1 }}
              src={AutoSimHubLogo} 
              alt="AutoSimHub Logo" 
              className="w-16 h-16 drop-shadow-lg"
            />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              AutoSimHub
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTutorial(true)}
            className="bg-indigo-600/80 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Tutorial
          </motion.button>
        </div>

        {/* Tutorial Modal */}
        <AnimatePresence>
          {showTutorial && (
            <>
              <motion.div
                position="fixed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setShowTutorial(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700/50 z-50"
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    Department Overview
                  </h2>
                  <button
                    onClick={() => setShowTutorial(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {[1, 2, 3, 4, 5].map((num) => (
                  <motion.div
                    key={num}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: num * 0.1 }}
                    className="mb-6 last:mb-0"
                  >
                    <h3 className="text-xl font-semibold text-indigo-400 mb-2">
                      {num === 1 && "Production Department"}
                      {num === 2 && "New Product Introduction (NPI) Department"}
                      {num === 3 && "Design Department"}
                      {num === 4 && "Quality Control Department"}
                      {num === 5 && "Materials Department"}
                    </h3>
                    <div className="text-gray-300 bg-gray-700/50 p-4 rounded-xl">
                      {/* Content for each department */}
                      {num === 1 && "The Transmission Assembly Line experiences frequent bottlenecks at the Torque Converter Assembly Station, causing average delays of 30 minutes during peak hours, which reduces throughput by 15%. Each torque converter requires between 8 to 12 minutes to assemble, and machine downtimes of approximately 12 hours monthly further hinder production. The current scheduling doesn’t account for these variable processing times, impacting overall efficiency. A discrete event simulation could help the department identify critical bottlenecks and optimize resource allocation, with a target of reducing delays by at least 20% to improve assembly line efficiency."}
                      {num === 2 && "The NPI Department faces delays in prototyping due to uncoordinated testing and validation schedules with the Testing Facility, which results in 2-week delays on average for each new product launch. Testing times vary from 3 to 7 days per component, and coordination with the Prototype Assembly Team often overlaps, causing resource conflicts. Currently, there’s a backlog of three prototypes awaiting validation, impacting the timeline for launching new models. By simulating the NPI workflow, the department aims to streamline testing coordination, reduce prototype wait times by 25%, and improve product launch timelines."}
                      {num === 3 && "The Vehicle Design Department experiences frequent workflow interruptions due to the delayed availability of CAD (Computer-Aided Design) models, which are needed from the Materials Team for new part specifications. Model revisions occur an average of three times per project, each adding a week’s delay to the overall design timeline, affecting up to five concurrent projects. As a result, the design timeline is extended by 10%, impacting the entire product development cycle. Implementing discrete event simulation could help the department analyze bottlenecks in model availability, with a goal to reduce design phase time by 15% through improved synchronization and communication."}
                      {num === 4 && "The Chassis Quality Inspection process currently identifies defects late in the production line, with 10% of chassis requiring rework due to welding inconsistencies. Inspections are conducted every six hours, but quality issues in real-time production cause delays, with each rework costing an average of $250, totaling an additional $30,000 monthly in expenses. These inspections are time-consuming, ranging from 15 to 25 minutes per chassis, affecting the production pace. A discrete event simulation of the inspection process can help identify optimal intervals for real-time checks, aiming to reduce rework costs by at least 30% and improve defect detection efficiency."}
                      {num === 5 && "The Materials Department faces disruptions due to unpredictable lead times for Aluminum Sheet deliveries from MetalWorks Ltd., with delivery times fluctuating between 2 to 5 days. These delays cause shortages on the Frame Assembly Line, resulting in a 20% decrease in assembly efficiency and frequent schedule adjustments. Additionally, material handling within the storage area requires 40 to 90 minutes, causing further delays in getting materials to the production floor. By using discrete event simulation, the department can model inventory flow and handling processes to reduce lead times and ensure materials are available, aiming for a 25% improvement in material availability and reduced delays in assembly."}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div 
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-4 border border-gray-700/50"
        >
          <div className="flex justify-between items-start">
            <p className="text-gray-300 flex-1 pr-4">
              This is a chat interface for AutoSimHub, a simulation tool for production line modelling. 
              You can ask the agent to perform various tasks, such as running simulations, updating simulations, 
              or getting simulations. The agent will use the tools provided to perform these tasks.
            </p>
            <button 
              className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg"
              onClick={resetSimulation}
            >
              Reset Simulation
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Chat Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto w-full flex-1 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 flex flex-col overflow-hidden"
      >
        <div className="flex-1 flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    ${msg.type === 'system' 
                      ? 'bg-gray-700/70 text-gray-300 w-full text-center' 
                      : msg.type === 'user'
                      ? 'bg-indigo-600/90 text-white'
                      : msg.type === 'other_user'
                      ? 'bg-purple-600/90 text-white'
                      : 'bg-gray-700/70 text-gray-200'
                    } 
                    p-4 rounded-xl backdrop-blur-sm shadow-md max-w-[80%] transition-all duration-300 hover:shadow-lg`}
                  >
                    {msg.type !== 'system' && (
                      <div className="font-medium text-sm mb-1">
                        {msg.user}
                      </div>
                    )}
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                      {msg.message}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={sendMessage} 
            className="border-t border-gray-700/50 p-4 bg-gray-800/50 backdrop-blur-sm"
          >
            <div className="flex gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-600/50 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              >
                <option value="New Product Introduction Department">NPI Dept</option>
                <option value="Design Department">Design Dept</option>
                <option value="Planning Department">Planning Dept</option>
                <option value="Production Department">Production Dept</option>
                <option value="Quality Control Department">QC Dept</option>
                <option value="Materials Department">Materials Dept</option>
                <option value="Other">Other</option>
              </select>
              
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-lg border border-gray-600/50 bg-gray-700/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${
                  isLoading ? 'opacity-70' : ''
                }`}
              />
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                className="bg-indigo-600/90 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg"
              >
                Send
              </motion.button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Chat; 