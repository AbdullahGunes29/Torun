import os
import json
import PIL.Image
from google import genai 
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

instruction = """
Senin adın 'Torun'. Yaşlılar için e-ticaret asistanısın. 
KURAL 1: Çok kısa, net ve öz konuş. Asla lafı uzatma. 
KURAL 2: Ürün özelliklerini güncelledikten sonra uzun uzun tekrar sayma, sadece "Güncelledim amca, onaylıyor musun?" de.
KURAL 3: Kullanıcı "tamam", "evet", "onaylıyorum" dediğinde laf kalabalığı yapma, işlemi hemen tamamla.

[AJAN (AGENT) YETENEKLERİ - ÇOK ÖNEMLİ!]
Kullanıcının komutlarını arayüzde (sağ panelde) uygulamak için cevabının EN SONUNA her zaman gizli bir JSON komutu eklemelisin!

1. KAYDETME (KESİN İŞLEM): Kullanıcı "tamam", "evet", "onaylıyorum", "ekle" dediğinde ürünü başarıyla eklediğini söyle ve KESİNLİKLE şu komutu yolla:
|||{"command": "execute", "action": "save"}||| 

2. SİLME (KESİN İŞLEM): Kullanıcı bir ürünü silmeni isterse (örnek: "sandalyeyi sil"), sildiğini söyle ve şu komutu yolla:
|||{"command": "execute", "action": "delete", "target": "sandalye"}|||

3. LİSTELEME: Kullanıcı ürünlerini görmek isterse listelediğini söyle ve şu komutu yolla:
|||{"command": "list"}|||

4. FORM GÜNCELLEME: Kullanıcı yeni bir ürünün özelliklerini değiştirmek isterse (örnek: "fiyatı 100 yap"), "Güncelledim amca" de ve güncel veriyi şu formatta yolla:
|||{"product_name": "...", "price": "...", "description": "...", "image_path": "..."}|||
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
     
        # SADECE BURASI DEĞİŞTİ: Frontend formunun çalışması için JSON formatı istedik
        prompt = """
        Bu ürünü analiz et ve şu bilgileri eksiksiz ver:
        1. Ürün Adı (Kısa ve net)
        2. Teknik Özellikler (2-3 cümle)
        3. Tahmini Fiyat (Sadece rakam ve TL cinsinden)
        
        Cevabını SADECE şu JSON formatında ver, başka hiçbir metin ekleme:
        {
            "product_name": "Ürün adı",
            "price": "Fiyat",
            "description": "Özellikler",
            "voice_text": "Kullanıcı adı amca/teyze, fotoğrafı inceledim. Bu sanırım bir [ürün adı]. Fiyatını [fiyat] olarak düşündüm. Onaylıyor musun, yoksa değiştirmemi ister misin?"
        }
        """
        
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=[prompt, img]
        )
        
        # JSON temizleme işlemi (React hata vermesin diye)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
            
        return json.loads(text)
    except Exception as e:
        print("Görsel Analiz Hatası:", e)
        return {
            "product_name": "Bilinmeyen Ürün",
            "price": "0 TL",
            "description": "Görsel analiz edilemedi.",
            "voice_text": "Efendim fotoğrafı tam seçemedim, bilgileri elle girebilir misiniz?"
        }