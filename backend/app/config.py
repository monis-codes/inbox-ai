import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

class Settings:
    """Application configuration from environment variables"""
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    
    # Pinecone Configuration
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "email-assistant")
    PINECONE_DIMENSION: int = 768  # Gemini embedding dimension
    
    # File Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    INBOX_FILE: Path = DATA_DIR / "inbox.json"
    DRAFTS_FILE: Path = DATA_DIR / "drafts.json"
    PROMPTS_FILE: Path = DATA_DIR / "prompts.json"
    
    # AI Configuration
    GEMINI_MODEL: str = "gemini-2.5-pro"
    GEMINI_EMBEDDING_MODEL: str = "models/embedding-001"
    TEMPERATURE_CATEGORIZATION: float = 0.3
    TEMPERATURE_REPLY: float = 0.7
    MAX_TOKENS: int = 1024
    
    # RAG Configuration
    TOP_K_RESULTS: int = 3
    
    def validate(self) -> None:
        """Validate that required environment variables are set"""
        if not self.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in .env file")
        if not self.PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY is not set in .env file")
        
        # Ensure data directory exists
        self.DATA_DIR.mkdir(exist_ok=True)

# Global settings instance
settings = Settings()