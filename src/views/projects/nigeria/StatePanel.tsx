import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { electionData } from './electionData';
import { PARTY_COLORS, PARTY_FULL_NAME, partyLabelOf, resolve } from './parties';
import { cycleLabel, humanDate } from './format';
import { Confidence, StateElection } from './types';

const CONFIDENCE_COPY: Record<Confidence, { label: string; color: string }> = {
  verified: { label: 'Verified', color: 'success.main' },
  fluid: { label: 'Fluid — may change', color: 'warning.main' },
  contested: { label: 'Contested', color: 'error.main' },
};

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: 2,
      py: 1,
      borderBottom: 1,
      borderColor: 'divider',
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {k}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
      {v}
    </Typography>
  </Box>
);

export interface StatePanelProps {
  /** pinned ?? hovered — pinned wins so hover never clobbers a pin. */
  iso: string | null;
}

export const StatePanel = ({ iso }: StatePanelProps) => {
  const theme = useTheme();
  const rec: StateElection | undefined = iso ? electionData.states[iso] : undefined;

  if (!rec) {
    return (
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          minHeight: 240,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Hover a state to preview, or click / tap to pin its details here.
        </Typography>
      </Box>
    );
  }

  const partyColor = resolve(PARTY_COLORS[rec.currentParty], theme.palette.mode);
  const defected =
    rec.electedParty && rec.electedParty !== rec.currentParty
      ? `${partyLabelOf(rec.electedParty)} → ${partyLabelOf(rec.currentParty, rec.partyLabel)}`
      : null;
  const conf = CONFIDENCE_COPY[rec.confidence];

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, minHeight: 240 }}>
      <Typography variant="h6" sx={{ fontFamily: '"Space Mono", monospace' }}>
        {rec.name}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
        <Chip
          size="small"
          label={partyLabelOf(rec.currentParty, rec.partyLabel)}
          sx={{ bgcolor: partyColor, color: '#fff', fontWeight: 700 }}
        />
        <Chip
          size="small"
          variant="outlined"
          label={conf.label}
          sx={{ color: conf.color, borderColor: conf.color }}
        />
        {rec.watch && (
          <Chip
            size="small"
            variant="outlined"
            label="Race to watch"
            sx={{ color: 'warning.main', borderColor: 'warning.main' }}
          />
        )}
      </Stack>

      {defected && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'warning.main' }}>
          ⇄ Defection: {defected}
        </Typography>
      )}

      <Box sx={{ mt: 1.5 }}>
        <Row k="Governor" v={rec.governor} />
        <Row k="Party" v={PARTY_FULL_NAME[rec.currentParty] || partyLabelOf(rec.currentParty, rec.partyLabel)} />
        <Row
          k="Can run again?"
          v={rec.iso === 'NG-FC' ? 'N/A' : rec.termLimited ? 'No — term-limited' : 'Yes — eligible'}
        />
        <Row k="Next race" v={cycleLabel(rec)} />
      </Box>

      {rec.termNote && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          {rec.termNote}
        </Typography>
      )}

      {rec.watch && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1.5 }}>
          <strong>Why watch:</strong> {rec.watch.note}{' '}
          {rec.watch.sources.map((s, i) => (
            <Link key={i} href={s.url} target="_blank" rel="noopener noreferrer" sx={{ ml: 0.5 }}>
              [{i + 1}]
            </Link>
          ))}
        </Typography>
      )}

      <Box sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          As of {humanDate(rec.asOf)} ·{' '}
          <Link href={rec.source.url} target="_blank" rel="noopener noreferrer">
            {rec.source.label}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
