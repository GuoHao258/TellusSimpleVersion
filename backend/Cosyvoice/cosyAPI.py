import os,time,sys
from flask import Flask, request, render_template, jsonify,  send_from_directory,send_file,Response, stream_with_context,make_response
import logging
from logging.handlers import RotatingFileHandler
import subprocess
import shutil
import datetime
from modelscope import snapshot_download
from cosyvoice.cli.cosyvoice import CosyVoice
from cosyvoice.utils.file_utils import load_wav
import torchaudio
from pathlib import Path
import base64

root_dir=Path(os.getcwd()).as_posix()
tmp_dir=Path(f'{root_dir}/tmp').as_posix()
logs_dir=Path(f'{root_dir}/logs').as_posix()
print(f'{root_dir=}')
print(f'{tmp_dir=}')
print(f'{logs_dir=}')
os.makedirs(tmp_dir,exist_ok=True)
os.makedirs(logs_dir,exist_ok=True)
os.makedirs(f'{root_dir}/pretrained_models',exist_ok=True)
sys.path.append('{}/third_party/Matcha-TTS'.format(root_dir))

if sys.platform=='win32':
    os.environ['PYTHONPATH'] = os.environ.get('PYTHONPATH', '') + ';third_party\\Matcha-TTS'
else:
    os.environ['PYTHONPATH'] = os.environ.get('PYTHONPATH', '') + ':third_party/Matcha-TTS'


if not os.path.exists('pretrained_models/CosyVoice-300M/cosyvoice.yaml') or not os.path.exists('pretrained_models/CosyVoice-300M-SFT/cosyvoice.yaml'):
    snapshot_download('iic/CosyVoice-300M', cache_dir='pretrained_models/CosyVoice-300M',local_dir='pretrained_models/CosyVoice-300M')
    snapshot_download('iic/CosyVoice-300M-SFT', cache_dir='pretrained_models/CosyVoice-300M-SFT',local_dir='pretrained_models/CosyVoice-300M-SFT')

# 预加载SFT模型
tts_model = CosyVoice('pretrained_models/CosyVoice-300M-SFT')
#tts_model = None
# 懒加载clone模型，在第一次克隆时加载
clone_model = None
#clone_model = CosyVoice('pretrained_models/CosyVoice-300M')


'''
app logs
'''
# 配置日志
# 禁用 Werkzeug 默认的日志处理器
log = logging.getLogger('werkzeug')
log.handlers[:] = []
log.setLevel(logging.WARNING)

app = Flask(__name__, 
    static_folder=root_dir+'/tmp', 
    static_url_path='/tmp')

root_log = logging.getLogger()  # Flask的根日志记录器
root_log.handlers = []
root_log.setLevel(logging.WARNING)
app.logger.setLevel(logging.WARNING) 
# 创建 RotatingFileHandler 对象，设置写入的文件路径和大小限制
file_handler = RotatingFileHandler(logs_dir+f'/{datetime.datetime.now().strftime("%Y%m%d")}.log', maxBytes=1024 * 1024, backupCount=5)
# 创建日志的格式
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# 设置文件处理器的级别和格式
file_handler.setLevel(logging.WARNING)
file_handler.setFormatter(formatter)
# 将文件处理器添加到日志记录器中
app.logger.addHandler(file_handler)


def base64_to_wav(encoded_str, output_path):
    if not encoded_str:
        raise ValueError("Base64 encoded string is empty.")

    # 将base64编码的字符串解码为字节
    wav_bytes = base64.b64decode(encoded_str)

    # 检查输出路径是否存在，如果不存在则创建
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    # 将解码后的字节写入文件
    with open(output_path, "wb") as wav_file:
        wav_file.write(wav_bytes)

    print(f"WAV file has been saved to {output_path}")


# 获取请求参数
def get_params(req):
    params={
        "text":"",
        "lang":"",
        "role":"中文女",
        "reference_audio":None,
        "reference_text":""
    }
    # 原始字符串
    params['text'] = req.args.get("text","").strip() or req.form.get("text","").strip()
    
    # 字符串语言代码
    params['lang'] = req.args.get("lang","").strip().lower() or req.form.get("lang","").strip().lower()
    # 兼容 ja语言代码
    if params['lang']=='ja':
        params['lang']='jp'
    elif params['lang'][:2] == 'zh':
        # 兼容 zh-cn zh-tw zh-hk
        params['lang']='zh'
    
    # 角色名 
    role = req.args.get("role","").strip() or req.form.get("role",'')
    if role:
        params['role']=role
    
    # 要克隆的音色文件    
    params['reference_audio'] = req.args.get("reference_audio",None) or req.form.get("reference_audio",None)
    encode=req.args.get('encode','') or req.form.get('encode','')
    if  encode=='base64':
        tmp_name=f'tmp/{time.time()}-clone-{len(params["reference_audio"])}.wav'
        base64_to_wav(params['reference_audio'],root_dir+'/'+tmp_name)
        params['reference_audio']=tmp_name
    # 音色文件对应文本
    params['reference_text'] = req.args.get("reference_text",'').strip() or req.form.get("reference_text",'')
    
    return params


def del_tmp_files(tmp_files: list):
    print('正在删除缓存文件...')
    for f in tmp_files:
        if os.path.exists(f):
            print('删除缓存文件:', f)
            os.remove(f)


# 实际批量合成完毕后连接为一个文件
def batch(tts_type,outname,params):
    text=params['text'].strip().split("\n")
    text=[t.replace("。",'，') for t in text]
    if len(text)>1 and not shutil.which("ffmpeg"):
        raise Exception('多行文本合成必须安装 ffmpeg')
    
    # 按行合成
    out_list=[]
    prompt_speech_16k=None
    if tts_type!='tts':
        if not params['reference_audio'] or not os.path.exists(f"{root_dir}/{params['reference_audio']}"):
            raise Exception(f'参考音频未传入或不存在 {params["reference_audio"]}')
        # prompt_speech_16k = load_wav(params['reference_audio'], 16000)
        try:
            prompt_speech_16k = load_wav(params['reference_audio'], 16000)
        except Exception as e:
            print(f"Error loading reference audio file: {e}")
            # 你可以选择返回合适的错误信息或执行其他处理
            return make_response(jsonify({"code": 500, "msg": f"Error loading reference audio: {str(e)}"}), 500)

    for i,t in enumerate(text):
        if not t.strip():
            continue
        tmp_name=f"{tmp_dir}/{time.time()}-{i}-{tts_type}.wav"
        print(f'{t=}\n{tmp_name=},\n{tts_type=}\n{params=}')
        if tts_type=='tts':
            # 仅文字合成语音
            output = tts_model.inference_sft(t, params['role'],stream=False)
        elif tts_type=='clone_eq':
            # 同语言克隆
            output=clone_model.inference_zero_shot(t,params['reference_text'], prompt_speech_16k)
        else:
            output = clone_model.inference_cross_lingual(f'<|{params["lang"]}|>{t}', prompt_speech_16k)
        try:
            torchaudio.save(tmp_name, output['tts_speech'], 22050)
        except TypeError as e:
            torchaudio.save(tmp_name, list(output)[0]['tts_speech'], 22050)
        out_list.append(tmp_name)
    if len(out_list)==0:
        raise Exception('合成失败')
    if len(out_list)==1:
        print(f"音频文件生成成功：{out_list[0]}")
        return out_list[0]
    # 将 多个音频片段连接
    txt_tmp="\n".join([f"file '{it}'" for it in out_list])
    txt_name=f'{time.time()}.txt'
    with open(f'{tmp_dir}/{txt_name}','w',encoding='utf-8') as f:
        f.write(txt_tmp)
    out_list.append(f'{tmp_dir}/{txt_name}')
    try:
        subprocess.run(["ffmpeg","-hide_banner", "-ignore_unknown","-y","-f","concat","-safe","0","-i",f'{tmp_dir}/{txt_name}',"-c:a","copy",tmp_dir + '/' + outname],
                   stdout=subprocess.PIPE,
                   stderr=subprocess.PIPE,
                   encoding="utf-8",
                   check=True,
                   text=True,
                   creationflags=0 if sys.platform != 'win32' else subprocess.CREATE_NO_WINDOW)
    except Exception as e:
        del_tmp_files(out_list)
        print(e)
        raise
    else:
        del_tmp_files(out_list)
        print(f"音频文件生成成功：{tmp_dir}/{outname}")
        return tmp_dir + '/' + outname


# 单纯文字合成语音
@app.route('/tts', methods=['GET', 'POST'])        
def tts():
    params=get_params(request)
    if not params['text']:
        return make_response(jsonify({"code":1,"msg":'缺少待合成的文本'}), 500)  # 设置状态码为500
        
    try:
        # 仅文字合成语音
        outname=f"{datetime.datetime.now().strftime('%Y%m%d-%H%M%S-')}-tts.wav"
        outname=batch(tts_type='tts',outname=outname,params=params)
    except Exception as e:
        print(e)
        return make_response(jsonify({"code":2,"msg":str(e)}), 500)  # 设置状态码为500
    else:
        return send_file(outname, mimetype='audio/x-wav')


# 新的路由函数，用于克隆并生成视频
#@app.before_first_request
def load_clone_model():
    global clone_model
    if not clone_model:
        print('Load the cloning model for the first time....')
        clone_model = CosyVoice('pretrained_models/CosyVoice-300M')

# 新的路由函数，用于克隆并生成视频
@app.route('/clone_and_generate_video', methods=['POST'])
def clone_and_generate_video():
    # global clone_model
    # if not clone_model:
    #     print('Load the cloning model for the first time....')
    #     clone_model = CosyVoice('pretrained_models/CosyVoice-300M')
    try:
        params = get_params(request)
        print("API服务端接收到的请求数据:", params)
        if not params['text']:
            return make_response(jsonify({"code": 3, "msg": '缺少待合成的文本'}), 500)
        if not params['reference_text']:
            return make_response(jsonify({"code": 4, "msg": '必须设置参考音频对应的参考文本reference_text'}), 500)

        # 生成音频
        outname = f"{datetime.datetime.now().strftime('%Y%m%d-%H%M%S-')}-clone_eq.wav"
        relative_audio_path = batch(tts_type='clone_eq', outname=outname, params=params)
        # 将相对音频路径转换为绝对路径
        audio_path = os.path.abspath(relative_audio_path)

        # 获取图像路径参数
        image_path = request.form.get('image_path')
        if not image_path:
            return jsonify({"error": "No image path provided"}), 400

        # 切换到sadtalker目录（这里假设sadtalker在D:/Download/sadTalker，根据实际情况修改）
        sadtalker_dir = "D:/Projects/FYP/TellusSimpleVersion/backend/SadTalker"
        os.chdir(sadtalker_dir)

        # 构建sadtalker命令
        sadtalker_cmd = [
            "D:\Projects\FYP\TellusSimpleVersion\\backend\SadTalker\python\python", "inference.py",
            "--driven_audio", audio_path,
            "--source_image", image_path,
            "--still"
        ]

        # 运行sadtalker命令
        subprocess.run(sadtalker_cmd, check=True)

        results_dir = os.path.join(sadtalker_dir, "results")
        # 获取results目录下所有的.mp4文件列表
        video_files = [f for f in os.listdir(results_dir) if f.endswith('.mp4')]
        if video_files:
            # 通过比较文件的修改时间，找到最新的视频文件
            latest_video = max(video_files, key=lambda x: os.path.getmtime(os.path.join(results_dir, x)))
            video_file_name = os.path.join(results_dir, latest_video)
            return jsonify({"video_path": video_file_name})
        else:
            return jsonify({"error": "Video file not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


# 跨语言文字合成语音        
@app.route('/clone_mul', methods=['GET', 'POST'])        
def clone_mul():
    global clone_model
    if not clone_model:
        print('第一次克隆加载模型...')
        clone_model = CosyVoice('pretrained_models/CosyVoice-300M')
    try:
        params=get_params(request)
        if not params['text']:
            return make_response(jsonify({"code":6,"msg":'缺少待合成的文本'}), 500)  # 设置状态码为500
        if not params['lang']:
            return make_response(jsonify({"code":7,"msg":'必须设置待合成文本的语言代码'}), 500)  # 设置状态码为500
            
        outname=f"{datetime.datetime.now().strftime('%Y%m%d-%H%M%S-')}-clone_mul.wav"
        outname=batch(tts_type='clone_mul',outname=outname,params=params)
    except Exception as e:
        return make_response(jsonify({"code":8,"msg":str(e)}), 500)  # 设置状态码为500
    else:
        return send_file(outname, mimetype='audio/x-wav')





if __name__=='__main__':
    load_clone_model()
    host='127.0.0.1'
    port=9233
    print(f'\nLaunch api:http://{host}:{port}\n')
    try:
        from waitress import serve
    except Exception:
        app.run(host=host, port=port)
    else:
        serve(app,host=host, port=port)
    
