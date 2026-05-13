from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_exception_handlers(app):
    """
    Uygulama genelindeki tüm hataları maskeleyen ve loglayan fonksiyon.
    """
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"HATA OLUŞTU: {request.method} {request.url}")
        logger.error(f"Detay: {exc}")

        return JSONResponse(
            status_code=500,
            content={
                "torun_yaniti": "Kusura bakmayın efendim, şu an küçük bir teknik aksaklık yaşıyorum. Torununuz hemen ilgileniyor, lütfen birazdan tekrar deneyin.",
                "hata_kodu": "TORUN_500"
            },
        )