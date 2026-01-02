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

See [Google Console Setup](docs/Google%20Console/Google_Console_setup.md) and [AWS Cognito Setup](docs/AWS%20Cognito%20Configuration/AWS_Cognito_setup.md) for detailed instructions on setting up Google OAuth credentials and AWS Cognito User Pool.

### 3. Set Up Environment Variables

#### Backend Environment Variables

Create `backend/.env`:

```env
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your-app-client-id
```

#### Frontend Environment Variables

Create `frontend/.env`:

```env
REACT_APP_COGNITO_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_COGNITO_APP_CLIENT_ID=your-app-client-id
REACT_APP_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
```

### 3. Run the Application
Choose one of the following options:
- **Option A: Using Docker (Recommended)** - See [Run in Docker](docs/Project%20Setup%20Instructions/Run_in_Docker.md)
- **Option B: Running Locally Without Docker** - See [Run Locally](docs/Project%20Setup%20Instructions/Run_Locally.md)


## 🧪 Testing the Flow

1. Navigate to http://localhost:3000
2. Click "Sign in with Google"
3. Authenticate with your Google account
4. You'll be redirected to the profile page
5. Profile page shows:
   - Your Google account information
   - Authentication status
   - Backend API connection status


## 📝 License

MIT

## 🤝 Contributing

This is a POC project. Feel free to fork and modify for your needs.