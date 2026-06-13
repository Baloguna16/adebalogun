import {
  Box,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Layer } from './types';

export interface LayerToggleProps {
  layer: Layer;
  showWatch: boolean;
  hasWatch: boolean;
  onLayer: (layer: Layer) => void;
  onToggleWatch: () => void;
}

export const LayerToggle = ({
  layer,
  showWatch,
  hasWatch,
  onLayer,
  onToggleWatch,
}: LayerToggleProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
    <ToggleButtonGroup
      size="small"
      exclusive
      value={layer}
      onChange={(_, v: Layer | null) => v && onLayer(v)}
      aria-label="Map colour layer"
    >
      <ToggleButton value="party" aria-label="Colour by party control">
        Party control
      </ToggleButton>
      <ToggleButton value="timing" aria-label="Colour by election timing">
        Election timing
      </ToggleButton>
    </ToggleButtonGroup>

    {hasWatch && (
      <FormControlLabel
        control={<Switch size="small" checked={showWatch} onChange={onToggleWatch} />}
        label="Races to watch"
      />
    )}
  </Box>
);
