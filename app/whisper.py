import os
import openai
from dotenv import load_dotenv

# APIキー
load_dotenv(".envs")
openai.api_key = os.environ.get("OPENAI_API_KEY")

def speechfile_to_text(filename, lang):
    audio_file = open(filename, "rb")
    # 文字起こし
    transcript = openai.Audio.transcribe("whisper-1", audio_file, language=lang)
    text = transcript["text"]
    return text
