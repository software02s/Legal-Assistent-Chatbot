import sys
import os

# Add the parent directory (backend) to sys.path so Python can find utils.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils import match_question, clean_input  # import from backend/utils.py

def test_input_cleaning():
    raw = "   ÇFARË ËSHTË TVSH?!   "
    assert clean_input(raw) == "cfare eshte tvsh"

def test_question_match():
    db_q = ["cfare eshte tvsh", "si funksionon tvsh"]
    user_input = "çfarë është tvsh"
    assert match_question(user_input, db_q) is True
