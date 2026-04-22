import { Container, Box, Typography, Button } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockIcon from '@mui/icons-material/Block';

interface PendingPageProps {
  state: 'pending' | 'denied';
  onSignOut: () => void;
}

export function PendingPage({ state, onSignOut }: PendingPageProps) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {state === 'pending' ? (
          <>
            <HourglassEmptyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" gutterBottom>Waiting for Approval</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Your submission has been received. You'll get access once the admin approves your profile.
            </Typography>
          </>
        ) : (
          <>
            <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>Request Denied</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Your request was not approved. If you think this is a mistake, please contact the family tree admin.
            </Typography>
          </>
        )}
        <Button variant="outlined" onClick={onSignOut}>Sign out</Button>
      </Box>
    </Container>
  );
}
