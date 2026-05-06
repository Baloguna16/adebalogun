import { useState } from 'react';
import { Box, CircularProgress, Fab } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './auth/LoginPage';
import { PendingPage } from './auth/PendingPage';
import { SubmissionFlow } from './submission/SubmissionFlow';
import { FamilyTree } from './tree/FamilyTree';

export function FamilyPage() {
  const { user, accessState, loading, sendMagicLink, signOut } = useAuth();
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
        return <SubmissionFlow isSelf={false} onComplete={() => setShowSubmission(false)} onBack={() => setShowSubmission(false)} />;
      }
      return (
        <Box sx={{ position: 'relative' }}>
          <FamilyTree focusProfileId={accessState.profileId} currentUserId={user!.uid} onSignOut={signOut} />
          <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }}
            onClick={() => setShowSubmission(true)}>
            <PersonAddIcon />
          </Fab>
        </Box>
      );
  }
}
