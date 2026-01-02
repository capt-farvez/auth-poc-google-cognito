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
   - **Runtime**: Python 3.11
   - **Architecture**: x86_64

4. Click **Create function**

5. Replace the default code with the contents of `lambda/pre_signup_trigger.py`

6. Click **Deploy**

### Using AWS CLI

```bash
# Zip the Lambda function
cd lambda
zip pre_signup_trigger.zip pre_signup_trigger.py

# Create the Lambda function
aws lambda create-function \
  --function-name cognito-pre-signup-account-linking \
  --runtime python3.11 \
  --handler pre_signup_trigger.lambda_handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
  --zip-file fileb://pre_signup_trigger.zip \
  --region us-east-1
```

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
			"Resource": "arn:aws:cognito-idp:us-east-1:452202271513:userpool/us-east-1_2rFHNjeJ7"
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
8. Use JSON editor and paste the Cognito permissions above
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

### Using AWS CLI

```bash
aws cognito-idp update-user-pool \
  --user-pool-id us-east-1_2rFHNjeJ7 \
  --lambda-config PreSignUp=arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:cognito-pre-signup-account-linking \
  --region us-east-1
```

## Step 4: Add Lambda Permission for Cognito

Allow Cognito to invoke the Lambda function:

```bash
aws lambda add-permission \
  --function-name cognito-pre-signup-account-linking \
  --statement-id cognito-presignup \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:us-east-1:YOUR_ACCOUNT_ID:userpool/us-east-1_2rFHNjeJ7 \
  --region us-east-1
```

## Testing the Integration

### Test Case 1: Email/Password First, Then Google

1. Sign up with email/password using `test@example.com`
2. Verify the email
3. Sign out
4. Click "Sign in with Google" using the same email
5. **Expected**: Google identity links to existing account, user sees their original profile

### Test Case 2: Google First, Then Email/Password

1. Sign in with Google using `test@example.com`
2. Sign out
3. Try to sign up with email/password using the same email
4. **Expected**: Error message "An account with this email already exists. Please sign in with Google instead."

## Troubleshooting

### Check Lambda Logs

```bash
aws logs tail /aws/lambda/cognito-pre-signup-account-linking --follow
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Lambda not triggered | Verify the trigger is configured in Cognito |
| Permission denied | Check IAM role has `cognito-idp:ListUsers` and `AdminLinkProviderForUser` |
| Account not linking | Check CloudWatch logs for errors |

### Debug Mode

To enable detailed logging, the Lambda already logs all events. Check CloudWatch Logs:

1. Go to **CloudWatch** → **Log groups**
2. Find `/aws/lambda/cognito-pre-signup-account-linking`
3. View recent log streams

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
