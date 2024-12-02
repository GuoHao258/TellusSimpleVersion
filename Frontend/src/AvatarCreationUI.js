import React, { useState } from 'react';
import PropTypes from 'prop-types';
//测试
import { useNavigate } from 'react-router-dom';


function AvatarCreationUI({ userId }) {
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  //测试
  const navigate = useNavigate();


  const handleImageUpload = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAudioUpload = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleGenerate = async () => {
    if (!imageFile || !audioFile) {
      alert('Please upload both audio and image files.');
      return;
    }

    setIsLoading(true);
    setGenerationStatus('Generating! Please wait');

    const formData = new FormData();
    formData.append('user_picture', imageFile);
    formData.append('user_audio', audioFile);
    formData.append('user_id', userId);

    try {
      const response = await fetch('http://localhost:5000/generate-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Fail to generate, Please try again!');
      }

      const result = await response.json();
      setAvatarPreview(result.video_url);
      setGenerationStatus('Congrats！Your generation is successful！');
    } catch (error) {
      alert('】Error when generating your avatar! Please try agin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-default">
      <div className="upload-container">
        <div className="mb-6">
          <p className="upload-title">Please upload your image and audio to generate Avatar</p>
          <div className="preview-placeholder">
            {avatarPreview ? (
              <video
                src={avatarPreview}
                controls
                autoPlay
                loop
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <p className="text-gray-500">Avatar Preview</p>
            )}
          </div>
        </div>

        {/* 图片上传字段 */}
        <div className="mb-4 text-center">
          <label className="input-file-label">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="input-file"
            />
          </label>
        </div>

        {/* 音频上传字段 */}
        <div className="mb-4 text-center">
          <label className="input-file-label">
            Upload Audio
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="input-file"
            />
          </label>
        </div>

        {/* 生成按钮 */}
        <div className="text-center">
          <button
            onClick={handleGenerate}
            className={`btn-generate ${isLoading ? 'btn-generate-disabled' : 'btn-generate-default'}`}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        
        
         {/* 添加跳过生成的按钮 */}
         <div className="text-center mt-4">
          <button
            onClick={() =>
              navigate('/generate-interview', {
                state: {
                  avatarVideoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                },
              })
            }
            className="px-6 py-3 mt-4 text-white font-bold bg-yellow-500 rounded-lg hover:bg-yellow-600"
          >
            直接查看提交问题面试页面 (测试)
          </button>
        </div>

        {/* 生成状态提示 */}
        <p className="status-text">{generationStatus}</p>
      </div>
    </div>


  );
}

AvatarCreationUI.propTypes = {
  userId: PropTypes.number.isRequired,
};

export default AvatarCreationUI;
