# Local Setup Instructions
This guide explains how to run the Google OAuth + AWS Cognito POC locally without Docker.

## Prerequisites
- Node.js (v14+)
- Python (3.8+)
- AWS Account
- Google Cloud Platform Account

## Step 1: Configure Environment Variables
### 1.1 Backend Environment
Create `backend/.env`:

```bash
cp backend/.env.example backend/.env  # Update .env with your Cognito values
```

### 1.2 Frontend Environment
Create `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env  # Update .env with your Cognito values
```

## Step 2: Run the Application
### 2.1 Backend Setup

```bash
# Go to backend directory
cd backend

# Copy environment file
cp .env.example .env      #Edit with your Cognito credentials

#Create virtual environment (optional but recommended)
python -m venv venv
# Activate virtual environment
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

### 2.2 Frontend Setup

```bash
# Go to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env  # Edit .env with your Cognito credentials

# Start the React development server
npm start
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs