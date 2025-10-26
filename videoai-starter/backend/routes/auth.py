from fastapi import APIRouter

router = APIRouter()

@router.get("/login")
async def login():
    return {"message": "Login endpoint working!"}

@router.get("/register")
async def register():
    return {"message": "Register endpoint working!"}
