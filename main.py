from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.auth import get_db, create_access_token, pwd_context, GenderEnum
from app.database import User
from app.routers import asistan, products
from app.handlers import setup_exception_handlers
from fastapi.security import OAuth2PasswordRequestForm
from app.static_config import setup_static_mounts



app = FastAPI(title="Torun", description="Dijital Torununuz İş Başında")



# CORS AYARI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
setup_static_mounts(app)
setup_exception_handlers(app)

# DİKKAT: Router'ları sadece birer kez ekliyoruz
app.include_router(asistan.router)
app.include_router(products.router)

@app.post("/register", status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register_user(first_name: str, last_name: str, email: str, password: str, 
                  birth_date_str: str = Query(..., description="Gün.Ay.Yıl formatında"), 
                  gender: GenderEnum = Query(...), db: Session = Depends(get_db)):
    
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı efendim.")

    try:
        parsed_birth_date = datetime.strptime(birth_date_str, "%d.%m.%Y").date()
        new_user = User(
            first_name=first_name, 
            last_name=last_name, 
            email=email,
            password=pwd_context.hash(password), 
            birth_date=parsed_birth_date, 
            gender=gender.value
        )
        db.add(new_user)
        db.commit()
        return {"message": f"Hoş geldiniz {first_name} efendim!"}
    except Exception:
        raise HTTPException(status_code=400, detail="Kayıt sırasında bir hata oluştu amcacığım.")

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