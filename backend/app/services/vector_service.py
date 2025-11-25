import pinecone
from pinecone import Pinecone, ServerlessSpec
import google.generativeai as genai
from typing import List, Dict, Any
from app.config import settings
from app.models import EmailInternal

class VectorService:
    """Handles Pinecone vector operations for RAG"""
    
    def __init__(self):
        # Initialize Pinecone
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index_name = settings.PINECONE_INDEX_NAME
        
        # Initialize Gemini for embeddings
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Initialize index
        self._initialize_index()
    
    def _initialize_index(self) -> None:
        """Create Pinecone index if it doesn't exist"""
        try:
            # Check if index exists
            existing_indexes = self.pc.list_indexes()
            index_names = [idx['name'] for idx in existing_indexes]
            
            if self.index_name not in index_names:
                print(f"Creating Pinecone index: {self.index_name}")
                self.pc.create_index(
                    name=self.index_name,
                    dimension=settings.PINECONE_DIMENSION,
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',
                        region='us-east-1'
                    )
                )
                print(f"✓ Created Pinecone index: {self.index_name}")
            
            # Connect to index
            self.index = self.pc.Index(self.index_name)
            
        except Exception as e:
            print(f"Error initializing Pinecone index: {e}")
            raise
    
    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using Gemini"""
        try:
            result = genai.embed_content(
                model=settings.GEMINI_EMBEDDING_MODEL,
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            print(f"Error generating embedding: {e}")
            raise
    
    def upsert_emails(self, emails: List[EmailInternal]) -> None:
        """
        Add or update emails in the vector database
        
        Args:
            emails: List of emails to index
        """
        try:
            vectors = []
            
            for email in emails:
                # Combine subject and body for embedding
                text_to_embed = f"{email.subject}\n\n{email.body}"
                
                # Generate embedding
                embedding = self._generate_embedding(text_to_embed)
                
                # Prepare metadata (must be JSON-serializable)
                metadata = {
                    "id": email.id,
                    "sender": email.sender,
                    "subject": email.subject,
                    "body": email.body[:500],  # Truncate for metadata limits
                    "timestamp": email.timestamp
                }
                
                # Add to batch
                vectors.append({
                    "id": email.id,
                    "values": embedding,
                    "metadata": metadata
                })
            
            # Upsert in batches of 100
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                self.index.upsert(vectors=batch)
            
            print(f"✓ Upserted {len(vectors)} emails to Pinecone")
            
        except Exception as e:
            print(f"Error upserting emails: {e}")
            raise
    
    def search_relevant_emails(self, query: str, top_k: int = None) -> List[Dict[str, Any]]:
        """
        Search for emails relevant to a query
        
        Args:
            query: User's search query
            top_k: Number of results to return (default from settings)
            
        Returns:
            List of email metadata from most relevant emails
        """
        if top_k is None:
            top_k = settings.TOP_K_RESULTS
        
        try:
            # Generate query embedding
            query_embedding = self._generate_embedding(query)
            
            # Search Pinecone
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True
            )
            
            # Extract metadata from matches
            emails = []
            for match in results['matches']:
                emails.append({
                    "id": match['metadata']['id'],
                    "sender": match['metadata']['sender'],
                    "subject": match['metadata']['subject'],
                    "body": match['metadata']['body'],
                    "score": match['score']
                })
            
            return emails
            
        except Exception as e:
            print(f"Error searching emails: {e}")
            return []
    
    def rebuild_index(self, emails: List[EmailInternal]) -> None:
        """
        Delete all vectors and re-index all emails
        Useful for resetting the demo or after major changes
        """
        try:
            # Delete all vectors
            self.index.delete(delete_all=True)
            print("✓ Cleared Pinecone index")
            
            # Re-upsert all emails
            if emails:
                self.upsert_emails(emails)
            
        except Exception as e:
            print(f"Error rebuilding index: {e}")
            raise