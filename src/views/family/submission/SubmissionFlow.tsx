import { useState } from 'react';
import { Container, Box, Typography, Button, Paper, Divider } from '@mui/material';
import { ProfileForm, ProfileFormData } from './ProfileForm';
import { RelationshipPicker, RelationshipFormData } from './RelationshipPicker';
import { useSubmission } from '../hooks/useSubmission';

interface SubmissionFlowProps {
  isSelf: boolean;
  onComplete: () => void;
  onBack?: () => void;
}

export function SubmissionFlow({ isSelf, onComplete, onBack }: SubmissionFlowProps) {
  const [step, setStep] = useState<'profile' | 'relationship' | 'done'>('profile');
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const { pendingSubmissions, submitting, error, submitProfile } = useSubmission();

  const handleProfileSubmit = (data: ProfileFormData) => {
    setProfileData(data);
    setStep('relationship');
  };

  const handleRelationshipSubmit = async (rel: RelationshipFormData) => {
    if (!profileData) return;
    const id = await submitProfile(profileData, rel, isSelf && pendingSubmissions.length === 0);
    if (id) {
      setStep('done');
    }
  };

  const handleAddAnother = () => {
    setProfileData(null);
    setStep('profile');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        {step === 'profile' && (
          <ProfileForm
            onSubmit={handleProfileSubmit}
            onBack={onBack}
            title={isSelf && pendingSubmissions.length === 0
              ? 'Tell us about yourself'
              : 'Add a family member'}
            subtitle={isSelf && pendingSubmissions.length === 0
              ? 'To explore the family tree, we need to know who you are.'
              : undefined}
          />
        )}

        {step === 'relationship' && (
          <RelationshipPicker
            onSubmit={handleRelationshipSubmit}
            onBack={() => setStep('profile')}
            pendingPeople={pendingSubmissions.map(s => ({
              tempId: s.tempId,
              first_name: s.profileData.first_name,
              last_name: s.profileData.last_name,
            }))}
            subjectName={
              isSelf && pendingSubmissions.length === 0
                ? undefined
                : profileData ? `${profileData.first_name} ${profileData.last_name}` : undefined
            }
          />
        )}

        {step === 'done' && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              {isSelf && pendingSubmissions.length === 1
                ? 'Submission received!'
                : 'Person added!'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {isSelf && pendingSubmissions.length === 1
                ? "You'll get access once the admin approves your profile."
                : `${profileData?.first_name} has been submitted for approval.`}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={handleAddAnother}>
                Add another family member
              </Button>
              <Button variant="contained" onClick={onComplete}>
                Done
              </Button>
            </Box>
          </Paper>
        )}

        {submitting && (
          <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Submitting...
          </Typography>
        )}
      </Box>
    </Container>
  );
}
