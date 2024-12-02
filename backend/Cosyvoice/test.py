import requests

data={
    "text":"你好啊亲爱的朋友们，今天天气不错，暴风骤雨哗哗的。",
    "role":"中文女"
}

response=requests.post(f'http://127.0.0.1:9233/tts',data=data,timeout=3600)


if response.status_code!=200:
    # 出错了
    print(response.json())
else:
    # 返回的wav数据流，可直接保存
    with open("./tts.wav",'wb') as f:
        f.write(response.content)


# D:\Download\sadTalker\python\python D:\Download\sadTalker\inference.py --driven_audio D:\Download\sadTalker\examples/driven_audio/bus_chinese.wav --source_image D:\Download\sadTalker\examples/source_image/full_body_2.png
D:\Download\sadTalker\python\python inference.py --driven_audio D:\Projects\FYP\Cosyvoice\jtx.wav --source_image D:\Projects\FYP\Cosyvoice\full_body_2.png