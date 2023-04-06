import openai
import os
from dotenv import load_dotenv

# APIキー
load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")

prev_q = ""
prev_a = ""

# OpenAI APIを介してGPT-3に対話する
def ask(question, lang):
    global prev_q, prev_a
    if(lang == "ja"):
        role_system = "日本語で簡潔に回答してください。"
    elif(lang == "en"):
        role_system = "Answer in English in brief."
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            # 話し方の設定
            {"role": "system", "content": role_system},
            # 前回の質問
            {"role": "user", "content": prev_q},
            # 前回の質問に対する回答
            {"role": "assistant", "content": prev_a},
            # 現在の質問
            {"role": "user", "content": question}
        ],
        stream=True
    )

    print("prev_q = " + prev_q + ", prev_a = " + prev_a)

    # 前回の質問と回答をprev_qとprev_aに。
    # prev_aは前々回以前の回答は反映しないために、ここで消しておく
    prev_q = question
    prev_a = ""

    # 返答を受け取り、逐次yield
    sentence = ""
    target_char = ["。", "！", "？", "\n", ".", "!", "?"]
    for chunk in response:
        if chunk:
            # 返答のテキスト部分を抽出
            content = chunk['choices'][0]['delta'].get('content')
            # 一文になるまでsentenceに追加
            if content:
                sentence += content
                # 次回のために、すべての回答をまとめてprev_aへ
                prev_a += content
                # 一文の区切りが来たら、その文を返す
                if any(word in content for word in target_char):
                    # 一文を送る。送った後にsentenceを空にするため、別の変数へ
                    response_text = sentence
                    sentence = ""
                    yield response_text