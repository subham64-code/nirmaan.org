# Nirmaan Platform — System Architecture

## Purpose
This document provides a clear, runnable system architecture for the Nirmaan platform: components, data flows, integrations, and deployment guidance. Use this as the authoritative design reference for developers and devops.

## High-level diagram
See the Mermaid diagram in `docs/diagrams/system_architecture.mmd` (also embedded below).

```mermaid
%% System architecture for Nirmaan
flowchart LR
  subgraph ClientLayer[Client Layer]
    Browser[Web Browser / Mobile]
  end

  subgraph Frontend[Frontend]
    NextJS[Next.js (frontend)]
    Static[Static assets / CDN]
  end

  subgraph Gateway[API Gateway / Reverse Proxy]
    NGINX[NGINX / Cloud Load Balancer]
  end

  subgraph Backend[Backend Services]
    Express[Node.js / Express API]
    Flask[Flask Proctoring App]
    MLServices[AI / ML microservices]
  end

  subgraph Data[Data Layer]
    Mongo[(MongoDB)]
    FileStore[(File storage / GridFS or S3)]
  end

  subgraph External[External Services]
    SendGrid[SendGrid]
    Twilio[Twilio]
    Gemini[Google Gemini]
    DeepSeek[DeepSeek]
    Ollama[Ollama]
  end

  Browser -->|HTTPS| NextJS
  NextJS -->|API calls| NGINX
  NGINX --> Express
  NGINX --> Flask
  Express --> Mongo
  Express --> FileStore
  Flask --> MLServices
  MLServices --> FileStore
  MLServices -->|AI calls| External
  Express -->|Email/SMS| SendGrid & Twilio
  Express -->|AI| Gemini & DeepSeek & Ollama

  style ClientLayer fill:#f4faff,stroke:#2b6cb0
  style Frontend fill:#eef6ff,stroke:#2b6cb0
  style Gateway fill:#fff7ed,stroke:#d69e2e
  style Backend fill:#f0fff4,stroke:#2f855a
  style Data fill:#fff5f7,stroke:#b83280
  style External fill:#f7f7f7,stroke:#718096
```

## Components
- **Client Layer:** Next.js UI (React), mobile web. Handles authentication, UI flows, and calls backend APIs.
- **Frontend:** `frontend/` holds the Next.js app. Static files can be served via CDN for faster delivery.
- **API Gateway:** NGINX or cloud load balancer terminates TLS, serves static assets, and reverse-proxies to backend services.
- **Backend Services:** Primary REST API in `backend/` (Express). Proctoring logic and ML endpoints exist in `nirmaan_exam.org/` (Flask) to keep heavy image-processing isolated.
- **AI/ML Services:** Lightweight microservices wrap heavy models (Ollama, DeepSeek, Gemini). Keep models outside the repo and load them at runtime.
- **Data Layer:** MongoDB for primary data; GridFS or cloud object storage for large model files and uploads.
- **External Integrations:** SendGrid, Twilio, Google APIs, and cloud AI vendors.

## Data Flow (typical exam proctoring)
1. Client sends webcam frames to the Flask proctoring endpoint.
2. Flask stores frames temporarily in FileStore and forwards tasks to ML services.
3. ML services call external AI (Ollama/Gemini) or run local models to analyze frames.
4. Results are logged to MongoDB and surfaced to the Express API for dashboards.

## Deployment recommendations
- Containerize each component: `frontend`, `express-api`, `flask-proctoring`, `ml-services`.
- Use `docker-compose` for local staging, Kubernetes for production.
- Store large models in cloud storage; download at startup or mount via volume.
- Use managed MongoDB (Atlas) in production.
- Place NGINX or cloud LB in front for TLS, caching, and rate-limiting.

## Security
- TLS everywhere; JWT + RBAC for API auth.
- Sanitize inputs at service boundaries; validate files and sizes for uploads.
- Secrets in environment variables or secret manager (not in repo).

## Files & References
- Frontend: `frontend/`
- Backend: `backend/`
- Proctoring app: `nirmaan_exam.org/` (routes in `routes_proctoring_new.py`)
- Diagrams: `docs/diagrams/system_architecture.mmd`


