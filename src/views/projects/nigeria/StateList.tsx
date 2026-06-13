import { useMemo, useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { electionData } from './electionData';
import { PARTY_COLORS, partyLabelOf, resolve } from './parties';

export interface StateListProps {
  pinned: string | null;
  onPin: (iso: string) => void;
}

/** Searchable, keyboard-accessible list — the canonical non-mouse entry point. */
export const StateList = ({ pinned, onPin }: StateListProps) => {
  const theme = useTheme();
  const [q, setQ] = useState('');

  const states = useMemo(
    () =>
      Object.values(electionData.states).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return states;
    return states.filter(
      (s) =>
        s.name.toLowerCase().includes(needle) ||
        s.governor.toLowerCase().includes(needle)
    );
  }, [q, states]);

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
      <TextField
        size="small"
        fullWidth
        placeholder="Search states or governors…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        inputProps={{ 'aria-label': 'Search states or governors' }}
      />
      <List dense sx={{ maxHeight: 360, overflow: 'auto', mt: 1 }}>
        {filtered.map((s) => (
          <ListItemButton
            key={s.iso}
            selected={pinned === s.iso}
            onClick={() => onPin(s.iso)}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '2px',
                bgcolor: resolve(PARTY_COLORS[s.currentParty], theme.palette.mode),
                mr: 1.5,
                flexShrink: 0,
              }}
            />
            <ListItemText
              primary={s.name}
              secondary={`${partyLabelOf(s.currentParty, s.partyLabel)} · ${s.governor}`}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItemButton>
        ))}
        {filtered.length === 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, display: 'block' }}>
            No states match “{q}”.
          </Typography>
        )}
      </List>
    </Box>
  );
};
