# Avatar Creation App

This project is a React-based frontend for an Avatar Creation App. It allows users to log in, generate avatars by uploading a photo and audio file, and view their previously generated avatars.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload if you make edits.  
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.  
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.  
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and transitive dependencies (webpack, Babel, ESLint, etc.) into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts, so you can tweak them. At this point, you're on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and medium deployments, and you shouldn’t feel obligated to use this feature. However, we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Features

### **User Login**
Users can log in with their email and password. The session is stored in `localStorage` for persistence.

**API Requirements**:
- **Endpoint**: `POST /login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
- **Response (Success)**:
    ```json
  {
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com"
  }
- **Response (Failure)**:
    ```json
  {
  "error": "Invalid credentials"
  }

### **Avatar Generation**
Users can upload a photo and audio file to generate a personalized avatar. The backend processes the files and returns a video URL for the generated avatar.

**API Requirements**:
- **Endpoint**: `POST /generate-avatar`
- **Request Body**:
  ```makefile
  {
    user_id: <number>
    user_picture: <file>
    user_audio: <file>
  }
- **Response (Success)**:
    ```json
  {
    "video_url": "http://example.com/generated-avatar.mp4"
  }
- **Response (Failure)**:
    ```json
  {
    "error": "Failed to generate avatar"
  }

### **View Generated Avatars**
Users can view all previously generated avatars in a gallery format.

**API Requirements**:
- **Endpoint**: `GET /my-avatars`
- **Request Body**:
  ```makefile
  {
    user_id: <number>
  }
- **Response (Success)**:
    ```json
  {
    
  { "video_url": "http://example.com/avatar1.mp4" },
  { "video_url": "http://example.com/avatar2.mp4" }

  }
- **Response (Failure)**:
    ```json
  {
     "error": "Failed to fetch avatars"
  }

## Frontend Dependencies    
The following libraries are used in the frontend:
React Router: For navigation and routing.
Tailwind CSS: For styling.
Fetch API: For making API requests.

To install all dependencies:
```bash
  {
    npm install react-router-dom tailwindcss postcss autoprefixer
  }
  
### **更新点说明**

1. **新增页面功能描述**：
   - 添加了 **Generate Interview** 页面描述，包括如何生成面试视频。
   - 指定了每个组件的用途，包括 `Login.js`、`AvatarCreationUI.js`、`GenerateInterview.js`、`MyAvatar.js` 等。

2. **更新全局 Tailwind CSS 使用**：
   - 详细描述了在 `index.css` 中如何使用 `@apply` 指令创建全局类，方便复用。
   - 添加了示例类，包括 `container-generate`、`video-container`、`button-add-question`、`button-confirm` 等。

3. **添加了对新功能的 API 需求**：
   - 更新了登录、生成 Avatar、查看 Avatar 和生成面试视频的 API 调用需求。

4. **文件结构说明**：
   - 明确了每个文件的功能，帮助开发者理解整个项目的结构。

## Next Steps for Backend Developer
Implement the required API endpoints (/login, /generate-avatar, /my-avatars).
Test the endpoints with the sample payloads provided.
Ensure CORS is enabled for http://localhost:3000 to allow frontend-backend communication.
Inform the frontend developer of any changes to the API. 
