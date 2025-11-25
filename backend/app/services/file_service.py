import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.config import settings
from app.models import EmailInternal, DraftInternal, Prompts, Email, Draft, Tag
import hashlib

class FileService:
    """Handles all JSON file operations and data transformations"""
    
    def __init__(self):
        self.inbox_path = settings.INBOX_FILE
        self.drafts_path = settings.DRAFTS_FILE
        self.prompts_path = settings.PROMPTS_FILE
        
    def ensure_files_exist(self) -> None:
        """Create default JSON files if they don't exist"""
        # Create inbox.json
        if not self.inbox_path.exists():
            self._write_json(self.inbox_path, [])
            print(f"✓ Created {self.inbox_path}")
        
        # Create drafts.json
        if not self.drafts_path.exists():
            self._write_json(self.drafts_path, [])
            print(f"✓ Created {self.drafts_path}")
        
        # Create prompts.json with defaults
        if not self.prompts_path.exists():
            default_prompts = {
                "categorization": "Categorize emails as: Urgent (requires immediate action), To-Do (actionable but not urgent), Newsletter (informational), or other. Consider tone, sender authority, and keywords. Return ONLY a JSON array of tag labels like [\"Urgent\", \"To-Do\"].",
                "reply": "Generate professional, concise replies that are slightly formal but friendly. Keep replies to 2-3 sentences. Match the tone of the original email.",
                "rag": "You are a helpful assistant with access to the user's email history. Answer questions about tasks, projects, and conversations based on the email content. Be concise and accurate. Only use information from the provided emails."
            }
            self._write_json(self.prompts_path, default_prompts)
            print(f"✓ Created {self.prompts_path}")
    
    # ========== Low-Level File Operations ==========
    
    def _read_json(self, filepath: Path) -> Any:
        """Read and parse a JSON file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {filepath}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in {filepath}: {str(e)}")
    
    def _write_json(self, filepath: Path, data: Any) -> None:
        """Write data to a JSON file with pretty formatting"""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            raise IOError(f"Failed to write to {filepath}: {str(e)}")
    
    # ========== Email Operations ==========
    
    def read_emails(self) -> List[Email]:
        """Read emails from inbox.json and convert to frontend format"""
        emails_data = self._read_json(self.inbox_path)
        
        # Convert internal format to API format
        emails = []
        for email_dict in emails_data:
            # Parse as internal model
            email_internal = EmailInternal(**email_dict)
            
            # Convert to API model with computed date
            email_api = Email(
                id=email_internal.id,
                sender=email_internal.sender,
                senderAvatar=email_internal.senderAvatar,
                subject=email_internal.subject,
                body=email_internal.body,
                timestamp=email_internal.timestamp,
                date=self.format_relative_date(email_internal.timestamp),
                tags=email_internal.tags,
                read=email_internal.read,
                preview=email_internal.preview
            )
            emails.append(email_api)
        
        return emails
    
    def write_emails(self, emails: List[EmailInternal]) -> None:
        """Write emails to inbox.json (internal format only)"""
        emails_data = [email.model_dump() for email in emails]
        self._write_json(self.inbox_path, emails_data)
    
    def get_email_by_id(self, email_id: str) -> EmailInternal | None:
        """Get a single email by ID"""
        emails_data = self._read_json(self.inbox_path)
        for email_dict in emails_data:
            if email_dict.get('id') == email_id:
                return EmailInternal(**email_dict)
        return None
    
    # ========== Draft Operations ==========
    
    def read_drafts(self) -> List[Draft]:
        """Read drafts from drafts.json and convert to frontend format"""
        drafts_data = self._read_json(self.drafts_path)
        
        # Convert internal format to API format
        drafts = []
        for draft_dict in drafts_data:
            draft_internal = DraftInternal(**draft_dict)
            
            draft_api = Draft(
                id=draft_internal.id,
                emailReferenceId=draft_internal.emailReferenceId,
                emailSubject=draft_internal.emailSubject,
                content=draft_internal.content,
                timestamp=draft_internal.timestamp,
                lastSaved=self.format_relative_date(draft_internal.timestamp)
            )
            drafts.append(draft_api)
        
        return drafts
    
    def write_drafts(self, drafts: List[DraftInternal]) -> None:
        """Write drafts to drafts.json (internal format only)"""
        drafts_data = [draft.model_dump() for draft in drafts]
        self._write_json(self.drafts_path, drafts_data)
    
    def upsert_draft(self, draft: DraftInternal) -> DraftInternal:
        """Create or update a draft"""
        drafts_data = self._read_json(self.drafts_path)
        
        # Check if draft exists
        found = False
        for i, existing_draft in enumerate(drafts_data):
            if existing_draft.get('id') == draft.id:
                # Update existing draft
                drafts_data[i] = draft.model_dump()
                found = True
                break
        
        # If not found, append new draft
        if not found:
            drafts_data.append(draft.model_dump())
        
        # Save and return
        self._write_json(self.drafts_path, drafts_data)
        return draft
    
    # ========== Prompts Operations ==========
    
    def read_prompts(self) -> Prompts:
        """Read prompts from prompts.json"""
        prompts_data = self._read_json(self.prompts_path)
        return Prompts(**prompts_data)
    
    def write_prompts(self, prompts: Prompts) -> None:
        """Write prompts to prompts.json"""
        self._write_json(self.prompts_path, prompts.model_dump())
    
    # ========== Utility Functions ==========
    
    @staticmethod
    def format_relative_date(iso_timestamp: str) -> str:
        """
        Convert ISO timestamp to human-readable relative date
        Examples: 'Today, 10:30 AM', 'Yesterday, 2:45 PM', 'Jan 15, 3:20 PM'
        """
        try:
            # Parse ISO timestamp
            dt = datetime.fromisoformat(iso_timestamp.replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            
            # Calculate difference
            delta = now - dt
            
            # Format time part
            time_str = dt.strftime("%I:%M %p").lstrip('0')  # Remove leading zero from hour
            
            # Determine date part
            if delta.days == 0:
                return f"Today, {time_str}"
            elif delta.days == 1:
                return f"Yesterday, {time_str}"
            elif delta.days < 7:
                return f"{delta.days} days ago"
            else:
                # For older dates, show month and day
                date_str = dt.strftime("%b %d")
                return f"{date_str}, {time_str}"
        except Exception as e:
            print(f"Error formatting date: {e}")
            return "Unknown date"
    
    @staticmethod
    def generate_avatar_url(sender: str, email_id: str = "") -> str:
        """
        Generate a consistent avatar URL based on sender name
        Uses pravatar.cc with a hash to ensure same sender gets same avatar
        """
        # Create a hash from sender name to get consistent avatar
        hash_value = int(hashlib.md5(sender.encode()).hexdigest(), 16)
        avatar_id = (hash_value % 70) + 1  # Pravatar has 70 avatars
        return f"https://i.pravatar.cc/150?img={avatar_id}"
    
    @staticmethod
    def create_preview(body: str, max_length: int = 50) -> str:
        """
        Create a preview from email body (first N characters)
        """
        # Remove extra whitespace and newlines
        clean_body = ' '.join(body.split())
        
        if len(clean_body) <= max_length:
            return clean_body
        
        # Truncate and add ellipsis
        return clean_body[:max_length].rsplit(' ', 1)[0] + "..."
    
    @staticmethod
    def generate_current_timestamp() -> str:
        """Generate current timestamp in ISO 8601 format"""
        return datetime.now(timezone.utc).isoformat()