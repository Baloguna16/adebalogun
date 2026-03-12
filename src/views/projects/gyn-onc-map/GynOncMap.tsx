import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Collapse from '@mui/material/Collapse';
import ListIcon from '@mui/icons-material/FormatListNumbered';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTheme } from '@mui/material/styles';

import { fellowshipPrograms, statePopulationMarkers, FellowshipProgram } from './data';

import 'leaflet/dist/leaflet.css';

const US_CENTER: [number, number] = [39.8283, -95.5795];

// Sort programs: ranked first (ascending), unranked at end
const sortedPrograms = [...fellowshipPrograms].sort((a, b) => {
  if (a.rank && b.rank) return a.rank - b.rank;
  if (a.rank) return -1;
  if (b.rank) return 1;
  return a.institution.localeCompare(b.institution);
});

// SVG marker factory
const makeSvgIcon = (color: string, size: number, glyph: string) =>
  L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="${color}" stroke="#fff" stroke-width="2" opacity="0.9"/>
        <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle"
              fill="#fff" font-size="${size * 0.45}px" font-family="Space Mono, monospace" font-weight="bold">
          ${glyph}
        </text>
      </svg>`,
  });

// City marker — pin-drop SVG
const makeCityIcon = (color: string) =>
  L.divIcon({
    className: '',
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -30],
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"
              fill="${color}" stroke="#fff" stroke-width="1.5" opacity="0.85"/>
        <circle cx="12" cy="11" r="4.5" fill="#fff" opacity="0.9"/>
      </svg>`,
  });

// Swap tiles on theme change
const TileSwapper = ({ isDark }: { isDark: boolean }) => {
  const map = useMap();

  useEffect(() => {
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(tileUrl, { attribution }).addTo(map);
  }, [isDark, map]);

  return null;
};

// Component to fly to a location from outside the map
const FlyToHandler = ({ target }: { target: { lat: number; lng: number } | null }) => {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 10, { duration: 1.2 });
    }
  }, [target, map]);

  return null;
};

export const GynOncMap = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;

  const programColor = isDark ? '#08FF00' : '#5D3FD3';
  const cityColor = isDark ? '#5c6bc0' : '#1565c0';

  const [listOpen, setListOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Refs to program markers so we can open their popups programmatically
  const markerRefs = useRef<Map<number, L.Marker>>(new Map());

  const setMarkerRef = useCallback((index: number, ref: L.Marker | null) => {
    if (ref) {
      markerRefs.current.set(index, ref);
    } else {
      markerRefs.current.delete(index);
    }
  }, []);

  const filteredPrograms = useMemo(() => {
    if (!search.trim()) return sortedPrograms;
    const q = search.toLowerCase();
    return sortedPrograms.filter(
      (p) =>
        p.institution.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.director?.toLowerCase().includes(q)
    );
  }, [search]);

  const handleProgramClick = useCallback((program: FellowshipProgram) => {
    setFlyTarget({ lat: program.lat, lng: program.lng });

    // Find the original index in fellowshipPrograms to open the right popup
    const origIndex = fellowshipPrograms.indexOf(program);
    setTimeout(() => {
      const marker = markerRefs.current.get(origIndex);
      if (marker) {
        marker.openPopup();
      }
    }, 1300); // wait for flyTo animation
  }, []);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

  const panelBg = isDark ? 'rgba(18,18,18,0.92)' : 'rgba(255,255,255,0.92)';
  const panelBorder = `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`;
  const panelShadow = isDark ? '0 4px 24px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.1)';

  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Legend — top left */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1000,
          bgcolor: panelBg,
          borderRadius: 2,
          p: 2.5,
          backdropFilter: 'blur(12px)',
          maxWidth: 300,
          border: panelBorder,
          boxShadow: panelShadow,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: '0.9rem', color: primary, letterSpacing: '0.02em' }}
        >
          ACGME Gyn Onc Fellowships
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: programColor,
                border: '2px solid #fff',
                boxShadow: `0 0 4px ${programColor}`,
              }}
            />
            <Typography variant="caption">
              {fellowshipPrograms.length} Programs
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: cityColor }} />
            <Typography variant="caption">
              {statePopulationMarkers.length} States
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
          Click a marker for program details.
          <br />
          Pin markers show each state's largest city.
        </Typography>
      </Box>

      {/* Program list panel — top right */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          maxWidth: 380,
          width: listOpen ? 380 : 'auto',
        }}
      >
        {/* Toggle button */}
        {!listOpen && (
          <IconButton
            onClick={() => setListOpen(true)}
            sx={{
              bgcolor: panelBg,
              backdropFilter: 'blur(12px)',
              border: panelBorder,
              boxShadow: panelShadow,
              color: primary,
              '&:hover': {
                bgcolor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(240,240,240,0.95)',
              },
            }}
          >
            <ListIcon />
          </IconButton>
        )}

        <Collapse in={listOpen}>
          <Box
            sx={{
              bgcolor: panelBg,
              backdropFilter: 'blur(12px)',
              border: panelBorder,
              boxShadow: panelShadow,
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 48px)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                pt: 1.5,
                pb: 0.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: primary }}
              >
                All Programs
              </Typography>
              <IconButton size="small" onClick={() => setListOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Search */}
            <Box
              sx={{
                mx: 2,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderRadius: 1.5,
                px: 1.5,
                py: 0.25,
              }}
            >
              <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
              <InputBase
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ fontSize: '0.85rem', flex: 1 }}
                inputProps={{ 'aria-label': 'Search fellowship programs' }}
              />
            </Box>

            <Divider />

            {/* List */}
            <Box sx={{ overflowY: 'auto', flex: 1 }}>
              {filteredPrograms.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 2, textAlign: 'center' }}
                >
                  No programs found.
                </Typography>
              )}

              {filteredPrograms.map((program, i) => {
                const origIndex = fellowshipPrograms.indexOf(program);
                return (
                  <Box
                    key={origIndex}
                    onClick={() => handleProgramClick(program)}
                    sx={{
                      px: 2,
                      py: 1.25,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      transition: 'background 0.15s',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      },
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    {/* Rank badge */}
                    <Box
                      sx={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: program.rank ? programColor : 'transparent',
                        border: program.rank
                          ? `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)'}`
                          : `2px dashed ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'Space Mono, monospace',
                          fontWeight: 700,
                          color: program.rank
                            ? '#fff'
                            : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'),
                          fontSize: '0.7rem',
                        }}
                      >
                        {program.rank ?? '—'}
                      </Typography>
                    </Box>

                    {/* Program info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {program.institution}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ lineHeight: 1.3 }}
                      >
                        {program.city}, {program.state}
                        {program.director && ` · ${program.director}`}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Collapse>
      </Box>

      <MapContainer
        center={US_CENTER}
        zoom={4.5}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        <TileSwapper isDark={isDark} />
        <FlyToHandler target={flyTarget} />

        {/* State most-populated-city markers */}
        {statePopulationMarkers.map((marker) => (
          <Marker
            key={`state-${marker.state}`}
            position={[marker.lat, marker.lng]}
            icon={makeCityIcon(cityColor)}
          >
            <Popup>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.85rem' }}>
                <strong>{marker.city}, {marker.state}</strong>
                <br />
                <span style={{ color: '#888', fontSize: '0.8em' }}>
                  Most populated city in state
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fellowship program markers */}
        {fellowshipPrograms.map((program, index) => (
          <Marker
            key={`program-${index}`}
            position={[program.lat, program.lng]}
            icon={makeSvgIcon(
              programColor,
              28,
              program.rank ? `${program.rank}` : '',
            )}
            ref={(ref) => setMarkerRef(index, ref)}
          >
            <Popup>
              <Box sx={{ maxWidth: 280, fontFamily: 'Open Sans, sans-serif' }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, mb: 0.5 }}
                >
                  {program.institution}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {program.city}, {program.state}
                </Typography>

                {program.rank && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Box component="span" sx={{ color: primary, fontWeight: 700 }}>
                      #{program.rank}
                    </Box>
                    {' '}Reputation Rank
                  </Typography>
                )}

                {(program.director || program.directorEmail) && (
                  <>
                    <Divider sx={{ my: 0.75 }} />
                    {program.director && (
                      <Typography variant="body2" sx={{ mb: 0.25 }}>
                        <strong>Director:</strong> {program.director}
                      </Typography>
                    )}
                    {program.directorEmail && (
                      <Typography variant="body2">
                        <Link
                          href={`mailto:${program.directorEmail}`}
                          sx={{ fontSize: '0.85rem' }}
                        >
                          {program.directorEmail}
                        </Link>
                      </Typography>
                    )}
                  </>
                )}

                <Divider sx={{ my: 0.75 }} />
                <Link
                  href={program.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{ fontWeight: 600, color: primary }}
                >
                  Visit Program Page &rarr;
                </Link>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};
