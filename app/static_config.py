from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

def setup_static_mounts(app: FastAPI):
    current_dir = os.getcwd()
    uploads_path = os.path.join(current_dir, "uploads")
    
    if not os.path.exists(uploads_path):
        os.makedirs(uploads_path)
        
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")