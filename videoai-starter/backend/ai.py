
import os, re, asyncio, json
from typing import List, Dict, Any
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
from yt_dlp import YoutubeDL
from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def extract_video_id(url: str) -> str | None:
    import urllib.parse as up
    try:
        qs = up.urlparse(url)
        if qs.hostname in ("youtu.be",):
            return qs.path.lstrip('/')
        if "youtube" in (qs.hostname or ""):
            q = up.parse_qs(qs.query).get("v", [None])[0]
            return q
    except Exception:
        pass
    return None

def fetch_transcript(youtube_url: str) -> tuple[str, str]:
    vid = extract_video_id(youtube_url)
    if not vid:
        raise ValueError("Invalid YouTube URL")
    try:
        transcript = YouTubeTranscriptApi.get_transcript(vid, languages=['en'])
        text = " ".join([x['text'] for x in transcript if x.get('text')])
        title = f"YouTube Video {vid}"
        return title, text
    except TranscriptsDisabled:
        # Fallback: download audio then transcribe via OpenAI Whisper if key available
        audio_path = download_audio(youtube_url)
        if OPENAI_API_KEY:
            text = openai_whisper_transcribe(audio_path)
            return f"YouTube Video {vid}", text
        else:
            raise RuntimeError("Transcript disabled and no OPENAI_API_KEY for Whisper.")

def download_audio(url: str) -> str:
    ydl_opts = {"format": "bestaudio/best", "outtmpl": "%(id)s.%(ext)s", "quiet": True}
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return f"{info['id']}.{info['ext']}"

def openai_whisper_transcribe(path: str) -> str:
    client = OpenAI(api_key=OPENAI_API_KEY)
    with open(path, "rb") as f:
        tr = client.audio.transcriptions.create(model="whisper-1", file=f)
    return tr.text

def openai_chat(prompt: str) -> str:
    if not OPENAI_API_KEY:
        return ""
    client = OpenAI(api_key=OPENAI_API_KEY)
    resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role":"user","content":prompt}])
    return resp.choices[0].message.content

def chunk_text(text: str, max_chars: int = 6000) -> List[str]:
    chunks = []
    while text:
        chunks.append(text[:max_chars])
        text = text[max_chars:]
    return chunks

def generate_summary(text: str) -> str:
    p = "Summarize the following lecture transcript into a clear, structured summary (150-250 words):\n"
    if OPENAI_API_KEY:
        parts = [openai_chat(p + c) for c in chunk_text(text)]
        return "\n".join(parts)
    # fallback: naive extractive approach
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return " ".join(sentences[:10])

def extract_key_points(text: str) -> List[str]:
    p = "List 8-12 exam-focused key points from this transcript as bullet items:"
    if OPENAI_API_KEY:
        out = openai_chat(p + "\n" + text)
        items = [re.sub(r'^[-*\s]+', '', line).strip() for line in out.splitlines() if line.strip()]
        return [i for i in items if i]
    # fallback
    words = text.split()
    return [f"Key point {i+1}: {' '.join(words[i*20:(i+1)*20])}" for i in range(min(10, len(words)//20))]

def generate_mind_map(text: str) -> Dict[str, Any]:
    p = "Create a JSON mind map with 'topic', and 'children' where each child has 'title' and optional 'children'. Focus on 5-8 main branches."
    if OPENAI_API_KEY:
        out = openai_chat(p + "\n" + text)
        try:
            return json.loads(out)
        except Exception:
            return {"topic":"Video","children":[{"title":"Overview"},{"title":"Details"}]}
    return {"topic":"Video","children":[{"title":"Point A"},{"title":"Point B"}]}

def generate_study_notes(text: str) -> str:
    p = "Turn this transcript into study notes with headings, bullets, definitions, and examples. Keep it concise but comprehensive."
    if OPENAI_API_KEY:
        return openai_chat(p + "\n" + text)
    return generate_summary(text)
