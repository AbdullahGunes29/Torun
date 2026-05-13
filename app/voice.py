import edge_tts
import io

VOICE = "tr-TR-AhmetNeural" 
SPEED = "-10%" 

async def generate_voice_stream(text: str):
    """Metni sese çevirir ve bir byte akışı (stream) döner."""
    communicate = edge_tts.Communicate(text, VOICE, rate=SPEED)
    
    audio_stream = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_stream.write(chunk["data"])
    
    audio_stream.seek(0)
    return audio_stream