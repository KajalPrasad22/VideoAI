
from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class SignUp(BaseModel):
    name: str
    email: EmailStr
    password: str

class Login(BaseModel):
    email: EmailStr
    password: str

class AnalyzeIn(BaseModel):
    youtube_url: str

class VideoOut(BaseModel):
    id: int
    youtube_url: str
    title: str | None = None
    transcript: str | None = None
    summary: str | None = None
    key_points: List[str] = []
    mind_map: Dict[str, Any] = {}
    study_notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
