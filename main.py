from fastapi import FastAPI, Depends, HTTPException, status, Query
from enum import Enum
from datetime import datetime
from sqlalchemy.orm import Session
from app.auth import get_db, create_access_token, pwd_context, GenderEnum
from app.database import User
from app.routers import asistan, products

app = FastAPI(title="Torun", description="Dijital Torununuz İş Başında")

app.include_router(asistan.router)
app.include_router(products.router)

@app.post("/register", status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register_user(first_name: str, last_name: str, email: str, password: str, 
                  birth_date_str: str = Query(..., description="Gün.Ay.Yıl formatında (Örn: 29.01.2004)"), 
                  gender: GenderEnum = Query(...), db: Session = Depends(get_db)):
    
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı efendim.")

    if len(password) < 6 or not any(c.isupper() for c in password) or not any(c.isdigit() for c in password):
        raise HTTPException(status_code=400, detail="Şifre en az 6 karakter, 1 büyük harf ve 1 rakam içermeli.")

    try:
        parsed_birth_date = datetime.strptime(birth_date_str, "%d.%m.%Y").date()
    except:
        raise HTTPException(status_code=400, detail="Tarih formatı hatalı amcacığım.")

    new_user = User(first_name=first_name, last_name=last_name, email=email,
                    password=pwd_context.hash(password), birth_date=parsed_birth_date, gender=gender.value)
    db.add(new_user)
    db.commit()
    return {"message": f"Hoş geldiniz {first_name} efendim!"}


from fastapi.security import OAuth2PasswordRequestForm


@app.post("/login", tags=["Auth"])
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
   
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Bilgiler hatalı amcacığım.")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user.first_name
    }