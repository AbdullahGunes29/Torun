from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
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


@router.post("/analyze")
async def analyze_product(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    upload_dir = "uploads"
    if not os.path.exists(upload_dir): os.makedirs(upload_dir)
    
    file_name = f"{datetime.now().timestamp()}_{file.filename}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    analiz = analyze_product_image(file_path)
    relative_path = f"uploads/{file_name}"

    return {
        "product_name": analiz.get("product_name"),
        "description": analiz.get("description"),
        "price": str(analiz.get("price")).replace(" TL", ""),
        "image_path": relative_path,
    }

@router.post("/confirm")
async def confirm_product(data: ProductConfirm, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_product = Product(
        product_name=data.product_name,
        description=data.description,
        price=data.price,
        image_path=data.image_path,
        owner_id=current_user.id
    )
    db.add(new_product)
    db.commit()
    return {"mesaj": "Başarılı", "voice_text": f"Tamamdır {current_user.first_name} ürünü ekledim."}

@router.get("/list")
def list_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).filter(Product.owner_id == current_user.id, Product.is_active == True).all()
    return {"products": products}

@router.put("/update/{product_id}")
def update_product(product_id: int, data: ProductConfirm, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulamadım.")
    
    product.product_name = data.product_name
    product.description = data.description
    product.price = data.price
    db.commit()
    return {"message": "Ürün güncellendi, hayırlı olsun."}

@router.delete("/delete-confirm/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id, Product.owner_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulamadım.")
    
    db.delete(product)
    db.commit()
    return {"message": "Ürün dükkandan kaldırıldı."}

@router.post("/add")
async def manual_add_product(
    product_name: str = Form(...),
    description: str = Form(...),
    price: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_dir = "uploads"
    if not os.path.exists(upload_dir): os.makedirs(upload_dir)
    
    file_name = f"{datetime.now().timestamp()}_{file.filename}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    new_product = Product(
        product_name=product_name,
        description=description,
        price=price,
        image_path=f"uploads/{file_name}",
        owner_id=current_user.id
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"status": "success", "product": new_product}

