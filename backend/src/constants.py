import dotenv
import os

dotenv.load_dotenv()


DB_USERNAME = os.getenv("POSTGRES_POSTGRES_WRITER_USERNAME", "akash")

DB_PASSWORD = os.getenv("POSTGRES_POSTGRES_WRITER_PASSWORD", "akash")

DB_HOST = os.getenv("POSTGRES_POSTGRES_WRITER_HOST", "127.0.0.1")

DB_NAME = os.getenv("DB_NAME", "evva_health")

BASE_DB_CONNECTION_STRING = (
    f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}"
)

EVVA_DB_CONNECTION_STRING = (
    f"{BASE_DB_CONNECTION_STRING}/{DB_NAME}"
)
