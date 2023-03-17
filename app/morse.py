

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
    morse_text = ""
    for char in text:
        if char.isalpha():
            morse_text += morse_code[char.upper()] + " "
        elif char.isdigit():
            morse_text += morse_code[char] + " "
        elif char == " ":
            morse_text += "/ "
    return morse_text

