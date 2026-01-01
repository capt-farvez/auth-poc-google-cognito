import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, fetchAuthSession, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userAttributes, setUserAttributes] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      const session = await fetchAuthSession();
      const currentUser = await getCurrentUser();

      // For OAuth/federated users, get attributes from ID token payload
      // For direct Cognito users, try to fetch attributes
      let attributes = null;
      
      if (session.tokens?.idToken?.payload) {
        // Extract user info from ID token (works for both OAuth and Cognito users)
        const payload = session.tokens.idToken.payload;
        
        console.log('ID Token Payload:', payload);
        
        // Check if user logged in via Google (federated identity)
        const isGoogleUser = payload.identities && 
          (typeof payload.identities === 'string' ? payload.identities.includes('Google') : true);
        
        // For Google OAuth users, email is always verified by Google
        // If email_verified is not in token, default to true for Google users
        const emailVerified = payload.email_verified !== undefined 
          ? payload.email_verified 
          : isGoogleUser;
        
        // Try to get email from various possible locations in the token
        const email = payload.email || 
                     payload['custom:email'] || 
                     payload.preferred_username ||
                     (isGoogleUser ? 'Email not mapped in Cognito - check attribute mapping' : payload['cognito:username']);
        
        attributes = {
          sub: payload.sub,
          email: email,
          email_verified: emailVerified,
          name: payload.name,
          given_name: payload.given_name,
          family_name: payload.family_name,
          picture: payload.picture,
          phone_number: payload.phone_number,
          identities: payload.identities, // Shows which provider was used (Google, Cognito, etc.)
        };
      } else {
        // Fallback: try to fetch attributes for native Cognito users
        try {
          attributes = await fetchUserAttributes();
        } catch (err) {
          console.warn('Could not fetch user attributes, using ID token payload only', err);
        }
      }

      setUser(currentUser);
      setUserAttributes(attributes);

      // Call backend API
      if (session.tokens?.idToken) {
        await callBackendAPI(session.tokens.idToken.toString());
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(error.message);
      setLoading(false);
      navigate('/');
    }
  };

  const callBackendAPI = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
      } else {
        console.error('API call failed:', response.status);
      }
    } catch (error) {
      console.error('Error calling backend API:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      // Use global signOut to avoid hosted UI redirect issues
      await signOut({ global: true });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // If global sign out fails, try regular sign out
      try {
        await signOut();
        navigate('/');
      } catch (err) {
        console.error('Fallback sign out also failed:', err);
      }
    }
  };

  // Helper function to safely get identity provider name
  const getProviderName = () => {
    if (!userAttributes?.identities) return null;
    try {
      const identities = typeof userAttributes.identities === 'string' 
        ? JSON.parse(userAttributes.identities) 
        : userAttributes.identities;
      return Array.isArray(identities) ? identities[0]?.providerName : null;
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  const providerName = getProviderName();

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="success-badge">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h1>Authentication Successful! 🎉</h1>
          <p className="subtitle">
            {providerName ? 
              `Logged in via ${providerName} OAuth` : 
              'Logged in with AWS Cognito'}
          </p>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>User Information</h2>
            <div className="info-grid">
              {userAttributes?.picture && (
                <div className="profile-picture">
                  <img src={userAttributes.picture} alt="Profile" />
                </div>
              )}
              <div className="info-item">
                <span className="label">Name:</span>
                <span className="value">{userAttributes?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{userAttributes?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">User ID:</span>
                <span className="value">{user?.userId || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Email Verified:</span>
                <span className="value">
                  {userAttributes?.email_verified === 'true' || userAttributes?.email_verified === true ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              {providerName && (
                <div className="info-item">
                  <span className="label">Login Provider:</span>
                  <span className="value">
                    {providerName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {apiResponse && (
            <div className="profile-section">
              <h2>Backend API Response</h2>
              <div className="api-response">
                <div className="response-badge success">✅ API Connection Successful</div>
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h2>Integration Status</h2>
            <div className="status-grid">
              <div className="status-item success">
                <span className="status-icon">✅</span>
                <span>Google OAuth</span>
              </div>
              <div className="status-item success">
                <span className="status-icon">✅</span>
                <span>AWS Cognito</span>
              </div>
              <div className="status-item success">
                <span className="status-icon">✅</span>
                <span>React Frontend</span>
              </div>
              <div className={`status-item ${apiResponse ? 'success' : 'warning'}`}>
                <span className="status-icon">{apiResponse ? '✅' : '⚠️'}</span>
                <span>FastAPI Backend</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-footer">
          <button className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
