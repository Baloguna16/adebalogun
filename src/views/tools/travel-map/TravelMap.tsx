import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGeoData } from './useGeoData';
import {
  computeStats,
  findPlace,
  TOTAL_COUNTRIES,
  TOTAL_STATES,
  US_COUNTRY_ID,
} from './geo';
import { Place, visitedCountries, visitedStates } from './travelData';
import { WorldMap } from './WorldMap';
import { USMap } from './USMap';
import { PlacePopup } from './PlacePopup';

interface Selection {
  place: Place;
  pos: { top: number; left: number };
}

export const TravelMap = () => {
  const [view, setView] = useState<'world' | 'us'>('world');
  const [selection, setSelection] = useState<Selection | null>(null);
  const world = useGeoData(`${process.env.PUBLIC_URL}/data/countries-110m.json`);
  const us = useGeoData(`${process.env.PUBLIC_URL}/data/states-10m.json`);
  const stats = useMemo(() => computeStats(visitedCountries, visitedStates), []);

  const handleCountry = (id: string, pos: { top: number; left: number }) => {
    if (id === US_COUNTRY_ID) {
      setView('us');
      return;
    }
    const place = findPlace(id, visitedCountries);
    if (place) setSelection({ place, pos });
  };

  const handleState = (id: string, pos: { top: number; left: number }) => {
    const place = findPlace(id, visitedStates);
    if (place) setSelection({ place, pos });
  };

  const active = view === 'world' ? world : us;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Travel Map
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {stats.countries} / {TOTAL_COUNTRIES} countries · {stats.states} /{' '}
        {TOTAL_STATES} states
      </Typography>
      <Box sx={{ minHeight: 48, display: 'flex', alignItems: 'center' }}>
        {view === 'us' && (
          <Button startIcon={<ArrowBackIcon />} onClick={() => setView('world')}>
            World
          </Button>
        )}
      </Box>
      {active.error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={active.retry}>
              Retry
            </Button>
          }
        >
          Could not load the map data.
        </Alert>
      ) : active.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in timeout={300} key={view}>
          <Box>
            {view === 'world' ? (
              <WorldMap topology={world.topology} onActivate={handleCountry} />
            ) : (
              <USMap topology={us.topology} onActivate={handleState} />
            )}
          </Box>
        </Fade>
      )}
      <PlacePopup selection={selection} onClose={() => setSelection(null)} />
    </Container>
  );
};
