from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.auth import create_access_token, get_db, pwd_context, GenderEnum, get_current_user
from app.database import User
from datetime import date, datetime

router = APIRouter(tags=["Kimlik Doğrulama"])

class ProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    birth_date: str
    gender: str

@router.post("/register")
def register(
    first_name: str, 
    last_name: str, 
    email: str, 
    password: str, 
    birth_date_str: str, 
    gender: GenderEnum, 
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı .")

    try:
        day, month, year = map(int, birth_date_str.split('.'))
        b_date = date(year, month, day)
    except:
        raise HTTPException(status_code=400, detail="Tarih formatı hatalı (29.01.2004 gibi olmalı).")

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        gender=gender.value,
        birth_date=b_date,
        password=pwd_context.hash(password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "Kayıt başarılı, dükkan seni bekliyor!"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı.")
    
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user_name": user.first_name}

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
   
    return {
        "first_name": current_user.first_name or "",
        "last_name": current_user.last_name or "",
        "birth_date": str(current_user.birth_date) if current_user.birth_date else "",
        "gender": current_user.gender or "",
        "email": current_user.email
    }

@router.put("/profile/update")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    
    user.first_name = data.first_name
    user.last_name = data.last_name
    user.gender = data.gender

    if data.birth_date:
        try:
            user.birth_date = datetime.strptime(data.birth_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Doğum tarihi formatı YYYY-MM-DD olmalı.")
            
    db.commit()
    return {"message": "Profil bilgilerin güncellendi, hayırlı olsun."}