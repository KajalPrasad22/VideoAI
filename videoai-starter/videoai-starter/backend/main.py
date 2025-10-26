import os
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routes import auth, videos
from database import init_db

# -----------------------------
# Paths
# -----------------------------
# Path to frontend folder (adjust if your project layout differs)
frontend_path = os.path.join(os.path.dirname(__file__), "../frontend")
frontend_path = os.path.abspath(frontend_path)

assets_path = os.path.join(frontend_path, "assets")

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="VideoAI API", version="0.1.0")

# -----------------------------
# Enable CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# API Routers
# -----------------------------
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(videos.router, prefix="/api", tags=["videos"])

# -----------------------------
# Serve assets if present
# -----------------------------
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    print(f"[INFO] Mounted assets from: {assets_path}")
else:
    print(f"[WARNING] Assets folder not found at: {assets_path}")

# -----------------------------
# Serve HTML pages dynamically
# -----------------------------
def serve_page(page_name: str):
    async def page():
        file_path = os.path.join(frontend_path, page_name)
        file_path = os.path.abspath(file_path)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        print(f"[WARNING] Requested HTML file not found: {page_name}")
        return {"error": f"{page_name} not found"}
    return page

# Register routes for HTML files (both '/name' and '/name.html'; index -> '/')
if os.path.exists(frontend_path):
    html_files = [f for f in os.listdir(frontend_path) if f.endswith(".html")]
    print("[INFO] Registering HTML files:", html_files)

    for file_name in html_files:
        if file_name == "index.html":
            # root
            app.get("/")(serve_page(file_name))
            # also allow /index.html
            app.get("/index.html")(serve_page(file_name))
            print("[INFO] Registered routes: /  and /index.html ->", file_name)
        else:
            route_base = f"/{file_name[:-5]}"   # strip '.html'
            route_html = f"/{file_name}"        # keep '.html'
            app.get(route_base)(serve_page(file_name))
            app.get(route_html)(serve_page(file_name))
            print(f"[INFO] Registered routes: {route_base} and {route_html} -> {file_name}")
else:
    print("[WARNING] Frontend folder missing, no HTML routes registered. Expected at:", frontend_path)

# -----------------------------
# Startup event: initialize DB
# -----------------------------
@app.on_event("startup")
async def startup():
    try:
        init_db()
        print("[INFO] Database initialized.")
    except Exception as e:
        print("[ERROR] init_db() failed:", e)

    # double-check files exist (helpful debug)
    if os.path.exists(frontend_path):
        html_files = [f for f in os.listdir(frontend_path) if f.endswith(".html")]
        print("[INFO] On startup, found frontend HTML files:", html_files)
    else:
        print("[WARNING] Frontend folder not found at startup!")

# -----------------------------
# Optional test route
# -----------------------------
@app.get("/test")
async def test():
    return {"message": "FastAPI is working!"}
