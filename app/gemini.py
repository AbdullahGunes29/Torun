import os, json, PIL.Image
from google import genai 
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# TORUN'UN ANA ZEKA MERKEZİ - SADE VE NET
instruction = """
Senin adın 'Torun'. Profesyonel bir e-ticaret satış asistanısın. 

[TEMEL KURALLAR]
1. KESİNLİKLE 'amca', 'teyze' gibi hitaplar kullanma. Hitap etmen gerekirse 'Efendim' veya doğrudan kullanıcıya odaklan.
2. ASLA LAFI UZATMA. Maksimum 1-2 kısa, net cümle kur.
3. Sadece e-ticaret ve dükkan yönetimi işinle ilgili konuş.
4. Kullanıcı ürün eklemek istediğinde sadece "Tabii ki, fotoğrafı sağa yükleyebilirsiniz, hemen inceleyelim." de ve ilgili komutu ekle.

[TEKNİK KOMUT TABLOSU - KESİNLİKLE UYGULA]
Sıradan selamlaşma veya sohbetlerde ASLA komut (|||) kullanma. Sadece kullanıcı net bir eylem (ürün ekleme, listeleme, silme, güncelleme) istediğinde cevabın sonuna ||| içine şu JSON'ları koy:

- Ürün Ekleme (Fotoğraf isteme): |||{"command": "add"}|||
- Ürün Listeleme: |||{"command": "list"}|||
- Form Güncelleme (Fiyat/İsim): |||{"product_name": "..", "price": "..", "description": ".."}|||
- Kesin Kayıt (Onay gelince): |||{"command": "execute", "action": "save"}|||

Örnek Yanıt: "Ürünlerinizi listeliyorum. |||{"command": "list"}|||"
"""

def ask_assistant(user_input: str, history=None):
    try:
        chat = client.chats.create(
            model='gemini-3.1-flash-lite',
            config=types.GenerateContentConfig(system_instruction=instruction),
            history=history or []
        )
        response = chat.send_message(user_input)
        return response.text
    except Exception as e:
        return f"Bir sorun oluştu: {str(e)}"

def analyze_product_image(image_path: str):
    try:
        img = PIL.Image.open(image_path)
        prompt = """
        Bu ürünü detaylıca analiz et.
        SADECE şu JSON formatında cevap ver:
        {
            "product_name": "Ürünün kısa adı",
            "price": "Sadece rakam",
            "description": "Ürünün ne işe yaradığını anlatan 2-3 cümlelik açıklama",
            "voice_text": "Ürünü inceledim. [ürün adı], özellikleri: [açıklama]. Fiyatı [fiyat] TL. Onaylıyor musunuz?"
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
            "description": "Ürünü tam seçemedim, istersen sen biraz anlat.", 
            "voice_text": "Kusura bakmayın, fotoğrafı analiz edemedim."
        }