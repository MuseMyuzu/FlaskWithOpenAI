from flask import Flask, render_template, request, jsonify
import whisper
import morse
import json
import pykakasi

app = Flask(__name__)

WEBM_FILE = 'recording.webm'

@app.route('/save_wav', methods=['POST'])
def save_wav():
    audio_file = request.files["audio_data"]
    lang_file = request.files["lang"]
    audio_data = audio_file.read()
    with open(WEBM_FILE, "wb") as f:
        f.write(audio_data)
    lang_text = lang_file.read().decode("utf-8")
    
    text = whisper.speechfile_to_text(WEBM_FILE, lang_text)
    if lang_text == "ja":
        text = text.translate(str.maketrans({"!": "！", "?": "？", "(": "（", ")": "）"}))
    print(text)

    kks = pykakasi.kakasi()
    kana_dict = kks.convert(text)
    kana_text = ''.join([item['hira'] for item in kana_dict])
    
    morse_text = morse.convert_to_morse_code(kana_text)
    print(morse_text)

    result_dict = dict(user_text=text, bot_text=morse_text)
    
    """
    response_data = {"status": "success"}
    return jsonify(response_data)
    """
    return json.dumps(result_dict)
    

@app.route('/')
def home():
    duration = request.args.get("dur", "")
    return render_template('index.html', dur=duration)

@app.route("/settings")
def settings_morse_ja():
    return render_template("morse/settings_morse_ja.html")
@app.route("/settings/en")
def settings_morse_en():
    return render_template("morse/settings_morse_en.html")

if __name__ == '__main__':
    app.run(debug=True)