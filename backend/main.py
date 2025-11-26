from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.config import settings
from app.services import file_service, llm_service, vector_service
from app import routers


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events - runs on startup and shutdown
    """
    # Startup
    print("=" * 60)
    print("🚀 Email Assistant API Starting...")
    print("=" * 60)
    
    try:
        # Validate configuration
        settings.validate()
        print("✓ Configuration validated")
        
        # Ensure data files exist
        file_service.ensure_files_exist()
        print("✓ Data files initialized")
        
        print("=" * 60)
        print("✅ Server ready!")
        print(f"📚 API Docs: http://localhost:8000/docs")
        print(f"🔧 Health Check: http://localhost:8000/health")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    print("\n👋 Shutting down Email Assistant API...")


# Initialize FastAPI app
app = FastAPI(
    title="Email Assistant API",
    description="AI-powered email management system with RAG chat capabilities",
    version="1.0.0",
    lifespan=lifespan
)

# ==================== CORS Configuration ====================
# For development, allow all origins
# For production, replace ["*"] with your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*", 
        "https://inbox-ai-beta.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# ==================== Include Routers ====================
app.include_router(
    routers.main_router,
    prefix="/api",
    # Note: Tags are now defined in __init__.py, but if you want 
    # a general tag for the entire API group, you can add it here.
)

# ==================== Root & Health Check ====================
@app.get("/", tags=["System"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": "Email Assistant API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for monitoring
    """
    try:
        # Check if files are accessible
        file_service.read_prompts()
        
        return {
            "status": "healthy",
            "services": {
                "file_service": "operational",
                "llm_service": "operational",
                "vector_service": "operational"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service unhealthy: {str(e)}"
        )


# ==================== Run Server ====================
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload on code changes (dev only)
    )