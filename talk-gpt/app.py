# Flask
# Copyright 2010 Pallets

# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:

# 1.  Redistributions of source code must retain the above copyright
#     notice, this list of conditions and the following disclaimer.

# 2.  Redistributions in binary form must reproduce the above copyright
#     notice, this list of conditions and the following disclaimer in the
#     documentation and/or other materials provided with the distribution.

# 3.  Neither the name of the copyright holder nor the names of its
#     contributors may be used to endorse or promote products derived from
#     this software without specific prior written permission.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
# PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
# TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
# PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
# LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
# NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

from flask import Flask, render_template, request
import sys
sys.path.append("../common/python")
import whisper
import text_to_speech
import json
import uuid
import os
import datetime
import base64

# テンプレート、staticはFlaskWithOpenAIフォルダから
app = Flask(__name__, static_url_path="", static_folder="../", template_folder="../")

# 1日以上経過したファイルを削除
def remove_old_files(folder_path):
    now = datetime.datetime.now()
    # ファイルのリストを取得
    files = os.listdir(folder_path)

    for file in files:
        file_path = os.path.join(folder_path, file)
        if os.path.isfile(file_path):
            # ファイルの更新日時を取得
            modified_time = datetime.datetime.fromtimestamp(os.path.getmtime(file_path))
            # 現在の日時と比較し、1日以上経過したファイルを削除
            if (now - modified_time).days > 1:
                os.remove(file_path)
                print(f"{file}を削除しました")

# 録音した音声データを保存する
@app.route('/save_audio', methods=['POST'])
def save_wav():
    # 録音した音声を一時的に保存するファイル名
    WEBM_FILE = './audio/recording_' + str(uuid.uuid4()) + '.webm'
    # オーディオデータの入ったファイルのパスのみ
    AUDIO_PATH = './audio/'
    # javascriptからファイルを受け取る
    audio_file = request.files["audio_data"]
    lang_file = request.files["lang"]
    # 音声データをwebm形式で保存
    audio_data = audio_file.read()
    with open(WEBM_FILE, "wb") as f:
        f.write(audio_data)
    # テキストデータを保存
    lang_text = lang_file.read().decode("utf-8")
    
    text = whisper.speechfile_to_text(WEBM_FILE, lang_text)
    # 日本語の場合、記号を全角のものに置き換える
    if lang_text == "ja":
        text = text.translate(str.maketrans({"!": "！", "?": "？", "(": "（", ")": "）"}))
    print(text)

    speech_data = text_to_speech.text_to_speech(text, lang_text)
    speech_data_base64 = base64.b64encode(speech_data).decode("utf-8")

    result_dict = dict(user_text=text, bot_speech=speech_data_base64)

    os.remove(WEBM_FILE)
    # 1日以上経過したものは削除
    remove_old_files(AUDIO_PATH)
    
    # jsonを返す
    return json.dumps(result_dict)
    

# ホームページ
@app.route('/')
def home():
    duration = request.args.get("dur", "")
    return render_template('./talk-gpt/templates/index.html', dur=duration)

# 設定・リンク等
@app.route("/settings")
def settings_ja():
    return render_template("./talk-gpt/templates/settings/settings_ja.html")
@app.route("/settings-en")
def settings_en():
    return render_template("./talk-gpt/templates/settings/settings_en.html")

# サーバ起動
if __name__ == '__main__':
    app.run(debug=True)