import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, TextField, Button } from '@mui/material';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const EMAIL_STORAGE_KEY = 'familyTreeSignInEmail';

export function AuthCallback() {
  const navigate = useNavigate();
  const [needsEmail, setNeedsEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const completeSignIn = async (emailToUse: string) => {
    try {
      await signInWithEmailLink(auth, emailToUse, window.location.href);
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      navigate('/family', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Sign-in failed');
    }
  };

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      navigate('/family', { replace: true });
      return;
    }
    const storedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (storedEmail) {
      completeSignIn(storedEmail);
    } else {
      setNeedsEmail(true);
    }
  }, [navigate]);

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (needsEmail) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2, maxWidth: 360, mx: 'auto' }}>
        <Typography>Please enter your email to complete sign-in:</Typography>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={() => completeSignIn(email)} disabled={!email} fullWidth>
          Continue
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Signing you in...</Typography>
    </Box>
  );
}
