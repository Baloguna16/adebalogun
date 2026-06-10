import { useMemo } from 'react';
import { findPlace, topologyToFeatures } from './geo';
import { visitedStates } from './travelData';
import { GeoShape } from './GeoShape';

const WIDTH = 960;
const HEIGHT = 600;

export interface USMapProps {
  topology: unknown;
  onActivate: (id: string, pos: { top: number; left: number }) => void;
}

export const USMap = ({ topology, onActivate }: USMapProps) => {
  const features = useMemo(
    () => topologyToFeatures(topology, 'states', WIDTH, HEIGHT, 'us'),
    [topology]
  );

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="United States map"
    >
      {features.map((f) => {
        const place = findPlace(f.id, visitedStates);
        return (
          <GeoShape
            key={f.id}
            id={f.id}
            name={f.name}
            d={f.path}
            visited={!!place}
            visitCount={place ? place.visits.length : 0}
            clickable={!!place}
            onActivate={onActivate}
          />
        );
      })}
    </svg>
  );
};
