import openai


# OpenAI APIを介してGPT-3に対話する
def ask(question):
    response = openai.Completion.create(
        engine="gpt-3.5-turbo",
        messages={
            {"role": "system", "content": question}
        }
    )
    answer = response["choices"][0]["message"]["content"]
    return answer