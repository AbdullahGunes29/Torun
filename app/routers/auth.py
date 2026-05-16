from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.auth import create_access_token, get_db, pwd_context, GenderEnum
from app.database import User
from datetime import date

router = APIRouter(tags=["Kimlik Doğrulama"])

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
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı amca.")

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
    return {"message": "Kayıt başarılı amca, dükkan seni bekliyor!"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı amca.")
    
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user_name": user.first_name}