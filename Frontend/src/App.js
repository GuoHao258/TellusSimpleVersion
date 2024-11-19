import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './Login';
import AvatarCreationUI from './AvatarCreationUI';
import MyAvatar from './MyAvatar';

function App() {
  const [user, setUser] = useState(null);

  // Handles user login
  const handleLogin = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo)); // Save user session
  };

  // Handles user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Clear user session
  };

  // Check if a user is logged in
  const loggedInUser = user || JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {!loggedInUser ? (
          <Login onLogin={handleLogin} />
        ) : (
          <div className="container mx-auto p-6">
            <header className="flex justify-between items-center bg-white p-4 rounded shadow">
              <h1 className="text-2xl font-bold text-gray-700">Welcome, {loggedInUser.name}</h1>
              <div className="flex items-center">
                <nav className="space-x-4">
                  <Link to="/create-avatar" className="text-blue-500 hover:text-blue-700">Create Avatar</Link>
                  <Link to="/my-avatars" className="text-blue-500 hover:text-blue-700">My Avatars</Link>
                </nav>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </header>

            <div className="mt-6">
              <Routes>
                <Route path="/create-avatar" element={<AvatarCreationUI userId={loggedInUser.id} />} />
                <Route path="/my-avatars" element={<MyAvatar userId={loggedInUser.id} />} />
                <Route path="*" element={<Navigate to="/create-avatar" />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
