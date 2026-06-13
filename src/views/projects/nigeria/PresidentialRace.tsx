import { Box, Chip, Typography } from '@mui/material';
import { electionData } from './electionData';
import { humanDate } from './format';
import { Confidence } from './types';

const CONF: Record<Confidence, { label: string; color: string }> = {
  verified: { label: 'Confirmed', color: 'success.main' },
  fluid: { label: 'Fluid', color: 'warning.main' },
  contested: { label: 'Contested', color: 'error.main' },
};

export const PresidentialRace = () => (
  <Box>
    <Typography variant="h6" sx={{ fontFamily: '"Space Mono", monospace', mb: 0.5 }}>
      The 2027 presidential race
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
      Field as of {humanDate(electionData.presidentialAsOf)} · subject to primaries and coalition shifts
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {electionData.presidential.map((c) => {
        const conf = CONF[c.confidence];
        return (
          <Box
            key={c.name}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 1.5,
              flex: '1 1 240px',
              minWidth: 240,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {c.name}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: '"Space Mono", monospace' }}>
                {c.party}
              </Typography>
            </Box>
            {c.runningMate && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Running mate: {c.runningMate}
              </Typography>
            )}
            <Chip
              size="small"
              variant="outlined"
              label={conf.label}
              sx={{ color: conf.color, borderColor: conf.color, mt: 1 }}
            />
            {c.note && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {c.note}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  </Box>
);
