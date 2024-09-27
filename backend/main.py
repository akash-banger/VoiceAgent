from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn
import logging
from fastapi import HTTPException
from src.db.helpers import create_user, get_user_by_id, get_user_by_username
from pydantic import BaseModel

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


@app.get("/")
async def root():
    return {"message": "Hello World"}

@sio.event
async def connect(sid, environ):
    user_id = environ.get('HTTP_USER_ID')
    if not user_id:
        logger.error(f"Connection attempt without user_id: {sid}")
        return False

    try:
        user = get_user_by_id(user_id)
        if user:
            logger.info(f"User {user.name} (ID: {user_id}) connected with SID: {sid}")
            await sio.emit('connection_established', f"Welcome, {user.name}!")
            return True
        else:
            logger.error(f"User with ID {user_id} not found")
            return False
    except Exception as e:
        logger.error(f"Error verifying user: {str(e)}")
        return False

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.on('ask_question')
async def handle_question(sid, data):
    logger.info(f"Received question from {sid}: {data}")
    # Process the question (you can add your logic here)
    response = f"You asked: {data}"
    await sio.emit('message', response, to=sid)

if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="127.0.0.1", port=8000, reload=True, log_level="info")