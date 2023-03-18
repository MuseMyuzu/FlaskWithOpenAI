from flask import Flask, render_template, request, jsonify
import whisper
import morse
import json

app = Flask(__name__)

# 録音した音声を一時的に保存するファイル名
WEBM_FILE = 'recording.webm'

# 録音した音声データを保存する
@app.route('/save_wav', methods=['POST'])
def save_wav():
    # javascriptからファイルを受け取る
    audio_file = request.files["audio_data"]
    lang_file = request.files["lang"]
    # 音声データをwebm形式で保存
    audio_data = audio_file.read()
    with open(WEBM_FILE, "wb") as f:
        f.write(audio_data)
    # テキストデータを保存
    lang_text = lang_file.read().decode("utf-8")
    
    text= whisper.speechfile_to_text("recording.webm", lang_text)
    print(text)

    morse_text = morse.convert_to_morse_code(text)
    print(morse_text)
    
    # jsonを返す
    """
    response_data = {"status": "success"}
    return jsonify(response_data)
    """
    return json.dumps(text)
    

# ホームページ
@app.route('/')
def home():
    return render_template('index.html')

# サーバ起動
if __name__ == '__main__':
    app.run(debug=True)