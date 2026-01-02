# Setup Guide: Google Console OAuth

This guide walks you through setting up Google Console OAuth authentication with AWS Cognito
Search on youtube for video tutorial "AWS Cognito Google OAuth Setup"

## Prerequisites

- Google Cloud Platform Account
- Basic knowledge of Google Console OAuth

## Step 1: Configure Google OAuth

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as application type
7. Add Authorized JavaScript origins:
   ```
   https://YOUR_COGNITO_DOMAIN.auth.REGION.amazoncognito.com
   ```
8. Add authorized redirect URIs:
   ```
   https://YOUR_COGNITO_DOMAIN.auth.REGION.amazoncognito.com/oauth2/idpresponse
   ```
9. Save the **Client ID** and **Client Secret**


### 1.2 Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - App name
   - User support email
   - Developer contact information
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue
