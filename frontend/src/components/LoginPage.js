import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithRedirect, getCurrentUser, signIn, signUp, confirmSignUp } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'confirm'

  useEffect(() => {
    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          checkUser();
          break;
        case 'signInWithRedirect_failure':
          setError('Failed to sign in with Google');
          setCheckingAuth(false);
          break;
        case 'customOAuthState':
          checkUser();
          break;
        default:
          break;
      }
    });

    // Initial check
    checkUser();

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        navigate('/profile');
      }
    } catch (error) {
      // User not logged in
      setCheckingAuth(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn({ username: email, password });
      navigate('/profile');
    } catch (error) {
      console.error('Error signing in with email:', error);
      setError(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            'custom:user_role': 'user',
          },
        },
      });
      setMode('confirm');
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });
      // Auto sign in after confirmation
      await signIn({ username: email, password });
      navigate('/profile');
    } catch (error) {
      console.error('Error confirming sign up:', error);
      setError(error.message || 'Failed to confirm. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setConfirmationCode('');
  };

  return (
    <div className="login-container">
      {checkingAuth ? (
        <div className="login-card">
          <div className="login-content">
            <div className="loading">Completing sign in...</div>
          </div>
        </div>
      ) : (
        <div className="login-card">
        <div className="login-header">
          <h1>{mode === 'confirm' ? 'Verify Email' : 'Welcome'}</h1>
          <p>
            {mode === 'signin' && 'Sign in to continue to your account'}
            {mode === 'signup' && 'Create a new account'}
            {mode === 'confirm' && 'Enter the verification code sent to your email'}
          </p>
        </div>

        <div className="login-content">
          {mode === 'signin' && (
            <>
              <form onSubmit={handleEmailSignIn}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="sign-in-button" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="divider">
                <span>OR</span>
              </div>

              <button
                className="google-sign-in-button"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>

              <p className="mode-switch">
                Don't have an account?{' '}
                <button type="button" className="link-button" onClick={() => switchMode('signup')}>
                  Sign Up
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <form onSubmit={handleSignUp}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupEmail">Email</label>
                  <input
                    type="email"
                    id="signupEmail"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupPassword">Password</label>
                  <input
                    type="password"
                    id="signupPassword"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupConfirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="signupConfirmPassword"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="sign-in-button" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </button>
              </form>

              <p className="mode-switch">
                Already have an account?{' '}
                <button type="button" className="link-button" onClick={() => switchMode('signin')}>
                  Sign In
                </button>
              </p>
            </>
          )}

          {mode === 'confirm' && (
            <form onSubmit={handleConfirmSignUp}>
              <div className="form-group">
                <label htmlFor="code">Verification Code</label>
                <input
                  type="text"
                  id="code"
                  placeholder="Enter 6-digit code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="sign-in-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <p className="mode-switch">
                <button type="button" className="link-button" onClick={() => switchMode('signin')}>
                  Back to Sign In
                </button>
              </p>
            </form>
          )}
        </div>

        <div className="login-footer">
          <p>Secured by AWS Cognito</p>
        </div>
      </div>
      )}
    </div>
  );
}

export default LoginPage;
