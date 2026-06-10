import { useMemo } from 'react';
import { findPlace, topologyToFeatures, US_COUNTRY_ID } from './geo';
import { visitedCountries } from './travelData';
import { GeoShape } from './GeoShape';

const WIDTH = 960;
const HEIGHT = 500;

export interface WorldMapProps {
  topology: unknown;
  onActivate: (id: string, pos: { top: number; left: number }) => void;
}

export const WorldMap = ({ topology, onActivate }: WorldMapProps) => {
  const features = useMemo(
    () => topologyToFeatures(topology, 'countries', WIDTH, HEIGHT, 'world'),
    [topology]
  );

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="World map"
    >
      {features.map((f) => {
        const place = findPlace(f.id, visitedCountries);
        return (
          <GeoShape
            key={f.id}
            id={f.id}
            name={f.name}
            d={f.path}
            visited={!!place}
            visitCount={place ? place.visits.length : 0}
            clickable={!!place || f.id === US_COUNTRY_ID}
            onActivate={onActivate}
          />
        );
      })}
    </svg>
  );
};
