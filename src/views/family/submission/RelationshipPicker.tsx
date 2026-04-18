import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Autocomplete, FormControl, InputLabel,
  Select, MenuItem, Button, SelectChangeEvent,
} from '@mui/material';
import { Profile, RelationshipSubtype } from '../types';
import { supabase } from '../supabaseClient';

interface PendingPerson {
  tempId: string;
  first_name: string;
  last_name: string;
}

export interface RelationshipFormData {
  relatedToId: string;
  relationshipLabel: 'child_of' | 'parent_of' | 'spouse_of';
  subtype: RelationshipSubtype | null;
  startYear: number | null;
  endYear: number | null;
}

interface RelationshipPickerProps {
  onSubmit: (data: RelationshipFormData) => void;
  onBack: () => void;
  pendingPeople?: PendingPerson[];
  subjectName?: string;
}

export function RelationshipPicker({ onSubmit, onBack, pendingPeople = [], subjectName }: RelationshipPickerProps) {
  const [approvedProfiles, setApprovedProfiles] = useState<Profile[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<{ id: string; label: string } | null>(null);
  const [relationshipLabel, setRelationshipLabel] = useState<RelationshipFormData['relationshipLabel']>('child_of');
  const [subtype, setSubtype] = useState<RelationshipSubtype | null>(null);
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'approved')
        .order('last_name');
      if (data) setApprovedProfiles(data);
    };
    fetchProfiles();
  }, []);

  const allOptions = [
    ...approvedProfiles.map(p => ({
      id: p.id,
      label: `${p.first_name} ${p.last_name}`,
    })),
    ...pendingPeople.map(p => ({
      id: p.tempId,
      label: `${p.first_name} ${p.last_name} (pending)`,
    })),
  ];

  const prefix = subjectName ? `${subjectName} is the` : 'I am the';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    onSubmit({
      relatedToId: selectedPerson.id,
      relationshipLabel,
      subtype,
      startYear,
      endYear,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        How are you related?
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Select a person on the tree and your relationship to them.
      </Typography>

      <Autocomplete
        options={allOptions}
        getOptionLabel={(o) => o.label}
        value={selectedPerson}
        onChange={(_, v) => setSelectedPerson(v)}
        renderInput={(params) => (
          <TextField {...params} label="Related to..." required />
        )}
        sx={{ mb: 2 }}
        isOptionEqualToValue={(o, v) => o.id === v.id}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Relationship</InputLabel>
        <Select
          value={relationshipLabel}
          label="Relationship"
          onChange={(e: SelectChangeEvent) => setRelationshipLabel(e.target.value as RelationshipFormData['relationshipLabel'])}
        >
          <MenuItem value="child_of">{prefix} child of this person</MenuItem>
          <MenuItem value="parent_of">{prefix} parent of this person</MenuItem>
          <MenuItem value="spouse_of">{prefix} spouse of this person</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Type (optional)</InputLabel>
        <Select
          value={subtype || ''}
          label="Type (optional)"
          onChange={(e: SelectChangeEvent) => setSubtype((e.target.value || null) as RelationshipSubtype | null)}
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="biological">Biological</MenuItem>
          <MenuItem value="adoptive">Adoptive</MenuItem>
          <MenuItem value="step">Step</MenuItem>
          <MenuItem value="foster">Foster</MenuItem>
        </Select>
      </FormControl>

      {relationshipLabel === 'spouse_of' && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Marriage year"
            type="number"
            value={startYear ?? ''}
            onChange={(e) => setStartYear(e.target.value ? parseInt(e.target.value) : null)}
            sx={{ width: 160 }}
          />
          <TextField
            label="End year (if divorced)"
            type="number"
            value={endYear ?? ''}
            onChange={(e) => setEndYear(e.target.value ? parseInt(e.target.value) : null)}
            sx={{ width: 200 }}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>Back</Button>
        <Button type="submit" variant="contained" fullWidth disabled={!selectedPerson}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}
