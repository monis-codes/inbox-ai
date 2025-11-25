from app.services import file_service, llm_service, vector_service

# Test file creation
file_service.ensure_files_exist()

# Test date formatting
date = file_service.format_relative_date("2024-11-24T10:30:00Z")
print(f"Formatted date: {date}")  # Should be "Today, 10:30 AM"

# Test avatar generation
avatar = file_service.generate_avatar_url("Sarah Chen")
print(f"Avatar URL: {avatar}")  # Consistent for same name

# Test tag categorization
prompts = file_service.read_prompts()
tags = llm_service.categorize_email(
    "Please review this urgent report by EOD",
    "Q4 Report Review",
    prompts.categorization
)
print(f"Tags: {tags}")  # Should include Urgent tag with red color