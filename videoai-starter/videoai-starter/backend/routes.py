
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import VideoAnalysis
from database import SessionLocal
from schemas import AnalyzeIn, VideoOut
from auth import get_current_user
from ai import fetch_transcript, generate_summary, extract_key_points, generate_mind_map, generate_study_notes

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/analyze", response_model=VideoOut)
def analyze(data: AnalyzeIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        title, transcript = fetch_transcript(data.youtube_url)
    except Exception as e:
        raise HTTPException(400, f"Transcript error: {e}")
    summary = generate_summary(transcript)
    key_points = extract_key_points(transcript)
    mind_map = generate_mind_map(transcript)
    study_notes = generate_study_notes(transcript)

    v = VideoAnalysis(
        youtube_url=data.youtube_url, title=title, transcript=transcript,
        summary=summary, key_points=key_points, mind_map=mind_map, study_notes=study_notes, user_id=user.id
    )
    db.add(v); db.commit(); db.refresh(v)
    return v

@router.get("/videos", response_model=list[VideoOut])
def list_videos(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(VideoAnalysis).filter_by(user_id=user.id).order_by(VideoAnalysis.created_at.desc()).all()

@router.get("/videos/{vid}", response_model=VideoOut)
def get_video(vid: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    v = db.get(VideoAnalysis, vid)
    if not v or v.user_id != user.id:
        raise HTTPException(404, "Not found")
    return v
