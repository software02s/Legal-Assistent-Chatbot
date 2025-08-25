import re
from difflib import get_close_matches

import unicodedata

def clean_input(text):
    text = text.lower()
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ASCII', 'ignore').decode('ASCII')
    text = re.sub(r'[^\w\s]', '', text)
    text = text.strip()
    return text


def match_question(user_input, questions_list):
    user_input_clean = clean_input(user_input)
    for q in questions_list:
        q_clean = clean_input(q)
        if user_input_clean == q_clean:
            return True
        if get_close_matches(user_input_clean, [q_clean], cutoff=0.8):
            return True
    return False

from difflib import get_close_matches

def match_question(user_input, questions_list):
    user_input_clean = clean_input(user_input)
    for q in questions_list:
        q_clean = clean_input(q)
        if user_input_clean == q_clean:
            return True
        if get_close_matches(user_input_clean, [q_clean], cutoff=0.8):
            return True
    return False
