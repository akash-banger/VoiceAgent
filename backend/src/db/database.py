import uuid
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from src.constants import EVVA_DB_CONNECTION_STRING

# Define the SQLAlchemy ORM model for the leads table
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False)
    date_created = Column(DateTime, default=datetime.now)
    date_modified = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class Question(Base):
    __tablename__ = 'questions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(String, nullable=False)
    date_created = Column(DateTime, default=datetime.now)
    date_modified = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class Answer(Base):
    __tablename__ = 'answers'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_content = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    question_id = Column(UUID(as_uuid=True), nullable=False)
    date_created = Column(DateTime, default=datetime.now)
    date_modified = Column(DateTime, default=datetime.now, onupdate=datetime.now)

# Main function to execute the script
def get_session():
    # Database connection setup
    DATABASE_URI = EVVA_DB_CONNECTION_STRING
    engine = create_engine(DATABASE_URI)
    Session = sessionmaker(bind=engine)
    session = Session()

    return session