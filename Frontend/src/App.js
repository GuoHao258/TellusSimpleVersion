import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import AvatarCreationUI from './AvatarCreationUI';
import MyAvatar from './MyAvatar';
import Profile from './Profile';
import GenerateInterview from './GenerateInterview';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 在初始加载时检查 localStorage 中是否有用户信息
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // 处理用户登录
  const handleLogin = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo)); // 保存用户会话
    navigate('/profile'); // 登录后导航到 Profile 页面
  };

  // 处理用户注销
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user'); // 清除用户会话
    navigate('/'); // 导航到登录页面
  };

  // 判断用户是否已登录
  const isLoggedIn = user !== null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 - 仅在用户登录且不在 Profile 页面时显示 */}
      {isLoggedIn && window.location.pathname !== '/profile' && (
        <header className="bg-white p-4 shadow-md mb-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-700">Welcome, {user?.name}</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="text-blue-500 hover:text-blue-700 transition-all"
              >
                Profile
              </button>
              <button
                onClick={() => navigate('/create-avatar')}
                className="text-blue-500 hover:text-blue-700 transition-all"
              >
                Create Avatar
              </button>
              <button
                onClick={() => navigate('/my-avatars')}
                className="text-blue-500 hover:text-blue-700 transition-all"
              >
                My Avatars
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 路由配置 */}
      <div className="flex-grow container mx-auto p-6">
        <Routes>
          {/* 登录页面 */}
          {!isLoggedIn && <Route path="/" element={<Login onLogin={handleLogin} />} />}

          {/* Profile 页面（已登录用户才能访问） */}
          {isLoggedIn ? (
            <>
              <Route
                path="/profile"
                element={<Profile user={user} handleLogout={handleLogout} />}
              />
              <Route path="/create-avatar" element={<AvatarCreationUI userId={user.id} />} />
              <Route path="/my-avatars" element={<MyAvatar userId={user.id} />} />
              <Route path="/generate-interview" element={<GenerateInterview avatarVideoUrl={user.avatarVideoUrl} />} />
              {/* 已登录时访问不存在的路径，重定向到 Profile 页面 */}
              <Route path="*" element={<Navigate to="/profile" />} />
            </>
          ) : (
            // 如果用户未登录，访问任何其他页面都重定向到登录页面
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
