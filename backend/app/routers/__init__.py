# app/routers/__init__.py

from fastapi import APIRouter
from .emails import router as emails_router
from .drafts import router as drafts_router
from .settings import router as settings_router
from .chat import router as chat_router

# Create the main router instance
main_router = APIRouter()

# Include all sub-routers, defining the prefix and tags here, 
# not in the main app.py file
main_router.include_router(emails_router, prefix="/emails", tags=["📧 Emails"])
main_router.include_router(drafts_router, prefix="/drafts", tags=["📝 Drafts"])
main_router.include_router(settings_router, prefix="/settings", tags=["⚙️ Settings"])
main_router.include_router(chat_router, prefix="/chat", tags=["💬 Chat Agent"])

# The main application will import the 'main_router' object from this file.