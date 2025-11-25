AI-powered email management system with categorization, reply generation, and RAG-based chat capabilities.

## 🚀 Features

- **Smart Email Categorization**: Automatically tag emails as Urgent, To-Do, Newsletter, etc.
- **AI Reply Generation**: Generate professional responses using Google Gemini
- **RAG Chat Agent**: Ask questions about your emails using semantic search
- **Draft Management**: Create, edit, and save email drafts
- **Customizable Prompts**: Configure AI behavior for your needs

## 🏗️ Architecture

```
FastAPI Backend
├── Google Gemini AI (LLM + Embeddings)
├── Pinecone (Vector Database for RAG)
└── JSON Files (Local Data Storage)
```

## 📋 Prerequisites

- Python 3.9+
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- Pinecone API Key ([Sign up here](https://app.pinecone.io))

## 🛠️ Installation

### 1. Clone and Setup

```bash
# Create project directory
mkdir email-backend
cd email-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=email-assistant
```

### 3. Project Structure

Ensure your directory structure looks like this:

```
email-backend/
├── .env
├── .gitignore
├── requirements.txt
├── main.py
├── sample_emails.json
├── data/
│   ├── inbox.json       (auto-created)
│   ├── drafts.json      (auto-created)
│   └── prompts.json     (auto-created)
└── app/
    ├── __init__.py
    ├── config.py
    ├── models.py
    ├── services/
    │   ├── __init__.py
    │   ├── file_service.py
    │   ├── llm_service.py
    │   └── vector_service.py
    └── routers/
        ├── __init__.py
        ├── emails.py
        ├── drafts.py
        ├── settings.py
        └── chat.py
```

## 🚦 Running the Server

### Development Mode (with auto-reload)

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will start at: **http://localhost:8000**

## 📚 API Documentation

Once the server is running, visit:

- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🧪 Testing the API

### 1. Upload Sample Emails

```bash
curl -X POST "http://localhost:8000/api/emails/upload" \
  -F "file=@sample_emails.json"
```

### 2. Categorize Emails

```bash
curl -X POST "http://localhost:8000/api/emails/ingest"
```

### 3. Get All Emails

```bash
curl -X GET "http://localhost:8000/api/emails"
```

### 4. Generate Reply

```bash
curl -X POST "http://localhost:8000/api/drafts/generate" \
  -H "Content-Type: application/json" \
  -d '{"emailId": "1"}'
```

### 5. Ask Chat Question

```bash
curl -X POST "http://localhost:8000/api/chat/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "What tasks are due this week?"}'
```

## 📡 API Endpoints

### 📧 Emails

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/emails` | Get all emails |
| `POST` | `/api/emails/upload` | Upload emails JSON file |
| `POST` | `/api/emails/ingest` | Categorize & index emails |
| `DELETE` | `/api/emails/{id}` | Delete an email |

### 📝 Drafts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/drafts` | Get all drafts |
| `POST` | `/api/drafts/generate` | Generate AI reply |
| `POST` | `/api/drafts` | Save/update draft |
| `DELETE` | `/api/drafts/{id}` | Delete a draft |

### ⚙️ Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/settings/prompts` | Get AI prompts |
| `PUT` | `/api/settings/prompts` | Update AI prompts |
| `POST` | `/api/settings/prompts/reset` | Reset to defaults |

### 💬 Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/query` | Ask question about emails |
| `POST` | `/api/chat/rebuild-index` | Rebuild vector index |

## 🎯 Demo Workflow

1. **Upload emails**: `POST /api/emails/upload` with `sample_emails.json`
2. **Categorize**: `POST /api/emails/ingest` (adds tags to emails)
3. **View emails**: `GET /api/emails` (see tagged emails)
4. **Ask question**: `POST /api/chat/query` ("What tasks are due?")
5. **Generate reply**: `POST /api/drafts/generate` for an email
6. **Save draft**: `POST /api/drafts` with edited content
7. **Customize**: `PUT /api/settings/prompts` to change AI behavior

## 🔧 Configuration

### Changing AI Behavior

Edit prompts via API or directly in `data/prompts.json`:

```json
{
  "categorization": "Your custom categorization rules...",
  "reply": "Your custom reply style...",
  "rag": "Your custom chat behavior..."
}
```

### Adjusting Vector Search

In `app/config.py`:

```python
TOP_K_RESULTS: int = 3  # Number of emails to retrieve for RAG
TEMPERATURE_CATEGORIZATION: float = 0.3  # Lower = more consistent
TEMPERATURE_REPLY: float = 0.7  # Higher = more creative
```

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY is not set"

**Solution**: Make sure `.env` file exists and contains your API key.

### Issue: Pinecone connection fails

**Solution**: 
1. Check your Pinecone API key is correct
2. Verify your Pinecone environment matches your account
3. Ensure you have available indexes in your free tier

### Issue: Import errors

**Solution**: Make sure you're in the virtual environment:
```bash
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### Issue: Port 8000 already in use

**Solution**: Use a different port:
```bash
uvicorn main:app --port 8001
```

## 📦 Deployment

### For Render/Railway/Heroku

1. Create `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Set environment variables in dashboard:
   - `GEMINI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_ENVIRONMENT`
   - `PINECONE_INDEX_NAME`

3. Update CORS in `main.py`:
```python
allow_origins=[
    "https://your-frontend-domain.com"
]
```

## 🧹 Reset Demo State

To start fresh:

```bash
# Delete data files
rm data/inbox.json data/drafts.json

# Rebuild vector index
curl -X POST "http://localhost:8000/api/chat/rebuild-index"

# Re-upload sample emails
curl -X POST "http://localhost:8000/api/emails/upload" \
  -F "file=@sample_emails.json"
```

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 🤝 Contributing

This is an assignment project, but feel free to fork and modify!

## 📞 Support

For issues or questions:
- Check the `/docs` endpoint for API documentation
- Review error messages in terminal
- Verify environment variables are set correctly

---

**Built with FastAPI, Google Gemini, and Pinecone** 🚀


# ============================================
# FILE: Procfile (for deployment)
# ============================================
web: uvicorn main:app --host 0.0.0.0 --port $PORT


# ============================================
# FILE: .env.example (update this to show all variables)
# ============================================
# Copy this to .env and fill in your actual API keys

# Google Gemini API Key (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Pinecone API Key (get from https://app.pinecone.io)
PINECONE_API_KEY=your_pinecone_api_key_here

# Pinecone Configuration
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=email-assistant
