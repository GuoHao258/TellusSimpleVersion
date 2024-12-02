import React, { useState } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useMockLogin, setUseMockLogin] = useState(false); // 是否使用模拟登录

  // 提交处理函数
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (useMockLogin) {
      // 模拟成功登录，使用硬编码的用户数据
      const mockUserData = {
        name: 'Test User', // 硬编码的用户姓名
        id: 1, // 硬编码的用户 ID
        email: email, // 使用输入的邮箱作为显示用途
      };

      // 调用传入的 onLogin 方法，传递模拟用户数据
      onLogin(mockUserData);
    } else {
      // 使用后端 API 进行登录
      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Invalid login credentials');
        }

        const userData = await response.json();
        onLogin(userData); // 调用传入的 onLogin 方法，传递用户数据
      } catch (error) {
        alert(error.message);
      }
    }
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

        <button type="submit" className="btn-primary w-full mb-4">
          Login
        </button>

        <div className="flex items-center justify-center mt-4">
          <label className="mr-2 text-sm text-gray-700">Use Mock Login</label>
          <input
            type="checkbox"
            checked={useMockLogin}
            onChange={() => setUseMockLogin(!useMockLogin)}
            className="form-checkbox"
          />
        </div>
      </form>
    </div>
  );
}

export default Login;
