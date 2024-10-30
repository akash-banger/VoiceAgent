import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import useCreateUser from '../hooks/useCreateUser';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const { loading, error, createUser } = useCreateUser();

  const handleLogin = () => {
    if (name && password) {
      createUser(name, password);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter both username and password to continue'
      });
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      navigate('/chat/' + userId);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Account or Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;