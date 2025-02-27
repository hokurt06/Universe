def letterFrequency(text):
    frequency = {}
    for letter in text:
        if letter.isalpha():
            letter = letter.lower()
            frequency[letter] = frequency.get(letter, 0) + 1