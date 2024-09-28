from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn
import logging
from fastapi import HTTPException
from src.db.helpers import create_user, get_user_by_id, get_user_by_username, get_unanswered_questions_by_user, create_or_update_answer
from pydantic import BaseModel
import base64
import os
from src.gemini_service.service import get_first_question, get_follow_up_question, get_conclusion, get_no_questions_left_message, get_user_not_found_message
from src.deepgram_service.transcription import transcribe_answer
from uuid import UUID

UPLOAD_FOLDER = "tmp"
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create a Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'
)

socket_app = socketio.ASGIApp(sio, app)

class UserCreate(BaseModel):
    username: str
    
@app.post("/api/users")
async def create_new_user(user: UserCreate):
    try:
        existing_user = get_user_by_username(user.username)
        if existing_user:
            return {"message": "User already exists", "user_id": str(existing_user.id)}
        new_user = create_user(user.username)
        return {"message": "User created successfully", "user_id": str(new_user.id)}
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@sio.event
async def connect(sid, environ):
    query_string = environ['QUERY_STRING']
    params = dict(param.split('=') for param in query_string.split('&'))
    user_id = params.get('userId')
    try:
        user = get_user_by_id(user_id)
        if user:
            logger.info(f"User {user.username} (ID: {user_id}) connected with SID: {sid}")
            questions = get_unanswered_questions_by_user(user.id)
            if len(questions) == 0:
                no_questions_left_message = get_no_questions_left_message()
                await sio.emit('connection_established', {"question_id": "", "question": no_questions_left_message, "username": user.username})
            else:
                first_question = get_first_question(questions, user.username)
                await sio.emit('connection_established', {"question_id": str(questions[0].id), "question": first_question, "username": user.username})
            return True
        else:
            user_not_found_message = get_user_not_found_message(reason="Wrong user ID")
            await sio.emit('user_not_found_message', {"message": user_not_found_message})
            logger.error(f"User with ID {user_id} not found")
            return True
    except Exception as e:
        user_not_found_message = get_user_not_found_message(reason="Wrong format of user ID")
        await sio.emit('user_not_found_message', {"message": user_not_found_message})
        logger.error(f"Error verifying user: {str(e)}")
        return False

@sio.on('get_answer')
async def handle_audio(sid, data):
    user_id = data.get('userId')
    audio_base64 = data.get('audio')
    prev_question_id = data.get('prevQuestionId')
    prev_question = data.get('prevQuestion')
    username = data.get('username')

    audio_data = base64.b64decode(audio_base64.split(",")[1])

    filename = f"{user_id}_audio.wav"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    with open(filepath, 'wb') as f:
        f.write(audio_data)
        
    # Call the transcription service here
    answer = transcribe_answer(filepath)

    unanswered_questions = create_or_update_answer(UUID(user_id), UUID(prev_question_id), answer)
    
    
    if(len(unanswered_questions) == 0):
        conclusion = get_conclusion(prev_question, answer, username)
        await sio.emit('conversation_concluded', {"conclusion": conclusion})
        return
    
    print(unanswered_questions[0].content)
    next_question = get_follow_up_question(prev_question, answer, unanswered_questions[0].content, username)

    
    await sio.emit('send_question', {"question_id": str(unanswered_questions[0].id), "question": next_question})
    
@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")
    
if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="127.0.0.1", port=8000, reload=True, log_level="info")