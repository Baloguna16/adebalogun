import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Checkbox, FormControlLabel, Alert, Snackbar,
} from '@mui/material';
import { Profile } from '../types';
import { useProfileEdit } from '../hooks/useProfileEdit';

interface EditProfileDialogProps {
  profile: Profile;
  privateFields: { location: string | null; contactInfo: string | null } | null;
  open: boolean;
  onClose: () => void;
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function EditProfileDialog({ profile, privateFields, open, onClose }: EditProfileDialogProps) {
  const { submitEdit, loading } = useProfileEdit(profile.id);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    birthYear: profile.birthYear,
    birthYearApproximate: profile.birthYearApproximate,
    deathYear: profile.deathYear,
    bio: profile.bio || '',
    photo: null as File | null,
    location: privateFields?.location || '',
    contactInfo: privateFields?.contactInfo || '',
  });

  const handleSave = async () => {
    const changed = await submitEdit(
      profile,
      {
        firstName: form.firstName,
        lastName: form.lastName,
        birthYear: form.birthYear,
        birthYearApproximate: form.birthYearApproximate,
        deathYear: form.deathYear,
        bio: form.bio || null,
        photo: form.photo,
        location: form.location,
        contactInfo: form.contactInfo,
      },
      privateFields
    );
    if (changed) {
      setSubmitted(true);
    } else {
      onClose();
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Submitted</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mt: 1 }}>
            Your changes have been submitted for admin approval.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 2 }}>
          <TextField
            label="First name"
            value={form.firstName}
            onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Last name"
            value={form.lastName}
            onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
            fullWidth
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            label="Birth year"
            type="number"
            value={form.birthYear ?? ''}
            onChange={(e) => setForm(f => ({ ...f, birthYear: e.target.value ? parseInt(e.target.value) : null }))}
            sx={{ width: 140 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.birthYearApproximate}
                onChange={(e) => setForm(f => ({ ...f, birthYearApproximate: e.target.checked }))}
              />
            }
            label="Approximate"
          />
          <TextField
            label="Death year"
            type="number"
            value={form.deathYear ?? ''}
            onChange={(e) => setForm(f => ({ ...f, deathYear: e.target.value ? parseInt(e.target.value) : null }))}
            sx={{ width: 140 }}
          />
        </Box>
        <TextField
          label="Bio"
          value={form.bio}
          onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
          multiline
          rows={2}
          fullWidth
          inputProps={{ maxLength: 280 }}
          helperText={`${form.bio.length}/280`}
          sx={{ mb: 2 }}
        />

        <Alert severity="info" sx={{ mb: 2 }}>
          Location and contact info are <strong>private</strong>.
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Location (private)"
            value={form.location}
            onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Contact info (private)"
            value={form.contactInfo}
            onChange={(e) => setForm(f => ({ ...f, contactInfo: e.target.value }))}
            fullWidth
          />
        </Box>

        <Button variant="outlined" component="label">
          {form.photo ? form.photo.name : 'Upload new photo'}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file && file.size > MAX_PHOTO_SIZE) {
                setPhotoError('Photo must be under 5 MB');
                e.target.value = '';
                return;
              }
              setPhotoError(null);
              setForm(f => ({ ...f, photo: file }));
            }}
          />
        </Button>
        <Snackbar open={!!photoError} autoHideDuration={4000} onClose={() => setPhotoError(null)}
          message={photoError} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
