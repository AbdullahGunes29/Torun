# 1. Temel imaj: Python 3.13
FROM python:3.13-slim

# 2. Çalışma dizini
WORKDIR /app

# 3. Sistem bağımlılıkları (Bcrypt ve diğerleri için)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 4. Kütüphaneleri yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Tüm proje dosyalarını kopyala
COPY . .

# 6. Uygulamanın çalışacağı port
EXPOSE 8000

# 7. Sunucuyu başlat
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]