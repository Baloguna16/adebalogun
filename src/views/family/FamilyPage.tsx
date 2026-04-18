import { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './auth/LoginPage';
import { PendingPage } from './auth/PendingPage';
import { SubmissionFlow } from './submission/SubmissionFlow';
import { FamilyTree } from './tree/FamilyTree';

export function FamilyPage() {
  const { accessState, loading, sendMagicLink, signOut } = useAuth();
  const [showSubmission, setShowSubmission] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  switch (accessState.type) {
    case 'unauthenticated':
      return <LoginPage onSendMagicLink={sendMagicLink} />;
    case 'new_user':
      return <SubmissionFlow isSelf={true} onComplete={() => window.location.reload()} />;
    case 'pending':
      return <PendingPage state="pending" onSignOut={signOut} />;
    case 'denied':
      return <PendingPage state="denied" onSignOut={signOut} />;
    case 'approved':
      if (showSubmission) {
        return <SubmissionFlow isSelf={false} onComplete={() => setShowSubmission(false)} />;
      }
      return <FamilyTree focusProfileId={accessState.profileId} />;
  }
}
