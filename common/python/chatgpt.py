import openai


# OpenAI APIを介してGPT-3に対話する
def ask(question, lang):
    if(lang == "ja"):
        role_system = "日本語で簡潔に回答してください。"
    elif(lang == "en"):
        role_system = "Answer in English in brief."
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": role_system},
            {"role": "user", "content": question}
        ],
        stream=True
    )
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
                # 一文の区切りが来たら、その文を返す
                if any(word in content for word in target_char):
                    # 一文を送る。送った後にsentenceを空にするため、別の変数へ
                    response_text = sentence
                    sentence = ""
                    yield response_text
    #else:  
    #    messages += [{'role': 'assistant', 'content': response_text}]