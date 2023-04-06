# モールス変換機 SpeechToMorse
 音声をモールス信号に変換します
 
 ▽ デモサイト  
 https://musemyuzu.com/flask/speech-to-morse
 
## 紹介動画
 https://youtu.be/xATNUI4lW0c
 
# ローカルでの実行
 Git clone または、右上の「Code」から「Download ZIP」でファイルをダウンロード・解凍します。  
 最低限、commonフォルダとtalk-gptフォルダがあれば動作します。
 
## 開発環境の作成
 Python3をインストールします。Anacondaを使っても構いません。
 
 仮想環境の作成をおすすめします。（``` python -m venv .venv ```や ``` conda create --name .venv python=3.10 ```など。.venvは仮想環境名。python=3.10でPythonも自動でダウンロード。）
 
 さらに、追加で以下をインストールします。（``` pip install ○○ ```や``` conda install ○○ ```）
 * Flask
 * pykakasi
 * openai
 * python_dotenv
 
 （注）Anacondaの人はopenaiのみ``` conda install openai ```としてもうまくインストールできなかったので、``` pip install openai ```を使用してください
 
## OpenAIのAPIキー設定
 [OpenAIのAPIのサイト](https://openai.com/blog/openai-api)から、APIキーを取得します。
 
 取得したら、他人に知られないように保管しましょう（Gitへのアップロードもだめです。）
 
 できたら、common>pythonフォルダ内に「.env」ファイルを作成し、
 ``` OPENAI_API_KEY = "あなたのAPIキー" ```
 を入力します。

## 必要ファイル・フォルダの作成
 * speech-to-morseフォルダ内に audio フォルダを作ってください
 * common>templatesフォルダ内に google_code.html を作ってください（広告コードやGtagを設置しない場合は何も書かなくてOK）
 
## 実行
 1. 仮想環境を立ち上げます。
 ``` .venv\Scripts\activate.ps1 ```
 
 2. appフォルダ内に移動（``` cd speech-to-morse ```など）
 
 3. 初回のみ、``` set FLASK_APP=app.py ```を入力・実行
 
 4. ``` flask run ``` でアプリ実行
 
 5. 127.0.0.1 にアクセス

たぶんこれで動きますが、うまくいかなければ[Twitter](https://twitter.com/musemyuzu)などで教えてください。
