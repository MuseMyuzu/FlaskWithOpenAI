import requests
import os
import openai
from dotenv import load_dotenv

# Whisper APIのエンドポイントURL
url = 'https://api.dls.nitech.ac.jp/v2/whisper'

# APIキー
load_dotenv(".envs")
openai.api_key = os.environ.get("OPENAI_API_KEY")

def speechfile_to_text(filename, lang):
    audio_file = open(filename, "rb")
    # 文字起こし
    transcript = openai.Audio.transcribe("whisper-1", audio_file, language=lang)
    text = transcript["text"]
    return text
