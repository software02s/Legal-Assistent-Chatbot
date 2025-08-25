import mongomock
import pymongo
import datetime

# Patch pymongo.MongoClient to use mongomock before importing chat.py
pymongo.MongoClient = mongomock.MongoClient

import chat as chatbot

def test_fake_db_insert_and_read():
    chatbot.questions_collection.insert_one({
        "question": ["cfare eshte qiraja"],
        "answer": "Qiraja është marrëveshja për përdorimin e një pasurie."
    })

    doc = chatbot.questions_collection.find_one({"question": {"$in": ["cfare eshte qiraja"]}})
    assert doc is not None
    assert "qiraja" in doc["answer"].lower()
