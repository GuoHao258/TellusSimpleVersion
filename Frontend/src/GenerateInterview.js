import React, { useState } from 'react';

function GenerateInterview({ avatarVideoUrl }) {
  const videoUrl = avatarVideoUrl || 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
  const [questions, setQuestions] = useState(['']);
  const [file, setFile] = useState(null);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
    // Logic for extracting questions from file using ChatGPT API
  };

  const handleAddQuestion = () => {
    if (questions.length >= 10) {
      alert('最多只能添加 10 个问题');
      return;
    }
    setQuestions([...questions, '']);
  };

  const handleChangeQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleConfirmQuestions = () => {
    const confirmation = window.confirm("Are you sure you want to use these questions for generation?");
    if (confirmation) {
      // Send questions to backend for video generation
      alert('The video is being generated. The whole process will take about five or six minutes.');
    }
  };

  return (
    <div className="container-generate">
      {/* 左侧视频部分 */}
      <div className="video-container">
        <h2 className="video-title">Generated Avatar Video</h2>
        {avatarVideoUrl ? (
          <video src={videoUrl} controls className="video" />
        ) : (
          <p>No avatar video available</p>
        )}
      </div>

      {/* 右侧问题输入部分 */}
      <div className="question-container">
        <h2 className="video-title">Enter Your Interview Questions</h2>
        <input type="file" onChange={handleFileUpload} className="file-input" />

        {questions.map((question, index) => (
          <div key={index}>
            <label>Enter Question {index + 1}</label>
            <input
              type="text"
              value={question}
              onChange={(e) => handleChangeQuestion(index, e.target.value)}
              className="input-field"
            />
          </div>
        ))}

        {/* 添加问题按钮 */}
        <div className="flex space-x-4 mt-6">
          <button onClick={handleAddQuestion} className="button-add-question">
            + Add Another Question
          </button>

          {/* 确认问题按钮 */}
          <button onClick={handleConfirmQuestions} className="button-confirm">
            Confirm Questions
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateInterview;
