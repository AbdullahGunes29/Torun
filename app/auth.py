from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import SessionLocal, User
from enum import Enum


SECRET_KEY = "torun_gizli_anahtar_99"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 43829

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class GenderEnum(str, Enum):
    erkek = "erkek"
    kiz = "kız"
    sec = "seç"

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None: raise HTTPException(status_code=401)
    except JWTError: raise HTTPException(status_code=401, detail="Oturum dolmuş amcacığım.")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user: raise HTTPException(status_code=401)
    return user