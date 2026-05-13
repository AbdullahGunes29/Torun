from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth import get_db, get_current_user
from app.database import User, Message
from app.gemini import ask_assistant
from app.voice import generate_voice_stream
from fastapi.responses import StreamingResponse
from google.genai import types

router = APIRouter(tags=["Asistan"])

@router.get("/asistan")
def chat(soru: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_messages = db.query(Message).filter(Message.user_id == current_user.id).order_by(Message.timestamp.asc()).limit(10).all()
    
    history = [types.Content(role=msg.role, parts=[types.Part(text=msg.content)]) for msg in db_messages]
    
    ozel_soru = f"Kullanıcı adı: {current_user.first_name}. Soru: {soru}"
    cevap = ask_assistant(ozel_soru, history=history)
    
    db.add(Message(user_id=current_user.id, role="user", content=soru))
    db.add(Message(user_id=current_user.id, role="model", content=cevap))
    db.commit()
    return {"torun_yaniti": cevap}

@router.get("/asistan-sesli")
async def chat_voice(soru: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    response = chat(soru=soru, db=db, current_user=current_user)
    cevap_metni = response["torun_yaniti"]
    audio_data = await generate_voice_stream(cevap_metni)
    return StreamingResponse(audio_data, media_type="audio/mpeg")