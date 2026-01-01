# Setup Guide: Google OAuth with AWS Cognito

This guide walks you through setting up Google OAuth authentication with AWS Cognito for this POC application.

## Prerequisites

- AWS Account
- Google Cloud Platform Account
- **For Docker (Recommended):**
  - Docker Desktop
  - Docker Compose
- **For Manual Setup:**
  - Node.js (v14+)
  - Python (3.8+)

## Step 1: Configure Google OAuth

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as application type
7. Add authorized redirect URIs:
   ```
   https://YOUR_COGNITO_DOMAIN.auth.REGION.amazoncognito.com/oauth2/idpresponse
   ```
8. Save the **Client ID** and **Client Secret**

### 1.2 Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - App name
   - User support email
   - Developer contact information
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

## Step 2: Configure AWS Cognito

### 2.1 Create User Pool

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Click **Create user pool**
3. **Configure sign-in experience**:
   - Select **Federated identity providers**
   - Select **Email** (optional, for backup)
4. **Configure security requirements**: Use defaults
5. **Configure sign-up experience**: 
   - Required attributes: `email`, `name`
6. **Configure message delivery**: Use Cognito defaults
7. **Integrate your app**:
   - User pool name: `auth-poc-user-pool`
   - App client name: `auth-poc-client`
   - Select **Public client**
   - **Don't generate a client secret** (for SPA)
8. **Review and create**

### 2.2 Add Google as Identity Provider

1. In your User Pool, go to **Sign-in experience** > **Federated identity provider sign-in**
2. Click **Add identity provider**
3. Select **Google**
4. Enter your Google OAuth credentials:
   - **Client ID**: From Google Console
   - **Client Secret**: From Google Console
5. **Authorized scopes**: `profile email openid`
6. **Map attributes**:
   - Google `email` → Cognito `email`
   - Google `name` → Cognito `name`
   - Google `picture` → Cognito `picture`
7. Click **Add identity provider**

### 2.3 Configure App Client

1. Go to **App integration** > **App client list**
2. Select your app client
3. Edit **Hosted UI settings**:
   - **Allowed callback URLs**: `http://localhost:3000/`
   - **Allowed sign-out URLs**: `http://localhost:3000/`
   - **Identity providers**: Select **Google**
   - **OAuth 2.0 grant types**: 
     - ✅ Authorization code grant
   - **OpenID Connect scopes**: 
     - ✅ openid
     - ✅ email
     - ✅ profile
4. Save changes

### 2.4 Configure Domain

1. Go to **App integration** > **Domain**
2. Choose **Cognito domain** or **Custom domain**
3. Enter domain prefix (e.g., `auth-poc-your-name`)
4. Save

### 2.5 Update Google OAuth Redirect URI

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Edit your OAuth client credentials
3. Update **Authorized redirect URIs** with your actual Cognito domain:
   ```
   https://YOUR_COGNITO_DOMAIN.auth.REGION.amazoncognito.com/oauth2/idpresponse
   ```

## Step 3: Configure Environment Variables

### 3.1 Backend Environment

Create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your-app-client-id
```

Replace with your actual values from AWS Cognito.

### 3.2 Frontend Environment

Create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
REACT_APP_COGNITO_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_COGNITO_APP_CLIENT_ID=your-app-client-id
REACT_APP_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
```

## Step 4: Run the Application

### Option A: Using Docker (Recommended)

From the project root:

```bash
# Build and start all services
docker-compose up --build
```

This will:
- Build backend and frontend containers
- Start both services with live reload
- Make the app available at:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:8000

**Docker Commands:**
```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

📖 See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

### Option B: Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Step 5: Test the Application

1. Open `http://localhost:3000` in your browser
2. Click **Sign in with Google**
3. You'll be redirected to Google login
4. After successful login, you'll be redirected back to the app
5. You should see your profile page with user information
6. The profile page will show:
   - ✅ Google OAuth working
   - ✅ AWS Cognito working
   - ✅ React Frontend working
   - ✅ FastAPI Backend working (if backend is running)

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Make sure Google OAuth redirect URI exactly matches Cognito domain
   - Format: `https://YOUR_DOMAIN.auth.REGION.amazoncognito.com/oauth2/idpresponse`

2. **CORS Errors**
   - Backend CORS is configured for `http://localhost:3000`
   - If using different port, update `main.py`

3. **Token Validation Errors**
   - Verify `COGNITO_USER_POOL_ID` and `COGNITO_APP_CLIENT_ID` are correct
   - Check that backend environment variables are loaded

4. **Amplify Configuration Errors**
   - Ensure all `REACT_APP_*` variables are set in `.env`
   - Restart React dev server after changing `.env`

## Security Notes

- **Never commit `.env` files** to version control
- In production:
  - Use HTTPS for all endpoints
  - Configure proper CORS origins
  - Use AWS Secrets Manager for credentials
  - Enable MFA for sensitive operations

## Next Steps

- Add user authorization levels
- Implement token refresh logic
- Add protected API routes
- Configure production domains
- Set up CloudFront + S3 for frontend hosting
- Deploy backend to AWS Lambda or ECS
