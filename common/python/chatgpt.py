import openai


# OpenAI APIを介してGPT-3に対話する
def ask(question, lang):
    if(lang == "ja"):
        role_system = "日本語で回答してください。"
    elif(lang == "en"):
        role_system = "Answer in English."
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": role_system},
            {"role": "user", "content": question}
        ],
        stream=True
    )
    # 返答を受け取り、逐次yield
    response_text = "" 
    sentence = ""
    target_char = ["。", "！", "？", "\n", ".", "!", "?"]
    for chunk in response:
        if chunk:
            content = chunk['choices'][0]['delta'].get('content')
            if content:
                response_text += content
                sentence += content
            if content in target_char:
                yield sentence
    #else:  
    #    messages += [{'role': 'assistant', 'content': response_text}]