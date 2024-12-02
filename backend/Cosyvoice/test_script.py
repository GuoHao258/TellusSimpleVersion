import requests
import base64
import os
import json

# API地址，这里假设你的cosyvoice API运行在本地的9233端口
API_URL = "http://127.0.0.1:9233"

# 参考音频文件路径（这里假设你有一个本地的音频文件用于参考音色，你需要根据实际情况修改）
reference_audio_path = "trump.wav"

# 读取参考音频文件内容并转换为Base64编码（这里只是一种示例方法，你可能需要根据实际情况调整）
with open(reference_audio_path, 'rb') as audio_file:
    reference_audio_data = base64.b64encode(audio_file.read()).decode('utf-8')

# 要合成的文本
text_to_synthesize = "Hello! I am your avatar, and I’m here to assist you with your interview."

# 参考文本（与参考音频对应）
reference_text = "Politicians are all talk, no action. Nothing's gonna get done. They will not bring us, believe me, to the promised land."

# 要用于sadtalker的图像路径（根据实际情况修改）
image_path = "D:\Projects\FYP\TellusSimpleVersion\\backend\Cosyvoice\\trump.jpg"

# 设置请求参数
data = {
    "text": text_to_synthesize,
    "reference_audio": reference_audio_path,
    "reference_text": reference_text,
    "image_path": image_path
}

# 发送POST请求到clone_and_generate_video路由
response = requests.post(f'{API_URL}/clone_and_generate_video', data=data)

result = {}
if response.status_code == 200:
    try:
        # 解析JSON格式的响应内容，获取视频文件路径
        response_json = response.json()
        video_path = response_json.get('video_path')
        if video_path:
            # 检查文件是否存在（可以根据实际需求决定是否需要这一步）
            if os.path.exists(video_path):
                result['video_path'] = video_path
            else:
                result['error'] = f"视频文件路径 {video_path} 对应的文件不存在"
        else:
            result['error'] = "响应中未包含视频文件路径信息"
    except json.JSONDecodeError as e:
        result['error'] = f"解析响应JSON数据出错: {e}"
else:
    result['error'] = f"请求失败，状态码: {response.status_code}，错误信息: {response.text}"

# 将结果以JSON格式输出
print(json.dumps(result))
