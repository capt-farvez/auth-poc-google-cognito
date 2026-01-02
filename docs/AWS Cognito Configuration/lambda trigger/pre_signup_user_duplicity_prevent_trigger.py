"""
AWS Cognito Pre Sign-up Lambda Trigger

This Lambda function automatically links accounts when a user signs up with
a different method (Google OAuth vs email/password) but uses the same email.

Scenarios handled:
1. User has email/password account, signs in with Google → Links Google to existing account
2. User has Google account, signs up with email/password → Links to existing Google account
"""

import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

cognito_client = boto3.client('cognito-idp')


def lambda_handler(event, context):
    """
    Pre Sign-up trigger handler.

    Trigger Sources:
    - PreSignUp_SignUp: Native email/password sign-up
    - PreSignUp_ExternalProvider: Federated sign-up (Google, Facebook, etc.)
    - PreSignUp_AdminCreateUser: Admin-created user
    """
    logger.info(f"Event: {event}")

    user_pool_id = event['userPoolId']
    trigger_source = event['triggerSource']
    user_attributes = event['request']['userAttributes']
    email = user_attributes.get('email', '').lower()

    if not email:
        logger.info("No email provided, skipping account linking")
        return event

    try:
        if trigger_source == 'PreSignUp_ExternalProvider':
            # Google/external provider sign-up
            handle_external_provider_signup(event, user_pool_id, email)
        elif trigger_source == 'PreSignUp_SignUp':
            # Native email/password sign-up
            handle_native_signup(event, user_pool_id, email)
    except Exception as e:
        logger.error(f"Error in pre-signup trigger: {str(e)}")
        # Don't block sign-up on errors, just log them
        raise e

    return event


def handle_external_provider_signup(event, user_pool_id, email):
    """
    Handle Google OAuth sign-up.

    If a native (email/password) user exists with the same email,
    link the Google identity to that existing user.
    """
    logger.info(f"External provider sign-up for email: {email}")

    # Extract provider info from the username (format: "google_123456789")
    username = event['userName']
    provider_name_raw = username.split('_')[0]  # e.g., "google"
    provider_user_id = '_'.join(username.split('_')[1:])  # e.g., "123456789"

    # Cognito requires exact provider name - capitalize first letter
    provider_name = provider_name_raw.capitalize()  # "google" -> "Google"

    logger.info(f"Provider: {provider_name}, Provider User ID: {provider_user_id}")

    # Search for existing users with this email
    existing_users = find_users_by_email(user_pool_id, email)

    # Find a native (non-federated) user with this email
    native_user = None
    for user in existing_users:
        # Check if this is a native Cognito user (not a federated identity)
        username_lower = user['Username'].lower()
        if not username_lower.startswith('google_') and not username_lower.startswith('facebook_'):
            # Check if user has identities attribute (federated users have this)
            has_identities = any(
                attr['Name'] == 'identities'
                for attr in user.get('Attributes', [])
            )
            if not has_identities:
                native_user = user
                break

    if native_user:
        logger.info(f"Found existing native user: {native_user['Username']}")

        # Link the external provider to the existing native user
        try:
            cognito_client.admin_link_provider_for_user(
                UserPoolId=user_pool_id,
                DestinationUser={
                    'ProviderName': 'Cognito',
                    'ProviderAttributeValue': native_user['Username']
                },
                SourceUser={
                    'ProviderName': provider_name,
                    'ProviderAttributeName': 'Cognito_Subject',
                    'ProviderAttributeValue': provider_user_id
                }
            )
            logger.info(f"Successfully linked {provider_name} identity to native user {native_user['Username']}")

            # Raise an exception to prevent creating a new user
            # The user will be redirected and can sign in with either method
            raise Exception(f"ACCOUNT_LINKED: Your {provider_name} account has been linked to your existing account. Please sign in again.")

        except cognito_client.exceptions.InvalidParameterException as e:
            logger.warning(f"Could not link accounts: {str(e)}")
            # Accounts might already be linked, continue with sign-up
        except Exception as e:
            if "ACCOUNT_LINKED" in str(e):
                raise e
            logger.error(f"Error linking accounts: {str(e)}")
    else:
        logger.info("No existing native user found, proceeding with new user creation")
        # Auto-confirm and verify email for Google users
        event['response']['autoConfirmUser'] = True
        event['response']['autoVerifyEmail'] = True


def handle_native_signup(event, user_pool_id, email):
    """
    Handle native email/password sign-up.

    If a Google user exists with the same email, we have two options:
    1. Block sign-up and ask user to sign in with Google (simpler)
    2. Link the accounts (more complex)

    This implementation blocks and prompts the user to use their existing method.
    """
    logger.info(f"Native sign-up for email: {email}")

    # Search for existing users with this email
    existing_users = find_users_by_email(user_pool_id, email)

    for user in existing_users:
        # Check if this is a federated user (Google)
        username_lower = user['Username'].lower()
        if username_lower.startswith('google_'):
            logger.info(f"Found existing Google user for email: {email}")
            raise Exception("An account with this email already exists. Please sign in with Google instead.")

        # Check for any existing native user
        if not username_lower.startswith('google_') and not username_lower.startswith('facebook_'):
            logger.info(f"Found existing native user for email: {email}")
            raise Exception("An account with this email already exists. Please sign in with your email and password.")

    logger.info("No existing user found, proceeding with new user creation")


def find_users_by_email(user_pool_id, email):
    """
    Find all users in the user pool with the given email.
    """
    try:
        response = cognito_client.list_users(
            UserPoolId=user_pool_id,
            Filter=f'email = "{email}"'
        )
        return response.get('Users', [])
    except Exception as e:
        logger.error(f"Error finding users by email: {str(e)}")
        return []
