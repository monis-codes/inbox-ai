from app.services.file_service import FileService
from app.services.llm_service import LLMService
from app.services.vector_service import VectorService

# Global service instances (initialized once)
file_service = FileService()
llm_service = LLMService()
vector_service = VectorService()

# Export them so other files can just do: from app.services import file_service
__all__ = ["file_service", "llm_service", "vector_service"]