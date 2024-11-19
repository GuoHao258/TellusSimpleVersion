import React, { useEffect, useState } from 'react';

function MyAvatar({ userId }) {
  const [avatars, setAvatars] = useState([]);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch(`http://localhost:5000/my-avatars?user_id=${userId}`);
        const data = await response.json();
        setAvatars(data); // Load avatars associated with the user
      } catch (error) {
        alert('Failed to fetch avatars.');
      }
    };

    fetchAvatars();
  }, [userId]);

  return (
    <div>
      <h2>My Avatars</h2>
      {avatars.length === 0 ? (
        <p>No avatars found. Generate one!</p>
      ) : (
        <div>
          {avatars.map((avatar, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <video src={avatar.video_url} controls style={{ width: '300px', height: '200px' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAvatar;
