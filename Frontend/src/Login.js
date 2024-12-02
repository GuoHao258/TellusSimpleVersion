import React, { useState } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 模拟成功登录，使用硬编码的用户数据
    const mockUserData = {
      name: 'Test User', // 硬编码的用户姓名
      id: 1,             // 硬编码的用户 ID
      email: email       // 使用输入的邮箱作为显示用途
    };

    // 调用传入的 onLogin 方法，传递模拟用户数据
    onLogin(mockUserData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="card max-w-sm">
        <h2 className="card-title">Login</h2>
        <div className="mb-4">
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
        </div>
        <div className="mb-4">
          <label className="label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
  
}

export default Login;
