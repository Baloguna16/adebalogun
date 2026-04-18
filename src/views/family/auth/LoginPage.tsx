import { useState } from 'react';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper,
} from '@mui/material';

interface LoginPageProps {
  onSendMagicLink: (email: string) => Promise<{ error: Error | null }>;
}

export function LoginPage({ onSendMagicLink }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await onSendMagicLink(email);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setSubmitting(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" gutterBottom>Family Tree</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Enter your email to receive a sign-in link.
        </Typography>
        {sent ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Check your email</Typography>
            <Typography color="text.secondary">
              We sent a sign-in link to <strong>{email}</strong>. Click the link to continue.
            </Typography>
          </Paper>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField fullWidth label="Email address" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" fullWidth disabled={submitting} size="large">
              {submitting ? 'Sending...' : 'Send sign-in link'}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
