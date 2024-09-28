import React, { useState, useEffect } from 'react';
import { ArrowRightCircle } from 'lucide-react';
import useCreateUser from '../hooks/useCreateUser';
import Swal from 'sweetalert2';

const Home = () => {
  const [name, setName] = useState('');

  const { loading, error, createUser } = useCreateUser();

  const handleStart = () => {
    if (name) {
      createUser(name);
    }else{
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please enter your name to continue'
        });
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to VoiceAgent</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Evva Health VoiceAgent is an interactive AI assistant that communicates with you through voice. 
        It will ask you questions both visually and audibly, and you can respond using your voice.
      </p>
      <div className="mb-6 w-full max-w-md">
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          To get started, please enter your name:
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-grow px-4 py-2 rounded-l-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
          <button
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowRightCircle size={24} />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4 text-center max-w-2xl">
        Once you enter your name and click the arrow, the voice interaction will begin. 
        Make sure your microphone is enabled and your speakers are on.
      </p>
    </div>
  );
};

export default Home;