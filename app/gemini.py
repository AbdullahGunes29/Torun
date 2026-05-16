import os, json, PIL.Image
from google import genai 
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# TORUN'UN ANA ZEKA MERKEZİ
instruction = """
Senin adın 'Torun'. Yaşlılar için e-ticaret asistanısın. 

[TEMEL KURALLAR]
1. ASLA LAFI UZATMA. Maksimum 1-2 kısa cümle kur.
2. Sadece işinle ilgili konuş. Amca/Teyze diye hitap et.
3. Kullanıcı ürün eklemek istediğinde sadece "Tabii amca, fotoğrafı sağa yükle hemen bakalım." de ve komutu ekle.

[TEKNİK KOMUT TABLOSU - KESİNLİKLE UYGULA]
Her cevabın sonuna ||| içine şu JSON'ları koy:

- Ürün Ekleme (Fotoğraf isteme): |||{"command": "add"}|||
- Ürün Listeleme: |||{"command": "list"}|||
- Form Güncelleme (Fiyat/İsim): |||{"product_name": "..", "price": "..", "description": ".."}|||
- Kesin Kayıt (Onay gelince): |||{"command": "execute", "action": "save"}|||

Örnek Yanıt: "Tabii amca, fotoğrafı sağa yükle hemen bakalım. |||{"command": "add"}|||"
"""

def ask_assistant(user_input: str, history=None):
    try:
        chat = client.chats.create(
            model='gemini-3.1-flash-lite', # MODEL SABİTLENDİ
            config=types.GenerateContentConfig(system_instruction=instruction),
            history=history or []
        )
        response = chat.send_message(user_input)
        return response.text
    except Exception as e:
        return f"Bir sorun oluştu amca: {str(e)}"

def analyze_product_image(image_path: str):
    try:
        img = PIL.Image.open(image_path)
        prompt = """
        Bu ürünü bir torun edasıyla amcana anlat.
        SADECE şu JSON formatında cevap ver:
        {
            "product_name": "Ürünün kısa adı",
            "price": "Sadece rakam",
            "description": "Ürünün ne işe yaradığını anlatan 2-3 cümlelik samimi bir açıklama",
            "voice_text": "Amca/Teyze, fotoğrafı inceledim. Bu harika bir [ürün]. Özellikleri şöyle: [açıklama]. Fiyatı da [fiyat] TL, dükkana koyalım mı?"
        }
        """
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=[prompt, img]
        )
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text)
    except:
        return {
            "product_name": "Bilinmeyen Ürün", 
            "price": "0", 
            "description": "Ürünü tam seçemedim amca, istersen sen biraz anlat.", 
            "voice_text": "Kusura bakma amca, fotoğraf biraz bulanık gelmiş."
        }