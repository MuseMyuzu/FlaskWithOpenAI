import requests
import json
import os
import openai
from dotenv import load_dotenv

# APIキー
load_dotenv(".envs")
openai.api_key = os.environ.get("OPENAI_API_KEY")

def speechfile_to_text(filename):
    audio_file = open(filename, "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file)
    return transcript["text"]
