import os
from google import genai 
from google.genai import types
from dotenv import load_dotenv
import PIL.Image

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

instruction = """
Sen OLD_MONEY MOD sisteminin resmi asistanısın. 
Kullanıcı kitlen yaşlı bireyler olduğu için çok nazik ve sabırlı olmalısın. 
Teknik terimlerden kaçın, bir torun sıcaklığıyla yardımcı ol.
"""

def ask_assistant(user_input: str):
    try:
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite', 
            config=types.GenerateContentConfig(system_instruction=instruction),
            contents=user_input
        )
        return response.text
    except Exception as e:
        return f"Kusura bakma amcacığım/teyzeciğim, bir hata oldu: {str(e)}"

def analyze_product_image(image_path: str):
    try:
        img = PIL.Image.open(image_path)
        prompt = "Bu fotoğrafı analiz et. Yaşlı bir satıcı için ürün adı ve açıklama oluştur."
        
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            config=types.GenerateContentConfig(system_instruction=instruction),
            contents=[prompt, img]
        )
        return response.text
    except Exception as e:
        return f"Fotoğrafı inceleyemedim evladım: {str(e)}"