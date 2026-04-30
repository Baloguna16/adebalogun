import { useState } from 'react';
import {
  Box, TextField, Button, Typography, Checkbox, FormControlLabel, Alert, Snackbar,
} from '@mui/material';

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  birth_year: number | null;
  birth_year_approximate: boolean;
  death_year: number | null;
  bio: string;
  location: string;
  contact_info: string;
  photo: File | null;
}

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function ProfileForm({ onSubmit, onBack, title, subtitle }: ProfileFormProps) {
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    birth_year: null,
    birth_year_approximate: false,
    death_year: null,
    bio: '',
    location: '',
    contact_info: '',
    photo: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        {title || 'Tell us about yourself'}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="First name"
          value={form.first_name}
          onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
          required
          fullWidth
        />
        <TextField
          label="Last name"
          value={form.last_name}
          onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
          required
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
        label="Short bio"
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
        Location and contact info are <strong>private</strong> — only you and the admin can see them. Other family members can request access.
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
          value={form.contact_info}
          onChange={(e) => setForm(f => ({ ...f, contact_info: e.target.value }))}
          fullWidth
        />
      </Box>

      <Button variant="outlined" component="label" sx={{ mb: 3 }}>
        Upload photo
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
      {form.photo && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2, display: 'inline' }}>
          {form.photo.name}
        </Typography>
      )}
      <Snackbar open={!!photoError} autoHideDuration={4000} onClose={() => setPhotoError(null)}
        message={photoError} />

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        {onBack && (
          <Button variant="outlined" onClick={onBack}>Back</Button>
        )}
        <Button type="submit" variant="contained" fullWidth>
          Next
        </Button>
      </Box>
    </Box>
  );
}
