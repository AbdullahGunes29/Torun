from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
import os
import shutil
from app.gemini import ask_assistant, analyze_product_image 
from sqlalchemy.orm import Session
from datetime import date
from app.database import SessionLocal, User, Product

app = FastAPI(
    title="Torun",
    description="Dijital Torununuz İş Başında"
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    first_name: str, 
    last_name: str, 
    email: str, 
    password: str, 
    birth_year: int, 
    birth_month: int, 
    birth_day: int, 
    gender: str, 
    db: Session = Depends(get_db)
):
   
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı efendim.")

   
    user_birth_date = date(birth_year, birth_month, birth_day)

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password, 
        birth_date=user_birth_date,
        gender=gender
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": f"Hoş geldiniz {first_name} efendim! Kaydınız başarıyla tamamlandı."}


@app.post("/login")
def login_user(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email, User.password == password).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı amcacığım.")
    
    return {
        "message": f"Giriş başarılı! Merhaba {user.first_name} efendim.",
        "user_id": user.id 
    }

@app.get("/")
def home():
    return {
        "durum": "Torun hazır bekliyor efendim.",
        "mesaj": "Torun sistemine hoş geldiniz."
    }

@app.get("/asistan")
def chat(soru: str):
    cevap = ask_assistant(soru)
    return {
        "torun_yaniti": cevap
    }

@app.post("/urun-analizi")
async def upload_image(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    analiz_sonucu = analyze_product_image(temp_path)
    os.remove(temp_path)
    
    return {"analiz": analiz_sonucu}





