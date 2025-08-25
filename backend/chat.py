from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from difflib import get_close_matches
import datetime
import re

app = Flask(__name__)
CORS(app)

# MongoDB connection setup
client = MongoClient('mongodb://localhost:27017/')
db = client['Chatbot']
ratings_collection = db['ratings']
keywords_collection = db['keywords']
questions_collection = db['questions']
logs_collection = db['logs']

def save_log(user_message, bot_response, time=None):
    if time is None:
        time = datetime.datetime.now(datetime.timezone.utc)
    log_doc = {
        "user_message": user_message,
        "bot_response": bot_response,
        "timestamp": time
    }
    print(f"Saving log: {log_doc}")
    logs_collection.insert_one(log_doc)

def load_ratings():
    ratings = []
    for r in ratings_collection.find({}, {"_id": 0}):
        ratings.append(r)
    return ratings

def save_rating(rating_value, time=None):
    if time is None:
        time = datetime.datetime.utcnow().isoformat()
    rating_doc = {
        "rating": rating_value,
        "time": time
    }
    ratings_collection.insert_one(rating_doc)

def gjej_pergjigje_faq(mesazhi):
    """
    Kërkon përgjigje në databazën FAQ duke përdorur fuzzy matching
    
    Args:
        mesazhi (str): Pyetja e përdoruesit
        
    Returns:
        str or None: Përgjigja nëse gjendet, None nese jo
    """
    # Merr të gjitha FAQs nga MongoDB
    faqs = list(questions_collection.find({}, {"_id": 0}))
    
    # Konverto mesazhin në lowercase dhe pastro nga shenjat e pikësimit
    mesazhi_clean = re.sub(r'[^\w\s]', '', mesazhi.lower()).strip()
    
    # Variabla për të ruajtur përputhjen më të mirë
    best_match = None
    best_score = 0
    best_answer = None
    
    for faq in faqs:
        # Sigurohu që 'question' është array
        if 'question' in faq and isinstance(faq['question'], list):
            # Për çdo pyetje në array
            for pytje in faq['question']:
                # Pastro pyetjen nga databaza
                pytje_clean = re.sub(r'[^\w\s]', '', pytje.lower()).strip()
                
                # Metoda 1: Kontroll për përputhje të plotë
                if mesazhi_clean == pytje_clean:
                    return faq.get('answer', 'Përgjigje nuk u gjet')
                
                # Metoda 2: Kontroll nëse pyetja e përdoruesit përmban pyetjen nga DB
                if pytje_clean in mesazhi_clean or mesazhi_clean in pytje_clean:
                    return faq.get('answer', 'Përgjigje nuk u gjet')
                
                # Metoda 3: Fuzzy matching me difflib
                matches = get_close_matches(mesazhi_clean, [pytje_clean], n=1, cutoff=0.6)
                if matches:
                    # Llogarit score bazuar në ngjashmërinë
                    from difflib import SequenceMatcher
                    score = SequenceMatcher(None, mesazhi_clean, pytje_clean).ratio()
                    
                    if score > best_score:
                        best_score = score
                        best_match = pytje
                        best_answer = faq.get('answer', 'Përgjigje nuk u gjet')
    
    # Nëse u gjet përputhje me score të mjaftueshëm
    if best_score >= 0.6:
        return best_answer
    
    # Metoda 4: Kontroll me fjalë kyçe
    mesazhi_words = set(mesazhi_clean.split())
    
    for faq in faqs:
        if 'question' in faq and isinstance(faq['question'], list):
            for pytje in faq['question']:
                pytje_words = set(re.sub(r'[^\w\s]', '', pytje.lower()).split())
                
                # Numëro fjalët e përbashkëta
                common_words = mesazhi_words.intersection(pytje_words)
                
                # Nëse ka të paktën 2 fjalë të përbashkëta (ose 60% të fjalëve)
                if len(common_words) >= 2 or (len(pytje_words) > 0 and len(common_words) / len(pytje_words) >= 0.6):
                    return faq.get('answer', 'Përgjigje nuk u gjet')
    
    return None

def merr_përgjigje_bot(user_message):
    """
    Funksioni kryesor për të marrë përgjigje nga boti
    """
    mesazhi_i_përdoruesit = user_message.lower()
    
    # Fillimisht kontrollo FAQ
    faq_pergjigje = gjej_pergjigje_faq(user_message)
    if faq_pergjigje:
        return faq_pergjigje

    # Pastaj kontrollo keywords
    all_keywords = list(keywords_collection.find({}, {"_id": 0}))
    keyword_words = [kw["word"].lower() for kw in all_keywords]

    matched_categories = set()
    # Ndarja e mesazhit në fjalë për krahasim me fuzzy matching
    user_words = mesazhi_i_përdoruesit.split()

    for fjalë in user_words:
        # Gjej fjalën më të ngjashme nga keywords me cutoff 0.75
        ngjashme = get_close_matches(fjalë, keyword_words, n=1, cutoff=0.75)
        if ngjashme:
            # Shto kategorinë për fjalën e ngjashme
            for kw in all_keywords:
                if kw["word"].lower() == ngjashme[0]:
                    matched_categories.add(kw["category"])

    # Përgjigjet bazuar në kategori (keywords)
    if "greeting" in matched_categories:
        return ("Përshëndetje! Unë jam asistenti juaj ligjor virtual. "
                "Jam këtu për t'ju ndihmuar me pyetje dhe çështje ligjore. "
                "Si mund t'ju ndihmoj sot?")
    elif "help" in matched_categories:
        return ("Patjetër! Ju lutem më tregoni më shumë rreth situatës suaj ligjore "
                "në mënyrë që të mund t'ju ofroj këshilla dhe informacion të përshtatshëm.")
    elif "thanks" in matched_categories:
        return ("Faleminderit për besimin tuaj! "
                "Në çdo moment jam në dispozicion për t'ju ndihmuar me çështjet ligjore që keni.")
    elif "farewell" in matched_categories:
        return ("Mirupafshim! Ju uroj suksese dhe drejtësi në çështjet tuaja ligjore. "
                "Mos hezitoni të ktheheni nëse keni nevojë për ndihmë të mëtejshme.")
    elif "question" in matched_categories:
        return ("Pyetje shumë e mirë! Ju lutem më jepni më shumë detaje mbi çështjen tuaj ligjore "
                "që të mund të jap këshilla të sakta dhe të dobishme.")
    elif "confirmation" in matched_categories:
        return ("Jam i lumtur që mund t'ju ndihmoj me aspektet ligjore të situatës tuaj. "
                "Nëse keni nevojë për ndihmë shtesë, mos ngurroni të kontaktoni.")
    elif "denial" in matched_categories:
        return ("E kuptoj. Jam gjithmonë në dispozicion për këshilla dhe ndihmë ligjore "
                "kurdo që të keni nevojë.")

    # Nëse nuk u gjet asnjë kategori e përshtatshme
    return ("Më vjen keq, nuk arrita të kuptoj pyetjen tuaj ligjore. "
            "Ju lutem, përpiquni ta riformuloni ose jepni më shumë detaje që t'ju ndihmoj më mirë.")

@app.route('/api/message', methods=['POST'])
def merr_mesazhin():
    mesazhi_i_përdoruesit = request.json.get('message')
    if not mesazhi_i_përdoruesit:
        return jsonify({"error": "Nuk është dërguar asnjë mesazh"}), 400

    përgjigja_e_botit = merr_përgjigje_bot(mesazhi_i_përdoruesit)

    save_log(mesazhi_i_përdoruesit, përgjigja_e_botit)

    return jsonify({"response": përgjigja_e_botit})

@app.route('/api/rating', methods=['POST'])
def post_rating():
    try:
        data = request.get_json()
        rating_value = data.get("rating", None)
        time = data.get("time", None)

        if rating_value is not None and 1 <= rating_value <= 5:
            save_rating(rating_value, time)
            return jsonify({"message": "Rating saved successfully!"}), 200
        else:
            return jsonify({"message": "Invalid rating. Rating must be between 1 and 5."}), 400
    except Exception as e:
        print(f"Error saving rating: {e}")
        return jsonify({"message": "Error saving rating"}), 500

# Endpoint për testim të FAQ
@app.route('/api/test-faq', methods=['POST'])
def test_faq():
    """
    Endpoint për të testuar FAQ search
    """
    question = request.json.get('question')
    if not question:
        return jsonify({"error": "No question provided"}), 400
    
    # Teston FAQ search
    result = gjej_pergjigje_faq(question)
    
    # Jep informacion të detajuar për debugging
    debug_info = {
        "question": question,
        "answer_found": result is not None,
        "answer": result if result else "No answer found",
        "total_faqs": questions_collection.count_documents({})
    }
    
    return jsonify(debug_info)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """
    Kthen statistika për databazën
    """
    stats = {
        "total_faqs": questions_collection.count_documents({}),
        "total_keywords": keywords_collection.count_documents({}),
        "total_logs": logs_collection.count_documents({}),
        "total_ratings": ratings_collection.count_documents({})
    }
    return jsonify(stats)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)