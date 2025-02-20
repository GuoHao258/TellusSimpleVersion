import requests
import base64
import os
import json

# API地址，这里假设你的cosyvoice API运行在本地的9233端口
API_URL = "http://127.0.0.1:9233"
#print("当前脚本工作目录:", os.getcwd())
#print("trump.wav文件的绝对路径:", os.path.abspath('trump.wav'))
# 参考音频文件路径（这里假设你有一个本地的音频文件用于参考音色，你需要根据实际情况修改）
reference_audio_path = "trump.wav"
#reference_audio_path = "en2.wav"
# 检查文件是否存在
if os.path.exists(reference_audio_path):
    #print(f"文件 {reference_audio_path} 存在.")
    # 读取参考音频文件内容并转换为Base64编码（这里只是一种示例方法，你可能需要根据实际情况调整）
    try:
        with open(reference_audio_path, 'rb') as audio_file:
            reference_audio_data = base64.b64encode(audio_file.read()).decode('utf-8')
    except Exception as e:
        print(f"打开文件时发生错误: {e}")

# 要合成的文本
text_to_synthesize = "Please introduce yourself and tell me about your last work experience."#
#text_to_synthesize = "Do you have any questions about this position? Please feel free to ask me questions."

# 参考文本（与参考音频对应）
reference_text = "Politicians are all talk, no action. Nothing's gonna get done. They will not bring us, believe me, to the promised land."
#reference_text = "Constant attack by politicians who have no medical education or background and who do not know the women that their"
#reference_text = "He's near South Side. I'm honored to represent a district made up largely of working people and I'm proud to tell you that I come from a family of work."

# 要用于sadtalker的图像路径（根据实际情况修改）
image_path = "D:\Projects\FYP\TellusSimpleVersion\\backend\Cosyvoice\\trump2.jpg"
#image_path = "D:\Projects\FYP\TellusSimpleVersion\\backend\Cosyvoice\\women.png"

# 设置请求参数
data = {
    "text": text_to_synthesize,
    "reference_audio": reference_audio_path,
    "reference_text": reference_text,
    "image_path": image_path
}
#print("发送的数据:", data)
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
