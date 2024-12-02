const express = require('express');
const app = express();
const cors = require('cors');
const avatarRoutes = require('./routes/avatarRoutes');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const port = 5000;

// 使用cors中间件，允许跨域请求
app.use(cors());

// 测试路由
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// 解析表单数据以及JSON数据（如果前端还会发送JSON格式的数据，添加这行代码很有必要）
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 挂载已有的avatarRoutes路由（假设这里处理和头像相关的其他路由请求）
app.use('/', avatarRoutes);

// 修改静态文件中间件配置，指向视频文件所在的文件夹
app.use(express.static('SadTalker/results'));

// 新增的处理登录请求的路由逻辑
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    // 按照要求，简单返回成功响应，这里没做真实的验证，直接返回固定的数据示例
    const responseData = {
        "id": 1,
        "name": "John Doe",
        "email": email
    };
    
    // 新增：在控制台输出接收到登录请求的相关信息，比如请求中的邮箱地址
    console.log(`接收到登录请求，邮箱：${email}`);

    res.json(responseData);

    // 新增：在控制台输出登录成功的提示信息
    console.log('登录成功');
});

// // 处理POST /generate-avatar请求的路由
// app.post('/generate-avatar1', (req, res) => {
//   console.log(`Server on port ${port}`);
//   // 直接使用给定的URL
//   const videoUrl = "http://localhost:5000/2024_11_19_22.41.14.mp4";
//   // 设置响应头，告诉浏览器以视频流的形式处理，而不是直接下载（尝试修改MIME类型）
//   res.setHeader('Content-Type', 'video/mp4');
//   return res.json({ video_url: videoUrl });
// });

// 定义执行Python脚本的函数
function executePythonScript(scriptPath) {
  return new Promise((resolve, reject) => {
      //const pythonProcess = spawn('python', [scriptPath]);
      const pythonProcess = spawn('python', [scriptPath], {
        cwd: path.join(__dirname, 'Cosyvoice')
    });
    
      let pythonOutput = '';
      pythonProcess.stdout.on('data', (data) => {
          console.log(data.toString()); // 在Express服务器端控制台输出Python脚本的标准输出内容
          pythonOutput += data;
          console.log(pythonOutput);
      });

      pythonProcess.on('close', (code) => {
          if (code === 0) {
              resolve(pythonOutput); // 如果Python脚本执行成功（退出码为0），则表示成功执行，直接resolve
          } else {
              reject({ error: "Python脚本执行失败", details: `退出码: ${code}` });
          }
      });

      pythonProcess.stderr.on('data', (data) => {
          reject({ error: "Python脚本执行出现错误", details: data.toString() });
      });
  });
}

// 处理POST /run-python-script请求的路由，用于测试执行Python脚本

// 处理POST /generate-avatar请求的路由，用于执行Python脚本并处理返回结果
app.post('/generate-avatar', (req, res) => {
  const pythonScriptPath = path.join(__dirname, 'Cosyvoice', 'clone.py');

  executePythonScript(pythonScriptPath)
    .then((pythonOutput) => {
          try {
              // 解析Python脚本输出的包含视频路径信息的JSON格式数据（假设Python脚本按要求输出JSON格式数据）
              const outputData = JSON.parse(pythonOutput);
              const video_path = outputData.video_path;
              if (video_path) {
                  // 直接使用获取到的绝对路径的文件名来构建视频文件对应的可访问网址
                  const videoUrl = `http://localhost:${port}/${path.basename(video_path)}`;
                  // 返回包含视频网址的JSON响应给前端
                  console.log(videoUrl);
                  res.setHeader('Content-Type', 'video/mp4');
                  return res.json({ video_url: videoUrl });
              } else {
                  return res.status(400).json({ error: "Python脚本返回的结果中未包含视频路径信息" });
              }
          } catch (jsonError) {
              return res.status(500).json({ error: "解析Python脚本输出的JSON数据出错", details: jsonError.message });
          }
      })
    .catch(error => {
          return res.status(500).json(error);
      });
});

// 处理GET /my-avatars请求的路由
app.get('/my-avatars', (req, res) => {
  const user_id = req.body.user_id;
  // 构建指向根目录下SadTalker/results子目录的路径
  const resultsDir = path.join(__dirname, 'SadTalker', 'results');

  // 检查目录是否存在
  if (!fs.existsSync(resultsDir)) {
      return res.status(500).json({ error: "Failed to fetch avatars", details: "Results directory does not exist" });
  }

  // 读取目录中的所有文件和文件夹信息
  const files = fs.readdirSync(resultsDir);
  const videoUrls = [];
  files.forEach((file) => {
      const fileExtension = path.extname(file);
      if (fileExtension === '.mp4') {
          const videoUrl = `http://localhost:${port}/${file}`;
          videoUrls.push({ video_url: videoUrl });
      }
  });

  if (videoUrls.length > 0) {
      return res.json(videoUrls);
  } else {
      return res.status(404).json({ error: "Failed to fetch avatars", details: "No MP4 files found in the results directory" });
  }
});

app.post('/generate-avatar1', (req, res) => {
  try {
      // 构建执行Python脚本的命令，这里假设你的Python脚本名为test_api.py，且位于项目根目录下，根据实际情况调整路径
      const pythonScriptPath = path.join(__dirname, 'Cosyvoice', 'clone.py');
      //const pythonProcess = spawn('python', [pythonScriptPath]);
      const pythonProcess = spawn('python', [pythonScriptPath], {
        cwd: path.join(__dirname, 'backend', 'Cosyvoice')
    });
    


      let pythonOutput = '';
      pythonProcess.stdout.on('data', (data) => {
          pythonOutput += data;
      });

      pythonProcess.on('close', (code) => {
          if (code === 0) {
              try {
                  // 解析Python脚本输出的包含视频路径信息的JSON格式数据（假设Python脚本按要求输出JSON格式数据）
                  const outputData = JSON.parse(pythonOutput);
                  const video_path = outputData.video_path;
                  if (video_path) {
                      // 直接使用获取到的绝对路径来构建视频文件对应的可访问网址
                      const videoUrl = `http://localhost:${port}/${path.relative(__dirname, video_path)}`;
                      // 返回包含视频网址的JSON响应给前端
                      return res.json({ video_url: videoUrl });
                  } else {
                      return res.status(400).json({ error: "Python脚本返回的结果中未包含视频路径信息" });
                  }
              } catch (jsonError) {
                  return res.status(500).json({ error: "解析Python脚本输出的JSON数据出错", details: jsonError.message });
              }
          } else {
              return res.status(500).json({ error: "Python脚本执行失败" });
          }
      });
  } catch (error) {
      return res.status(500).json({ error: "启动Python脚本出现错误", details: error.message });
  }
});

// 配置Express静态文件中间件，用于让前端可以访问到生成的视频文件（这里假设视频文件存放在videos文件夹下，根据实际情况调整）
//app.use('/videos', express.static(path.join(__dirname, 'videos')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
