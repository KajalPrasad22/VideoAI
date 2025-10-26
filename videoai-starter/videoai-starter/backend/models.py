
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.sqlite import JSON as SQLITE_JSON
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    videos = relationship("VideoAnalysis", back_populates="user")

class VideoAnalysis(Base):
    __tablename__ = "video_analyses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    youtube_url: Mapped[str] = mapped_column(String(500))
    title: Mapped[str] = mapped_column(String(400), default="")
    transcript: Mapped[str] = mapped_column(Text, default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    key_points = Column(SQLITE_JSON, default=list)
    mind_map = Column(SQLITE_JSON, default=dict)
    study_notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="videos")
