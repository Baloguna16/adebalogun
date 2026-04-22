import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Checkbox, FormControlLabel,
} from '@mui/material';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Profile } from '../types';

interface ProfileEditorProps {
  profile: Profile;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ProfileEditor({ profile, open, onClose, onSaved }: ProfileEditorProps) {
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    birthYear: profile.birthYear,
    birthYearApproximate: profile.birthYearApproximate,
    deathYear: profile.deathYear,
    bio: profile.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'profiles', profile.id), {
      firstName: form.firstName,
      lastName: form.lastName,
      birthYear: form.birthYear,
      birthYearApproximate: form.birthYearApproximate,
      deathYear: form.deathYear,
      bio: form.bio || null,
      updatedAt: serverTimestamp(),
    });
    setSaving(false);
    onSaved();
    onClose();
  };

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
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
