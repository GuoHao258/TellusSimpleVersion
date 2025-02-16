import requests
import base64
import os
import json
import sys

# 检查是否传入了问题参数
if len(sys.argv) > 1:
    text_to_synthesize = sys.argv[1]
else:
    text_to_synthesize = "Default question: What is your name?"  # 默认问题

# API地址
API_URL = "http://127.0.0.1:9233"

# 参考音频文件路径
reference_audio_path = "trump.wav"
if os.path.exists(reference_audio_path):
    try:
        with open(reference_audio_path, 'rb') as audio_file:
            reference_audio_data = base64.b64encode(audio_file.read()).decode('utf-8')
    except Exception as e:
        print(f"打开文件时发生错误: {e}")

# 参考文本
reference_text = "Politicians are all talk, no action. Nothing's gonna get done. They will not bring us, believe me, to the promised land."

# 要用于sadtalker的图像路径
image_path = "D:\\Projects\\FYP\\TellusSimpleVersion\\backend\\Cosyvoice\\trump2.jpg"

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
        response_json = response.json()
        video_path = response_json.get('video_path')
        if video_path:
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