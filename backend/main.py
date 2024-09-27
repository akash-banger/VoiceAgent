from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn
import logging

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

# Wrap with ASGI application
socket_app = socketio.ASGIApp(sio, app)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")
    await sio.emit('connection_established', f"Welcome, {sid}!")

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