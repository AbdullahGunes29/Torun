from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.products import router as product_router
from app.routers.asistan import router as asistan_router
from app.handlers import setup_exception_handlers
from app.static_config import setup_static_mounts

app = FastAPI(title="Torun Sistemi")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)
setup_static_mounts(app)

app.include_router(auth_router)
app.include_router(product_router)
app.include_router(asistan_router)

@app.get("/")
def health_check():
    return {"durum": "Torun sistemi ayakta, hizmete hazır!"}