from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os, shutil
from datetime import datetime
from pydantic import BaseModel
from app.auth import get_db, get_current_user
from app.database import User, Product
from app.gemini import analyze_product_image

router = APIRouter(tags=["Ürünler"])

class ProductConfirm(BaseModel):
    product_name: str
    description: str
    price: str
    image_path: str

# app/routers/products.py dosyasındaki analyze_product fonksiyonunu BUNUNLA DEĞİŞTİR:

@router.post("/analyze")
async def analyze_product(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    upload_dir = "uploads"
    if not os.path.exists(upload_dir): os.makedirs(upload_dir)
    
    file_path = os.path.join(upload_dir, f"{datetime.now().timestamp()}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Gemini'den gelen analiz ARTIK BİR SÖZLÜK (dict)
    analiz = analyze_product_image(file_path)
    
    # Eskiden olan .split('\n') döngüsü tamamen silindi çünkü artık doğrudan anahtarlarla erişiyoruz
    p_name = analiz.get("product_name", "Bilinmeyen Ürün")
    p_desc = analiz.get("description", "Açıklama belirtilmedi.")
    p_price = analiz.get("price", "0 TL")
    voice_text = analiz.get("voice_text", f"{current_user.first_name} amca, fotoğrafı inceledim.")

    return {
        "product_name": p_name,
        "description": p_desc,
        "price": p_price,
        "image_path": file_path,
        "voice_text": voice_text
    }
    # 4. Gelen sözlüğü (dict) doğrudan frontend'e gönder!
    return {
        "product_name": analiz_dict.get("product_name", "Bilinmeyen"),
        "price": str(analiz_dict.get("price", "0")).replace(" TL", "").strip(),
        "description": analiz_dict.get("description", "Açıklama yok"),
        "image_path": file_location,
        "voice_text": analiz_dict.get("voice_text", "Ürünü ekledim amca.")
    }

@router.post("/confirm")
async def confirm_product(data: ProductConfirm, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_product = Product(
        product_name=data.product_name,
        description=data.description,
        price=data.price,
        image_path=data.image_path,
        owner_id=current_user.id,
        is_active=True
    )
    db.add(new_product)
    db.commit()
    
    return {
        "mesaj": "Ürün eklendi",
        "voice_text": f"Hayırlı olsun {current_user.first_name} amca, {data.product_name} dükkana eklendi. Başka bir emrin var mı?"
    }

@router.get("/list")
def list_my_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).filter(Product.owner_id == current_user.id, Product.is_active == True).all()
    
    if not products:
        v_text = f"{current_user.first_name} amca, şu an dükkanın bomboş görünüyor. İstersen birkaç ürün ekleyelim."
    else:
        urun_isimleri = ", ".join([p.product_name for p in products])
        v_text = f"Şu an dükkanında {len(products)} tane ürün var amcacığım. Bunlar: {urun_isimleri}."

    return {
        "products": products,
        "voice_text": v_text
    }

@router.get("/delete-inquiry/{product_id}")
def delete_inquiry(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == current_user.id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı amcacığım.")
    

    voice_text = f"{current_user.first_name} amca, silmek istediğin ürün {product.product_name} mı? " \
                 f"Fiyatı {product.price} olan ürünün fotoğrafını ekrana getirdim, bir bak bakalım. Sileyim mi?"

    return {
        "product": product, 
        "voice_text": voice_text
    }

@router.delete("/delete-confirm/{product_id}")
def delete_confirm(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == current_user.id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün zaten yok veya silinemedi.")
    
    p_name = product.product_name
    product.is_active = False
    db.commit()
    
    return {
        "mesaj": "Ürün başarıyla kaldırıldı",
        "voice_text": f"Tamamdır {current_user.first_name} amca, {p_name} ürününü dükkandan kaldırdım. Tertemiz oldu!"
    }