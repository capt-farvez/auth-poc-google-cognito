# Setup Guide: AWS Cognito

This guide walks you through setting up Google OAuth authentication with AWS Cognito
Search on youtube for video tutorial "AWS Cognito Google OAuth Setup"

## Prerequisites

- AWS Account
- Basic knowledge of AWS Cognito and Google OAuth

## Step 1: Configure AWS Cognito

### 1.1 Create User Pool

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

### 1.2 Add Google as Identity Provider

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

### 1.3 Configure App Client

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

### 1.4 Configure Domain

1. Go to **App integration** > **Domain**
2. Choose **Cognito domain** or **Custom domain**
3. Enter domain prefix (e.g., `auth-poc-your-name`)
4. Save

### 1.5 Update Google OAuth Redirect URI

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Edit your OAuth client credentials
3. Update **Authorized redirect URIs** with your actual Cognito domain:
   ```
   https://YOUR_COGNITO_DOMAIN.auth.REGION.amazoncognito.com/oauth2/idpresponse
   ```
