const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');

// 处理用户头像图片上传的路由
router.post('/upload-picture', upload.single('UserPicture'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No picture file uploaded.');
  }
  res.send('Picture file uploaded successfully.');
});

// 处理用户音频上传的路由
router.post('/upload-audio', upload.single('UserAudio'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }
  res.send('Audio file uploaded successfully.');
});

module.exports = router;
