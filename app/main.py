from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status, Query
from enum import Enum
import os
import shutil
from app.gemini import ask_assistant, analyze_product_image 
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from app.database import SessionLocal, User, Product, Message
from google.genai import types 
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

class GenderEnum(str, Enum):
    erkek = "erkek"
    kiz = "kız"
    sec = "seç"

# --- GÜVENLİK AYARLARI ---
SECRET_KEY = "torun_gizli_anahtar_99" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 Saat

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(title="Torun", description="Dijital Torununuz İş Başında")

# --- YARDIMCI FONKSİYONLAR ---
def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Token'dan tanıyan fonksiyon
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None: raise HTTPException(status_code=401)
    except JWTError: raise HTTPException(status_code=401, detail="Oturum dolmuş amcacığım.")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user: raise HTTPException(status_code=401)
    return user

# --- ENDPOINTLER ---
@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    first_name: str, 
    last_name: str, 
    email: str, 
    password: str, 
    birth_date_str: str = Query(..., description="Gün.Ay.Yıl formatında giriniz (Örn: 29.01.2004)"), 
    gender: GenderEnum = Query(...), 
    db: Session = Depends(get_db)
):
    
    # E-posta kontrolü
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı efendim.")

    # Şifre Güvenlik Kontrolü 
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Şifreniz en az 6 karakter olmalı amcacığım.")
    if not any(char.isupper() for char in password):
        raise HTTPException(status_code=400, detail="Şifrenizde en az bir büyük harf olmalı.")
    if not any(char.islower() for char in password):
        raise HTTPException(status_code=400, detail="Şifrenizde en az bir küçük harf olmalı.")
    if not any(char.isdigit() for char in password):
        raise HTTPException(status_code=400, detail="Şifrenizde en az bir rakam olmalı.")

    try:
        parsed_birth_date = datetime.strptime(birth_date_str, "%d.%m.%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Tarihi lütfen Gün.Ay.Yıl formatında (Örn: 29.01.2004) girin amcacığım.")

    #  Kayıt işlemi
    new_user = User(
        first_name=first_name, 
        last_name=last_name, 
        email=email,
        password=pwd_context.hash(password), # şifreyi gizleme
        birth_date=parsed_birth_date,
        gender=gender.value
    )
    db.add(new_user)
    db.commit()
    return {"message": f"Hoş geldiniz {first_name} efendim!"}

@app.post("/login")
def login_user(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Bilgiler hatalı amcacığım.")
    
    # giriş kartını (token) veriyoruz
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user.first_name
    }

@app.get("/asistan")
def chat(soru: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    db_messages = db.query(Message).filter(Message.user_id == current_user.id).order_by(Message.timestamp.asc()).limit(10).all()
    
    history = []
    for msg in db_messages:
        history.append(types.Content(role=msg.role, parts=[types.Part(text=msg.content)]))
    
    ozel_soru = f"Kullanıcı adı: {current_user.first_name}. Soru: {soru}"
    cevap = ask_assistant(ozel_soru, history=history)
    
    db.add(Message(user_id=current_user.id, role="user", content=soru))
    db.add(Message(user_id=current_user.id, role="model", content=cevap))
    db.commit()
    return {"torun_yaniti": cevap}

@app.post("/urun-kaydet")
async def save_product(file: UploadFile = File(...), db: Session = Depends(get_db), 
                       current_user: User = Depends(get_current_user)):
    
    upload_dir = "uploads"
    if not os.path.exists(upload_dir): os.makedirs(upload_dir)
        
    file_path = os.path.join(upload_dir, f"{datetime.now().timestamp()}_{file.filename}")
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    
    analiz = analyze_product_image(file_path)
    
  
    p_name, p_desc, p_price = "Bilinmeyen", analiz, "Belirsiz"
    for line in analiz.split('\n'):
        if "İSİM:" in line: p_name = line.split(":", 1)[1].strip()
        if "ÖZELLİK:" in line: p_desc = line.split(":", 1)[1].strip()
        if "FİYAT:" in line: p_price = line.split(":", 1)[1].strip()

    new_product = Product(
        product_name=p_name, description=p_desc, price=p_price,
        image_path=file_path, owner_id=current_user.id, is_active=True
    )
    db.add(new_product)
    db.commit()
    return {"mesaj": f"Ürününüzü dükkana ekledim {current_user.first_name} amca!"}

# --- ÜRÜNLERİ LİSTELEME ---
@app.get("/urunlerim")
def get_my_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).filter(
        Product.owner_id == current_user.id, 
        Product.is_active == True
    ).all()
    
    return {"urunler": products}

# --- ÜRÜN SİLME  ---
@app.delete("/urun-sil/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == current_user.id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı veya silme yetkiniz yok amcacığım.")
    
    product.is_active = False
    db.commit()
    
    return {"mesaj": "Ürünü dükkandan kaldırdım efendim."}