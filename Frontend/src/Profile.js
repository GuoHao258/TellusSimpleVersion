import React from 'react';
import { useNavigate } from 'react-router-dom';

function Profile({ user, handleLogout }) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* 右上角的 Logout 按钮 */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
      >
        Logout
      </button>

      {/* 中间的内容，包含功能按钮 */}
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => navigate('/create-avatar')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600"
          >
            Create Your Avatar
          </button>
          <button
            onClick={() => navigate('/my-avatars')}
            className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600"
          >
            View Your Avatars
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
