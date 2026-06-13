import { Box, Chip, Typography } from '@mui/material';
import { electionData } from './electionData';
import { humanDate } from './format';

export const KeyDates = () => (
  <Box>
    <Typography variant="h6" sx={{ fontFamily: '"Space Mono", monospace', mb: 1.5 }}>
      Key dates
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {electionData.keyDates.map((d) => (
        <Box
          key={d.label}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            p: 1.5,
            flex: '1 1 200px',
            minWidth: 200,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontFamily: '"Space Mono", monospace' }}
          >
            {humanDate(d.date)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {d.label}
          </Typography>
          <Chip
            size="small"
            label={d.kind === 'general' ? 'General' : 'Off-cycle'}
            color={d.kind === 'general' ? 'primary' : 'default'}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </Box>
      ))}
    </Box>
  </Box>
);
