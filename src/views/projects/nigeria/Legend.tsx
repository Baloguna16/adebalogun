import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { electionData } from './electionData';
import {
  PARTY_COLORS,
  TIMING_COLORS,
  partyLabelOf,
  resolve,
} from './parties';
import { Layer, PartyCode, TimingBucket } from './types';

const TIMING_LEGEND: { bucket: TimingBucket; label: string }[] = [
  { bucket: 'v2026', label: 'Votes 2026 (off-cycle)' },
  { bucket: 'gen2027', label: 'Feb 2027 general' },
  { bucket: 'off2027', label: 'Off-cycle 2027' },
  { bucket: 'off2028', label: 'Off-cycle 2028' },
  { bucket: 'off2029', label: 'Off-cycle 2029' },
  { bucket: 'none', label: 'FCT — no governorship' },
];

const Swatch = ({ color }: { color: string }) => (
  <Box sx={{ width: 13, height: 13, borderRadius: '3px', bgcolor: color, flexShrink: 0 }} />
);

export interface LegendProps {
  layer: Layer;
  showWatch: boolean;
}

export const Legend = ({ layer, showWatch }: LegendProps) => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const partiesPresent = useMemo(() => {
    const seen = new Set<PartyCode>();
    for (const s of Object.values(electionData.states)) {
      if (s.iso !== 'NG-FC') seen.add(s.currentParty);
    }
    // stable display order
    const order: PartyCode[] = ['APC', 'PDP', 'LP', 'APGA', 'Accord', 'APM', 'NNPP', 'OTHER'];
    return order.filter((p) => seen.has(p));
  }, []);

  const items =
    layer === 'party'
      ? partiesPresent.map((p) => ({
          color: resolve(PARTY_COLORS[p], mode),
          label: partyLabelOf(p),
        }))
      : TIMING_LEGEND.map((t) => ({
          color: resolve(TIMING_COLORS[t.bucket], mode),
          label: t.label,
        }));

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mt: 1.5 }}>
      {items.map((it) => (
        <Box key={it.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Swatch color={it.color} />
          <Typography variant="caption" color="text.secondary">
            {it.label}
          </Typography>
        </Box>
      ))}
      {showWatch && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: mode === 'dark' ? '#ffd54a' : '#b8860b',
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Race to watch (editorial)
          </Typography>
        </Box>
      )}
    </Box>
  );
};
