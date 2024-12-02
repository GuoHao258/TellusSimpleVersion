import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function GenerateInterview() {
  const location = useLocation();
  const { avatarVideoUrl, avatarAudioUrl } = location.state || {}; // 从导航状态获取 Avatar 视频和音频 URL

  // 面试问题的状态
  const [questions, setQuestions] = useState(['']);
  const [file, setFile] = useState(null);

  // 文件上传处理函数
  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
    // TODO: Logic for extracting questions from file using ChatGPT API
  };

  // 添加新问题的处理函数
  const handleAddQuestion = () => {
    if (questions.length >= 10) {
      alert('最多只能添加 10 个问题');
      return;
    }
    setQuestions([...questions, '']);
  };

  // 处理每个问题的修改
  const handleChangeQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  // 确认问题的处理函数
  const handleConfirmQuestions = () => {
    const confirmation = window.confirm('Are you sure you want to use these questions for generation?');
    if (confirmation) {
      // TODO: Send questions and Avatar data to backend for interview video generation
      alert('The video is being generated. The whole process will take about five or six minutes.');
    }
  };

  return (
    <div className="flex min-h-screen p-6">
      {/* 左侧视频部分 */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">Generated Avatar Video</h2>
        {avatarVideoUrl ? (
          <video src={avatarVideoUrl} controls className="w-full h-auto rounded-lg mb-4" />
        ) : (
          <p className="text-gray-500">No avatar video available</p>
        )}
      </div>

      {/* 右侧问题输入部分 */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">Enter Your Interview Questions</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          className="block w-full mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {/* 面试问题输入区域 */}
        {questions.map((question, index) => (
          <div key={index} className="mb-2">
            <label className="block mb-1">Enter Question {index + 1}</label>
            <input
              type="text"
              value={question}
              onChange={(e) => handleChangeQuestion(index, e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        ))}

        {/* 添加问题和确认问题按钮 */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleAddQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all"
          >
            + Add Another Question
          </button>

          <button
            onClick={handleConfirmQuestions}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all"
          >
            Confirm Questions
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateInterview;
