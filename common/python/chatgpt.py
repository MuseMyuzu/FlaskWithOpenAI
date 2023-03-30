import openai


# OpenAI APIを介してGPT-3に対話する
def ask(question):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": question}
        ]
    )
    answer = response["choices"][0]["message"]["content"]
    return answer