import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'secret-key.json'
from google.cloud import texttospeech

# クライアントをインスタンス化します
client = texttospeech.TextToSpeechClient()

# 合成するテキスト入力を設定します
synthesis_input = texttospeech.SynthesisInput(text="今日はいい天気ですね")

# 声のリクエストを構築し、言語コード（「en-US」）と
# SSML音声のジェンダー（「neutral」）を選択します
voice = texttospeech.VoiceSelectionParams(
    #language_code="en-US", ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    language_code="ja-JP", ssml_gender=texttospeech.SsmlVoiceGender.MALE
)

# 返されるオーディオファイルの種類を選択します
audio_config = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.MP3
)

# 選択した音声パラメータとオーディオファイルタイプを使用して、
# テキスト入力に対してテキストから音声に変換するリクエストを実行します
response = client.synthesize_speech(
    input=synthesis_input, voice=voice, audio_config=audio_config
)

# responseのaudio_contentはバイナリです。
with open("output.mp3", "wb") as out:
    # レスポンスを出力ファイルに書き込みます。
    out.write(response.audio_content)
    print('Audio content written to file "output.mp3"')