from modelscope import snapshot_download

snapshot_download('iic/CosyVoice-300M-SFT', local_dir='pretrained_models/CosyVoice-300M-SFT',cache_dir='pretrained_models/CosyVoice-300M')
snapshot_download('iic/CosyVoice-300M', local_dir='pretrained_models/CosyVoice-300M',cache_dir='pretrained_models/CosyVoice-300M')