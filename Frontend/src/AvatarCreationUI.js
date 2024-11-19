import React, { useState } from 'react';
import PropTypes from 'prop-types';

function AvatarCreationUI({ userId }) {
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAudioUpload = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleGenerate = async () => {
    if (!imageFile || !audioFile) {
      alert('Please upload both a picture and audio file.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('user_picture', imageFile);
    formData.append('user_audio', audioFile);
    formData.append('user_id', userId); // Include userId in the request

    try {
      const response = await fetch('http://localhost:5000/generate-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate avatar');
      }

      const result = await response.json();
      setAvatarPreview(result.video_url);
    } catch (error) {
      alert('Failed to generate avatar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h3>Your generated avatar can be a cartoon version of your photo:</h3>
      <p>It will default to speak a sentence such as this: "Hello! I am your avatar, and I’m here to assist you with your interview."</p>

      <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p>Please upload an image of yourself to create an avatar.</p>
          <div
            style={{
              width: '300px',
              height: '200px',
              backgroundColor: '#eee',
              margin: '0 auto',
            }}
          >
            {avatarPreview ? (
              <video
                src={avatarPreview}
                controls
                autoPlay
                loop
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <p style={{ paddingTop: '90px' }}>Avatar Preview</p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            User Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'block', margin: '10px auto' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>
            User Audio
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              style={{ display: 'block', margin: '10px auto' }}
            />
          </label>
        </div>

        <button
          onClick={handleGenerate}
          style={{ padding: '10px 20px', marginRight: '10px' }}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
}

export default AvatarCreationUI;


AvatarCreationUI.propTypes = {
  userId: PropTypes.number.isRequired, // Validate userId is a required number
};
