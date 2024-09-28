from src.constants import DEEPGRAM_API_KEY
from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource,
)

def transcribe_answer(audio_path: str) -> str:
    try:
        # STEP 1 Create a Deepgram client using the API key
        deepgram = DeepgramClient(DEEPGRAM_API_KEY)

        with open(audio_path, "rb") as file:
            buffer_data = file.read()

        payload: FileSource = {
            "buffer": buffer_data,
        }

        options = PrerecordedOptions(
            model="nova-2",
            smart_format=True,
        )

        response = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)

        return response.results.channels[0].alternatives[0].transcript

    except Exception as e:
        print(f"Exception: {e}")