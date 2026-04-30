## Getting Started

### Prerequisites
- Python 3.12+ with uv
- Node.js 20+
- OpenRouter API key

### Backend

```bash
cd backend
cp .env.example .env
# fill in OPENROUTER_API_KEY and MCP_SERVER_URL in .env
uv run main.py
```

### Frontend

```bash
cd frontend
cp .env.example .env
# set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

Open `http://localhost:5173`

## Environment Variables

**Backend (`.env`)**
| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `MCP_SERVER_URL` | Meridian MCP server URL |

**Frontend (`.env`)**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (default: `http://localhost:8000`) |

## API Endpoints

| Endpoint | Description |
|---|---|
| `POST /chat` | Send a message, returns SSE stream |
| `GET /tools` | List available MCP tools |
| `GET /health` | Health check |
| `DELETE /session/{id}` | Clear a session |

## Authentication

Product browsing requires no authentication. Viewing order history and placing orders require the customer to verify their identity with their email and 4-digit PIN. Authentication state is maintained per session — customers are not asked to re-authenticate within the same conversation.

## Deployment

Infrastructure is managed with Terraform (S3 + ECS + ALB on AWS). CI/CD is handled via GitHub Actions with OIDC authentication — no long-lived AWS credentials stored in GitHub secrets.