from fastapi import FastAPI, File, UploadFile # File ve UploadFile'ı ekledik
import os
import shutil
from app.gemini import ask_assistant, analyze_product_image # Fonksiyonlarımızı aldık
# FastAPI uygulamasını başlat
app = FastAPI(
    title="OLD_MONEY MOD Backend",
    description="Yaşlılar için Yapay Zeka Destekli E-Ticaret Asistanı"
)

# 1. Ana Sayfa (Sistemin çalışıp çalışmadığını anlamak için)
@app.get("/")
def home():
    return {
        "durum": "HürTech Santrali Aktif",
        "mesaj": "OLD_MONEY MOD sistemine hoş geldiniz."
    }

# 2. Asistanla Konuşma Yolu (Endpoint)
# Tarayıcıdan soru sormamızı sağlayacak kısım burası
@app.get("/asistan")
def chat(soru: str):
    # Kullanıcının sorusunu al ve Gemini'ye gönder
    cevap = ask_assistant(soru)
    
    return {
        "kullanici_sorusu": soru,
        "asistan_cevabi": cevap
    }


from app.gemini import analyze_product_image
import shutil

@app.post("/urun-analizi")
async def upload_image(file: UploadFile = File(...)):
    # 1. Gelen fotoğrafı geçici olarak kaydet
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Gemini'ye fotoğrafı analiz ettir
    analiz_sonucu = analyze_product_image(temp_path)
    
    # 3. İşlem bitince geçici dosyayı sil (temizlik)
    os.remove(temp_path)
    
    return {"analiz": analiz_sonucu}