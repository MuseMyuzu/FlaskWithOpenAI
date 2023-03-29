import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'secret-key.json'
from google.cloud import texttospeech

# クライアントをインスタンス化します
client = texttospeech.TextToSpeechClient()

# テキストと言語（enまたはja）を音声に変換し、返す
def text_to_speech(text, lang):
    # 合成するテキスト入力を設定します
    synthesis_input = texttospeech.SynthesisInput(text=text)

    if lang == "en":
        lang_code = "en-US"
    elif lang == "ja":
        lang_code = "ja-JP"
    else:
        lang_code = "en-US"

    # 声のリクエストを構築し、言語コード（「en-US」）と
    # SSML音声のジェンダー（「neutral」）を選択します
    voice = texttospeech.VoiceSelectionParams(
        language_code=lang_code, ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
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
    return response.audio_content