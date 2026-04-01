from sqlmodel import SQLModel, create_engine, Session
from models.domain import *
from config import get_settings
import os

settings = get_settings()
engine = create_engine(settings.app_database_url, echo=settings.debug)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
