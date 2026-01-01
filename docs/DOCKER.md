# Docker Setup Guide

This guide explains how to run the Google OAuth + AWS Cognito POC using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- AWS Cognito configured (see [SETUP.md](SETUP.md))
- Google OAuth configured (see [SETUP.md](SETUP.md))

## Quick Start with Docker

### 1. Configure Environment Variables

Create the required `.env` files from templates:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Edit both `.env` files with your AWS Cognito credentials (see [SETUP.md](SETUP.md) for obtaining these values).

### 2. Build and Run with Docker Compose

From the project root directory:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

This will:
- Build the backend (FastAPI) container
- Build the frontend (React) container
- Start both services with live reload enabled
- Create a shared network for communication

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Docker Commands

### Start Services

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Execute Commands in Containers

```bash
# Access backend shell
docker-compose exec backend sh

# Access frontend shell
docker-compose exec frontend sh

# Run backend command
docker-compose exec backend python -c "print('Hello')"

# Install additional npm package in frontend
docker-compose exec frontend npm install <package-name>
```

## Development Workflow

### Live Reload

Both containers are configured with volume mounts for live reload:

- **Backend**: Changes to Python files auto-reload the FastAPI server
- **Frontend**: Changes to React files trigger hot module replacement

### Installing Dependencies

**Backend (Python):**
```bash
# Option 1: Add to requirements.txt and rebuild
echo "new-package==1.0.0" >> backend/requirements.txt
docker-compose up --build backend

# Option 2: Install directly in running container
docker-compose exec backend pip install new-package
```

**Frontend (Node):**
```bash
# Option 1: Add to package.json and rebuild
cd frontend
npm install new-package
docker-compose up --build frontend

# Option 2: Install directly in running container
docker-compose exec frontend npm install new-package
```

## Docker Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
│                                         │
│  ┌─────────────┐      ┌──────────────┐ │
│  │  Frontend   │      │   Backend    │ │
│  │   (React)   │      │  (FastAPI)   │ │
│  │  Port: 3000 │      │  Port: 8000  │ │
│  └─────────────┘      └──────────────┘ │
│         │                     │         │
└─────────┼─────────────────────┼─────────┘
          │                     │
          ▼                     ▼
     localhost:3000       localhost:8000
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 8000 are already in use:

```yaml
# Edit docker-compose.yml
services:
  backend:
    ports:
      - "8001:8000"  # Change host port
  frontend:
    ports:
      - "3001:3000"  # Change host port
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Remove all containers and rebuild
docker-compose down -v
docker-compose up --build
```

### Changes Not Reflected

```bash
# Rebuild specific service
docker-compose up --build frontend

# Clear Docker cache and rebuild
docker-compose build --no-cache
docker-compose up
```

### Permission Issues (Linux/Mac)

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Windows-Specific Issues

- Ensure Docker Desktop is using WSL 2 backend
- Enable file sharing for the project directory in Docker Desktop settings
- Use PowerShell or WSL terminal for commands

## Production Deployment

For production, create separate Dockerfiles:

### Backend Production Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Use gunicorn for production
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

### Frontend Production Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Environment Variables

All environment variables are loaded from `.env` files:

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

**Important:** Never commit `.env` files to version control!

## Docker Best Practices

1. **Use .dockerignore** - Exclude unnecessary files from build context
2. **Multi-stage builds** - For smaller production images
3. **Layer caching** - Order Dockerfile commands for optimal caching
4. **Health checks** - Add health check endpoints
5. **Resource limits** - Set memory and CPU limits in production
6. **Security** - Don't run containers as root in production

## Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View images
docker images

# Remove unused images
docker image prune

# Remove all stopped containers
docker container prune

# View resource usage
docker stats

# Inspect container
docker inspect auth-poc-google-cognito_backend_1
```

## Next Steps

- Add health checks to docker-compose.yml
- Set up Docker secrets for sensitive data
- Configure nginx reverse proxy
- Add production docker-compose.prod.yml
- Set up CI/CD pipeline with Docker
