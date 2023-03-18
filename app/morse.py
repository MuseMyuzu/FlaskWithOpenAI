import pykakasi

kks = pykakasi.kakasi()

# Define the Morse code conversion function
def convert_to_morse_code(text):
    # Add your Morse code conversion algorithm here
    morse_code = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
        'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
        'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
        '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
    }
    
    res_dict = kks.convert(text)
    result = ''.join([item['hira'] for item in res_dict])

    morse_text = ""
    for char in result:
        if char.upper() in morse_code:
            morse_text += morse_code[char.upper()] + " "
        elif char == " ":
            morse_text += "/ "
        else:
            morse_text += "[" +char+ "]"
    return morse_text

