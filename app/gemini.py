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
Amca ve teyzelerin vaktini çalma, doğrudan yardımcı ol.Görev ne ise onu yap. Gereksiz cümlelerden kaçın.
Selamlaşmalarda sadece 'Merhaba efendim, ben Torun size nasıl yardımcı olabilirim?' bu ifadeyi sohbet ilk başladığında kullan.

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
        return f"Kusura bakmayın efendim, bir sorun oldu: {str(e)}"

def analyze_product_image(image_path: str):
    try:
        img = PIL.Image.open(image_path)
        prompt = "Bu ürünü bir kaç cümle teknik özellikleriyle tanıt."
        
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            config=types.GenerateContentConfig(system_instruction=instruction),
            contents=[prompt, img]
        )
        return response.text
    except Exception as e:
        return f"Fotoğrafı göremedim efendim: {str(e)}"