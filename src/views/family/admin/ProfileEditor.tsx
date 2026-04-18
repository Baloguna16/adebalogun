import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Checkbox, FormControlLabel,
} from '@mui/material';
import { Profile } from '../types';
import { supabase } from '../supabaseClient';

interface ProfileEditorProps {
  profile: Profile;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ProfileEditor({ profile, open, onClose, onSaved }: ProfileEditorProps) {
  const [form, setForm] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    birth_year: profile.birth_year,
    birth_year_approximate: profile.birth_year_approximate,
    death_year: profile.death_year,
    bio: profile.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from('profiles')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        birth_year: form.birth_year,
        birth_year_approximate: form.birth_year_approximate,
        death_year: form.death_year,
        bio: form.bio || null,
      })
      .eq('id', profile.id);
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
            value={form.first_name}
            onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Last name"
            value={form.last_name}
            onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
            fullWidth
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            label="Birth year"
            type="number"
            value={form.birth_year ?? ''}
            onChange={(e) => setForm(f => ({ ...f, birth_year: e.target.value ? parseInt(e.target.value) : null }))}
            sx={{ width: 140 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.birth_year_approximate}
                onChange={(e) => setForm(f => ({ ...f, birth_year_approximate: e.target.checked }))}
              />
            }
            label="Approximate"
          />
          <TextField
            label="Death year"
            type="number"
            value={form.death_year ?? ''}
            onChange={(e) => setForm(f => ({ ...f, death_year: e.target.value ? parseInt(e.target.value) : null }))}
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
