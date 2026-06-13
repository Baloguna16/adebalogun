import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  NigeriaFeature,
  topologyToNigeriaFeatures,
} from './geo';
import { electionData } from './electionData';
import { Layer, StateElection } from './types';
import {
  NEUTRAL,
  fillForState,
  partyLabelOf,
  resolve,
  timingBucketOf,
} from './parties';

export interface ElectionMapProps {
  topology: unknown;
  layer: Layer;
  showWatch: boolean;
  hovered: string | null;
  pinned: string | null;
  onHover: (iso: string | null) => void;
  onPin: (iso: string) => void;
}

const TIMING_LABEL: Record<string, string> = {
  v2026: "'26",
  gen2027: 'FEB',
  off2027: "'27",
  off2028: "'28",
  off2029: "'29",
  none: '',
};

/** Short non-colour cue rendered on each state, varying by active layer. */
const labelFor = (rec: StateElection, layer: Layer): string => {
  if (rec.iso === 'NG-FC') return 'FCT';
  if (layer === 'party') return partyLabelOf(rec.currentParty, rec.partyLabel).slice(0, 4);
  return TIMING_LABEL[timingBucketOf(rec)] ?? '';
};

export const ElectionMap = ({
  topology,
  layer,
  showWatch,
  hovered,
  pinned,
  onHover,
  onPin,
}: ElectionMapProps) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const features: NigeriaFeature[] = useMemo(
    () => topologyToNigeriaFeatures(topology),
    [topology]
  );

  const stroke = mode === 'dark' ? '#0f1115' : '#ffffff';
  const selStroke = theme.palette.text.primary;
  const labelFill = mode === 'dark' ? '#f4f6f8' : '#10141a';
  const labelHalo = mode === 'dark' ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.7)';
  const watchRing = mode === 'dark' ? '#ffd54a' : '#b8860b';

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label="Map of Nigeria's 36 states and the FCT, coloured by the selected layer"
    >
      {features.map((f) => {
        const rec = electionData.states[f.iso];
        const isSelected = pinned === f.iso;
        const isHovered = hovered === f.iso;
        const fill = rec ? fillForState(rec, layer, mode) : resolve(NEUTRAL, mode);
        return (
          <path
            key={f.iso}
            d={f.path}
            fill={fill}
            stroke={isSelected ? selStroke : stroke}
            strokeWidth={isSelected ? 1.6 : 0.6}
            style={{
              filter: isHovered && !isSelected ? 'brightness(1.18)' : undefined,
              cursor: 'pointer',
              transition: 'filter .12s',
            }}
            onMouseEnter={() => onHover(f.iso)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onPin(f.iso)}
            tabIndex={-1}
            aria-label={rec ? `${rec.name}, ${rec.governor}` : f.name}
          >
            <title>{rec ? rec.name : f.name}</title>
          </path>
        );
      })}

      {/* Non-colour cue: short label per state */}
      {features.map((f) => {
        const rec = electionData.states[f.iso];
        if (!rec) return null;
        const text = labelFor(rec, layer);
        if (!text) return null;
        return (
          <text
            key={`l-${f.iso}`}
            x={f.label[0]}
            y={f.label[1]}
            textAnchor="middle"
            dy="0.32em"
            fontSize={8.5}
            fontFamily='"Space Mono", monospace'
            fill={labelFill}
            aria-hidden="true"
            style={{
              pointerEvents: 'none',
              paintOrder: 'stroke',
              stroke: labelHalo,
              strokeWidth: 2,
              strokeLinejoin: 'round',
            }}
          >
            {text}
          </text>
        );
      })}

      {/* Editorial "races to watch" annotation (opt-in) */}
      {showWatch &&
        features.map((f) => {
          const rec = electionData.states[f.iso];
          if (!rec?.watch) return null;
          return (
            <circle
              key={`w-${f.iso}`}
              cx={f.label[0]}
              cy={f.label[1] - 12}
              r={rec.watch.level === 'high' ? 5 : 3.5}
              fill="none"
              stroke={watchRing}
              strokeWidth={2}
              aria-hidden="true"
              style={{ pointerEvents: 'none' }}
            />
          );
        })}
    </svg>
  );
};
