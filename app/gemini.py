import os
from google import genai 
from google.genai import types
from dotenv import load_dotenv
import PIL.Image

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

instruction = """
Senin adın 'Torun'. Torun sisteminin resmi asistanısın. 
Kullanıcı kitlen yaşlı bireyler. Çok nazik ve sabırlı ol ama çok kısa ve öz konuş. 
Amca ve teyzelerin vaktini çalma, doğrudan yardımcı ol. Görev ne ise onu yap. Gereksiz cümlelerden kaçın.
Selamlaşmalarda sadece 'Merhaba efendim, ben Torun size nasıl yardımcı olabilirim?' bu ifadeyi sohbet ilk başladığında kullan.
"""

def ask_assistant(user_input: str, history=None):
    try:
        if history is None:
            history = []
       
        chat = client.chats.create(
            model='gemini-3.1-flash-lite',
            config=types.GenerateContentConfig(system_instruction=instruction),
            history=history
        )
        
        response = chat.send_message(user_input)
        return response.text
    except Exception as e:
        return f"Kusura bakmayın efendim, bir sorun oldu: {str(e)}"

def analyze_product_image(image_path: str):
    try:
        img = PIL.Image.open(image_path)
     
        prompt = """
        Bu ürünü analiz et ve şu bilgileri eksiksiz ver:
        1. Ürün Adı (Kısa ve net)
        2. Teknik Özellikler (2-3 cümle)
        3. Tahmini Fiyat (Sadece rakam ve TL cinsinden)
        
        Cevabını şu formatta ver:
        İSİM: [isim]
        ÖZELLİK: [özellikler]
        FİYAT: [fiyat]
        """
        
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            config=types.GenerateContentConfig(system_instruction=instruction),
            contents=[prompt, img]
        )
        return response.text
    except Exception as e:
        return f"Fotoğrafı göremedim efendim: {str(e)}"