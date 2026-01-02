# Google OAuth + AWS Cognito Authentication POC

A full-stack authentication POC using AWS Cognito User Pools with Google Sign-In, implemented with a React frontend and FastAPI backend. Demonstrates secure login, token handling, and protected API access.

## 🎯 Features

- ✅ Google OAuth 2.0 integration
- ✅ AWS Cognito User Pool authentication
- ✅ React frontend with AWS Amplify
- ✅ FastAPI backend with JWT validation
- ✅ Protected API routes
- ✅ User profile display


## 📁 Project Structure

```
auth-poc-google-cognito/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.js    # Login page component
│   │   │   ├── LoginPage.css
│   │   │   ├── ProfilePage.js  # Profile page component
│   │   │   └── ProfilePage.css
│   │   ├── App.js              # Main app component
│   │   ├── App.css
│   │   ├── index.js            # Entry point
│   │   └── index.css
│   ├── package.json
│   └── .env.example            # Environment variables template
├── docs/
│   └── SETUP.md                # Detailed setup guide
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Option 1 (Docker - Recommended):**
  - Docker Desktop
  - Docker Compose
- **Option 2 (Manual):**
  - Node.js (v14+)
  - Python (3.8+)
- **Both options:**
  - AWS Account
  - Google Cloud Platform Account

### 1. Clone the Repository

```bash
git clone https://github.com/capt-farvez/auth-poc-google-cognito.git
cd auth-poc-google-cognito
```

### 2. Configure AWS Cognito & Google OAuth

See [docs/SETUP.md](docs/SETUP.md) for detailed configuration instructions.

### 3. Run the Application

#### Option A: Using Docker (Recommended)

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your Cognito credentials

# Build and run with Docker Compose
docker-compose up --build
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

📖 See [docs/DOCKER.md](docs/DOCKER.md) for detailed Docker instructions.

#### Option B: Manual Setup

**Backend:**
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

**Frontend (new terminal):**
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

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your-app-client-id
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
REACT_APP_COGNITO_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_COGNITO_APP_CLIENT_ID=your-app-client-id
REACT_APP_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
```


## 🧪 Testing the Flow

1. Navigate to http://localhost:3000
2. Click "Sign in with Google"
3. Authenticate with your Google account
4. You'll be redirected to the profile page
5. Profile page shows:
   - Your Google account information
   - Authentication status
   - Backend API connection status

## 📖 Documentation

- [docs/SETUP.md](docs/SETUP.md) - Complete AWS Cognito & Google OAuth setup
- [docs/DOCKER.md](docs/DOCKER.md) - Docker setup and commands


## 📝 License

MIT

## 🤝 Contributing

This is a POC project. Feel free to fork and modify for your needs.