import { useMemo, useReducer } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Link,
  Typography,
} from '@mui/material';
import { useGeoData } from '../travel-map/useGeoData';
import { electionData } from './electionData';
import { isStale } from './staleness';
import { humanDate } from './format';
import { initialUIState, panelIsoOf, uiReducer } from './uiReducer';
import { ElectionMap } from './ElectionMap';
import { StatePanel } from './StatePanel';
import { StateList } from './StateList';
import { LayerToggle } from './LayerToggle';
import { Legend } from './Legend';
import { KeyDates } from './KeyDates';
import { PresidentialRace } from './PresidentialRace';

const DATA_URL = `${process.env.PUBLIC_URL}/data/nigeria-states.json`;

export const NigeriaElections = () => {
  const geo = useGeoData(DATA_URL);
  const [ui, dispatch] = useReducer(uiReducer, initialUIState);

  const hasWatch = useMemo(
    () => Object.values(electionData.states).some((s) => s.watch),
    []
  );
  const stale = isStale(electionData.siteReviewed, Date.now());

  // Panel shows the pin if there is one, else the hovered preview.
  const panelIso = panelIsoOf(ui);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nigeria 2027 — Election Tracker
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        An interactive map of all 36 states + the FCT for Nigerians abroad
        following the road to 2027. Click a state for who governs it, their
        party, term status, and when it next votes.
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontFamily: '"Space Mono", monospace', color: 'text.secondary', display: 'block', mt: 0.5 }}
      >
        Data reviewed {humanDate(electionData.siteReviewed)} · curated, not a live feed
      </Typography>

      {stale && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          This tracker hasn’t been reviewed recently and may be out of date.
        </Alert>
      )}

      {geo.error ? (
        <Alert
          severity="error"
          sx={{ mt: 3 }}
          action={
            <Button color="inherit" size="small" onClick={geo.retry}>
              Retry
            </Button>
          }
        >
          Could not load the map data.
        </Alert>
      ) : geo.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mt: 3, mb: 1.5 }}>
            <LayerToggle
              layer={ui.layer}
              showWatch={ui.showWatch}
              hasWatch={hasWatch}
              onLayer={(layer) => dispatch({ t: 'layer', layer })}
              onToggleWatch={() => dispatch({ t: 'toggleWatch' })}
            />
            <Legend layer={ui.layer} showWatch={ui.showWatch} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1 }}>
              <ElectionMap
                topology={geo.topology}
                layer={ui.layer}
                showWatch={ui.showWatch}
                hovered={ui.hovered}
                pinned={ui.pinned}
                onHover={(iso) => dispatch({ t: 'hover', iso })}
                onPin={(iso) => dispatch({ t: 'pin', iso })}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <StatePanel iso={panelIso} />
              <StateList pinned={ui.pinned} onPin={(iso) => dispatch({ t: 'pin', iso })} />
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />
          <KeyDates />

          <Divider sx={{ my: 4 }} />
          <PresidentialRace />

          <Divider sx={{ my: 4 }} />
          <Box>
            <Typography variant="h6" sx={{ fontFamily: '"Space Mono", monospace', mb: 1 }}>
              Can the diaspora vote in 2027?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>No.</strong> Nigerians abroad cannot vote in the 2027
              elections — the Constitution requires voting in person at your
              registered polling unit, and the constitutional amendment that
              would permit diaspora voting has not passed. Voter registration
              (CVR) also runs only in periodic windows, not continuously.
              Election results are accredited via BVAS and posted to INEC’s
              IReV portal — and under the Electoral Act 2026, electronic
              transmission of results is now mandatory and admissible in
              tribunals.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Sources
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {electionData.sources.map((s) => (
                <Link
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="caption"
                >
                  {s.label}
                </Link>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Boundaries: geoBoundaries (GRID3 Nigeria), CC BY 4.0. Curated
              political data is hand-maintained — alignments shift fast; treat
              party/term fields as living data.
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
};
