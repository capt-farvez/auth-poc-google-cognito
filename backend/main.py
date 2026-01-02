from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
import os
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Auth POC API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS Cognito configuration
COGNITO_REGION = os.getenv("COGNITO_REGION", "us-east-1")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID", "")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID", "")

# JWT validation
JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"

security = HTTPBearer()


class User(BaseModel):
    sub: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token from AWS Cognito"""
    token = credentials.credentials
    
    try:
        # Get the kid from the token header
        unverified_header = jwt.get_unverified_header(token)
        
        # Get the public key from AWS Cognito
        jwks_client = PyJWKClient(JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=COGNITO_APP_CLIENT_ID,
            options={"verify_exp": True}
        )
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}"
        )


@app.get("/")
async def root():
    return {"message": "Auth POC API is running"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/profile", response_model=User)
async def get_profile(token_payload: dict = Depends(verify_token)):
    """Get user profile from token"""
    return User(
        sub=token_payload.get("sub", ""),
        email=token_payload.get("email", ""),
        name=token_payload.get("name", token_payload.get("cognito:username", "")),
        picture=token_payload.get("picture", "")
    )


@app.get("/api/protected")
async def protected_route(token_payload: dict = Depends(verify_token)):
    """Example protected route"""
    return {
        "message": "This is a protected route",
        "user_id": token_payload.get("sub"),
        "email": token_payload.get("email")
    }
