# Docker Setup Guide

This guide explains how to run the Google OAuth + AWS Cognito POC using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

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
