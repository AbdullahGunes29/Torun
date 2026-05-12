from fastapi import FastAPI, File, UploadFile 
import os
import shutil
from app.gemini import ask_assistant, analyze_product_image 

app = FastAPI(
    title="OLD_MONEY MOD Backend",
    description="Yaşlılar için Yapay Zeka Destekli E-Ticaret Asistanı"
)

@app.get("/")
def home():
    return {
        "durum": "HürTech Santrali Aktif",
        "mesaj": "OLD_MONEY MOD sistemine hoş geldiniz."
    }

@app.get("/asistan")
def chat(soru: str):
    
    cevap = ask_assistant(soru)
    
    return {
        "kullanici_sorusu": soru,
        "asistan_cevabi": cevap
    }


from app.gemini import analyze_product_image
import shutil

@app.post("/urun-analizi")
async def upload_image(file: UploadFile = File(...)):
    
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    analiz_sonucu = analyze_product_image(temp_path)
    
    os.remove(temp_path)
    
    return {"analiz": analiz_sonucu}