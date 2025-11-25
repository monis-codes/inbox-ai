import google.generativeai as genai
from typing import List
import json
from app.config import settings
from app.models import Tag

class LLMService:
    """Wrapper for Google Gemini AI operations"""
    
    # Tag color mapping (Tailwind CSS classes)
    TAG_COLORS = {
        "urgent": "bg-red-100 text-red-700",
        "to-do": "bg-blue-100 text-blue-700",
        "newsletter": "bg-gray-100 text-gray-700",
        "work": "bg-purple-100 text-purple-700",
        "personal": "bg-green-100 text-green-700",
        "finance": "bg-yellow-100 text-yellow-700",
        "default": "bg-gray-100 text-gray-700"
    }
    
    def __init__(self):
        # Configure Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    def categorize_email(self, email_body: str, subject: str, categorization_prompt: str) -> List[Tag]:
        """
        Categorize an email and return Tag objects with colors
        
        Args:
            email_body: The email content
            subject: Email subject line
            categorization_prompt: Custom categorization instructions
            
        Returns:
            List of Tag objects with label and color
        """
        try:
            # Construct the prompt
            full_prompt = f"""{categorization_prompt}

Subject: {subject}

Email Body:
{email_body}

Return ONLY a JSON array of tag labels, nothing else. Example: ["Urgent", "Work"]"""
            
            # Call Gemini
            response = self.model.generate_content(
                full_prompt,
                generation_config={
                    'temperature': settings.TEMPERATURE_CATEGORIZATION,
                    'max_output_tokens': 1000,
                    'response_mime_type': 'application/json'
                }
            )
            
            # Parse response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()
            
            # Parse JSON
            tag_labels = json.loads(response_text)
            
            # Convert to Tag objects with colors
            tags = []
            for label in tag_labels:
                if isinstance(label, str):
                    color = self._get_tag_color(label)
                    tags.append(Tag(label=label, color=color))
            
            return tags if tags else [Tag(label="Uncategorized", color=self.TAG_COLORS["default"])]
            
        except Exception as e:
            print(f"Error categorizing email: {e}")
            # Return default tag on error
            return [Tag(label="Uncategorized", color=self.TAG_COLORS["default"])]
    
    def generate_reply(self, sender: str, subject: str, email_body: str, reply_prompt: str) -> str:
        """
        Generate a reply to an email
        
        Args:
            sender: Name of the email sender
            subject: Email subject line
            email_body: The email content
            reply_prompt: Custom reply generation instructions
            
        Returns:
            Generated reply text
        """
        try:
            # Construct the prompt
            full_prompt = f"""{reply_prompt}

Original Email:
From: {sender}
Subject: {subject}

{email_body}

Generate a professional reply:"""
            
            # Call Gemini
            response = self.model.generate_content(
                full_prompt,
                generation_config={
                    'temperature': settings.TEMPERATURE_REPLY,
                    'max_output_tokens': settings.MAX_TOKENS,
                }
            )
            
            return response.text.strip()
            
        except Exception as e:
            print(f"Error generating reply: {e}")
            return f"Thank you for your email, {sender}. I appreciate your message and will respond soon."
    
    def answer_with_context(self, question: str, context_emails: List[dict], rag_prompt: str) -> str:
        """
        Answer a question using email context (RAG)
        
        Args:
            question: User's question
            context_emails: List of relevant emails with metadata
            rag_prompt: System prompt for RAG behavior
            
        Returns:
            AI-generated answer
        """
        try:
            # Format context emails
            context_text = "\n\n---\n\n".join([
                f"Email from {email['sender']}:\nSubject: {email['subject']}\n{email['body']}"
                for email in context_emails
            ])
            
            # Construct the prompt
            full_prompt = f"""{rag_prompt}

Here are the relevant emails from the inbox:

{context_text}

---

User Question: {question}

Answer:"""
            
            # Call Gemini
            response = self.model.generate_content(
                full_prompt,
                generation_config={
                    'temperature': 0.5,
                    'max_output_tokens': settings.MAX_TOKENS,
                }
            )
            
            return response.text.strip()
            
        except Exception as e:
            print(f"Error answering question: {e}")
            return "I'm sorry, I couldn't find relevant information in your emails to answer that question."
    
    def _get_tag_color(self, label: str) -> str:
        """
        Map a tag label to its Tailwind color classes
        """
        label_lower = label.lower().strip()
        return self.TAG_COLORS.get(label_lower, self.TAG_COLORS["default"])

