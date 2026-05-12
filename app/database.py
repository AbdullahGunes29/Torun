from sqlalchemy import create_engine, Column, Integer, String, Text, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Veritabanı dosyası
SQLALCHEMY_DATABASE_URL = "sqlite:///./torun_sistemi.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    birth_date = Column(Date)     # Gün-Ay-Yıl tutar
    gender = Column(String)       # Cinsiyet
    email = Column(String, unique=True, index=True)
    password = Column(String)     # Şifre
    
    # Kullanıcının ürünleriyle bağ kuruyoruz (Bakınca görülmesi için)
    products = relationship("Product", back_populates="owner")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String)         
    description = Column(Text)   
    price = Column(String)        
    image_path = Column(String)   
    created_at = Column(DateTime, default=datetime.utcnow) 
    is_active = Column(Boolean, default=True) 
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="products")


Base.metadata.create_all(bind=engine)

