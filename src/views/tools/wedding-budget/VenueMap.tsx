import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, Link } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Venue } from './types';
import { useEffect } from 'react';

const createVenueIcon = (day: string, isDark: boolean) => {
  const color = day === 'Day 1' ? '#2196f3' : '#e91e63';
  const label = day === 'Day 1' ? '1' : '2';
  return L.divIcon({
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    html: `
      <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z"
          fill="${color}" stroke="${isDark ? '#fff' : '#333'}" stroke-width="1.5"/>
        <circle cx="16" cy="15" r="9" fill="white"/>
        <text x="16" y="19" text-anchor="middle" font-size="13" font-weight="bold" fill="${color}">${label}</text>
      </svg>
    `,
  });
};

const formatDate = (d: string) => {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const FitBounds = ({ venues }: { venues: Venue[] }) => {
  const map = useMap();
  useEffect(() => {
    if (venues.length === 0) return;
    const bounds = L.latLngBounds(venues.map(v => [v.lat, v.lng]));
    map.fitBounds(bounds.pad(0.5), { maxZoom: 12 });
  }, [map, venues]);
  return null;
};

const TileSwapper = () => {
  const map = useMap();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  useEffect(() => {
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    L.tileLayer(
      isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>' },
    ).addTo(map);
  }, [map, isDark]);
  return null;
};

interface Props {
  venues: Venue[];
}

export const VenueMap = ({ venues }: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const center: [number, number] = venues.length > 0
    ? [venues.reduce((s, v) => s + v.lat, 0) / venues.length, venues.reduce((s, v) => s + v.lng, 0) / venues.length]
    : [41.54, -72.93];

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Venues</Typography>
      <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: 260, width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer
            url={isDark
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />
          <TileSwapper />
          <FitBounds venues={venues} />
          {venues.map(v => (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={createVenueIcon(v.day, isDark)}>
              <Popup>
                <div style={{ minWidth: 180, fontFamily: 'inherit', fontSize: 13 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{v.name}</div>
                  <div style={{ color: '#888' }}>{v.address}</div>
                  <div style={{ marginTop: 4 }}>{formatDate(v.date)}</div>
                  {v.phone && <div>{v.phone}</div>}
                  {v.notes && <div style={{ marginTop: 4, fontStyle: 'italic', color: '#888' }}>{v.notes}</div>}
                  {v.website && (
                    <a href={v.website} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 4 }}>
                      Visit Website
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* Venue cards below map */}
      {venues.map(v => (
        <Box
          key={v.id}
          sx={{
            display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1.5, p: 1.5,
            borderRadius: 1, border: 1, borderColor: 'divider',
          }}
        >
          <Chip
            label={v.day}
            size="small"
            color={v.day === 'Day 1' ? 'primary' : 'secondary'}
            sx={{ minWidth: 52 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight="bold">{v.name}</Typography>
            <Typography variant="caption" color="text.secondary">{v.address}</Typography>
            <Typography variant="caption" display="block">{formatDate(v.date)}</Typography>
            {v.phone && (
              <Link href={`tel:${v.phone}`} variant="caption">{v.phone}</Link>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
