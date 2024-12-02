import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyAvatar({ userId }) {
  const [avatars, setAvatars] = useState([]);
  const navigate = useNavigate();

  // 获取用户的所有 Avatars
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch(`http://localhost:5000/my-avatars?user_id=${userId}`);
        const data = await response.json();
        setAvatars(data); // 加载与用户关联的 Avatars
      } catch (error) {
        alert('Failed to fetch avatars.');
      }
    };

    fetchAvatars();
  }, [userId]);

  // 处理删除 Avatar
  const handleDeleteAvatar = async (avatarId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this avatar?');
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:5000/delete-avatar`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatar_id: avatarId }),
        });

        if (response.ok) {
          // 从状态中移除已删除的 Avatar
          setAvatars(avatars.filter((avatar) => avatar.id !== avatarId));
          alert('Avatar deleted successfully.');
        } else {
          throw new Error('Failed to delete avatar.');
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // 处理导航到生成面试页面
  const handleGenerateInterview = (avatar) => {
    navigate('/generate-interview', { state: { avatarVideoUrl: avatar.video_url, audioUrl: avatar.audio_url } });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">My Avatars</h2>
      {avatars.length === 0 ? (
        <p className="text-center text-gray-600">No avatars found. Generate one!</p>
      ) : (
        <div className="space-y-8">
          {avatars.map((avatar) => (
            <div key={avatar.id} className="flex items-center space-x-6 bg-white p-6 rounded-lg shadow-md">
              {/* 视频预览 */}
              <video
                src={avatar.video_url}
                controls
                className="w-64 h-40 rounded-lg"
              />
              
              {/* 按钮区域 */}
              <div className="flex flex-col space-y-4">
                {/* 删除 Avatar 按钮 */}
                <button
                  onClick={() => handleDeleteAvatar(avatar.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all"
                >
                  Delete
                </button>

                {/* 使用该 Avatar 生成面试问题按钮 */}
                <button
                  onClick={() => handleGenerateInterview(avatar)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all"
                >
                  Use This Avatar to Generate Interview Question
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAvatar;
