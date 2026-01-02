# Account Linking Setup Guide

This guide explains how to set up automatic account linking to prevent duplicate accounts when users sign up with different methods (Google OAuth vs email/password).

## Overview

When a user signs up with Google OAuth but already has an email/password account (or vice versa), the Pre Sign-up Lambda trigger will automatically link the accounts.

## How It Works

| Scenario | Behavior |
|----------|----------|
| User has email/password account → Signs in with Google | Google identity is linked to existing account |
| User has Google account → Signs up with email/password | Blocked with message to sign in with Google |

## Step 1: Create the Lambda Function

### Using AWS Console

1. Go to **AWS Lambda** → **Create function**
2. Choose **Author from scratch**
3. Configure:
   - **Function name**: `cognito-pre-signup-account-linking`
   - **Runtime**: Python 3.14
   - **Architecture**: x86_64

4. Click **Create function**

5. Replace the default code with the contents of [Python Code](pre_signup_user_duplicity_prevent_trigger.py)

6. Click **Deploy**

## Step 2: Create IAM Role for Lambda

The Lambda function needs permissions to access Cognito. Create a role with this policy:

```json
{
	"Version": "2012-10-17",
	"Statement": [
	  {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
		{
			"Effect": "Allow",
			"Action": [
				"cognito-idp:ListUsers",
				"cognito-idp:AdminGetUser",
				"cognito-idp:AdminLinkProviderForUser",
				"cognito-idp:AdminUpdateUserAttributes",
				"cognito-idp:AdminDeleteUser",
				"cognito-idp:AdminDisableUser",
				"cognito-idp:AdminEnableUser",
				"cognito-idp:AdminAddUserToGroup",
				"cognito-idp:AdminRemoveUserFromGroup",
				"cognito-idp:ListUsersInGroup"
			],
			"Resource": "*"
		}
	]
}
```

### Create Role via Console

1. Go to **IAM** → **Roles** → **Create role**
2. Select **AWS service** → **Lambda**
3. Click **Next**
4. Attach policies:
   - `AWSLambdaBasicExecutionRole` (for CloudWatch logs)
5. Click **Next** → Name the role `cognito-presignup-lambda-role`
6. Create the role
7. Go to the role → **Add permissions** → **Create inline policy**
8. Use JSON editor and paste the Cognito permissions above or click on [JSON](IAM_roles_permissions.json)
9. Save the policy

## Step 3: Add Lambda Trigger to Cognito

### Using AWS Console

1. Go to **Amazon Cognito** → **User pools** → Select your pool
2. Go to **User pool properties** tab
3. Scroll to **Lambda triggers** → Click **Add Lambda trigger**
4. Configure:
   - **Trigger type**: Sign-up
   - **Sign-up trigger**: Pre sign-up trigger
   - **Lambda function**: `cognito-pre-signup-account-linking`
5. Click **Save changes**


## Architecture Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Signs    │────▶│  AWS Cognito     │────▶│  Pre Sign-up    │
│   Up/In         │     │  User Pool       │     │  Lambda Trigger │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │  Check for existing │
                                               │  user by email      │
                                               └─────────────────────┘
                                                          │
                                    ┌─────────────────────┴─────────────────────┐
                                    ▼                                           ▼
                         ┌─────────────────────┐                     ┌─────────────────────┐
                         │  No existing user   │                     │  Existing user      │
                         │  → Create new       │                     │  → Link accounts    │
                         └─────────────────────┘                     └─────────────────────┘
```

## Security Considerations

- The Lambda only has access to list users and link accounts
- Email matching is case-insensitive
- Federated identities (Google) are linked TO native accounts, not vice versa
- Native sign-up is blocked if a Google account exists (prevents account takeover)
- Logging is done via CloudWatch for monitoring