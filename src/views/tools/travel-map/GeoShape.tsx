import { useState, KeyboardEvent, MouseEvent } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

export interface GeoShapeProps {
  id: string;
  name: string;
  d: string;
  visited: boolean;
  visitCount: number;
  clickable: boolean;
  onActivate: (id: string, pos: { top: number; left: number }) => void;
}

export const GeoShape = ({
  id,
  name,
  d,
  visited,
  visitCount,
  clickable,
  onActivate,
}: GeoShapeProps) => {
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  const dark = theme.palette.mode === 'dark';

  const fill = visited
    ? theme.palette.primary.main
    : dark
    ? theme.palette.grey[800]
    : theme.palette.grey[300];
  const stroke = dark ? theme.palette.grey[900] : '#ffffff';

  const label = visited
    ? `${name}, ${visitCount} visit${visitCount === 1 ? '' : 's'}`
    : name;

  const handleClick = (e: MouseEvent<SVGPathElement>) => {
    if (!clickable) return;
    onActivate(id, { top: e.clientY, left: e.clientX });
  };

  const handleKeyDown = (e: KeyboardEvent<SVGPathElement>) => {
    if (!clickable || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    onActivate(id, {
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width / 2,
    });
  };

  return (
    <Tooltip title={label} followCursor>
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={0.5}
        opacity={hover && clickable ? 0.75 : 1}
        cursor={clickable ? 'pointer' : 'default'}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={label}
      />
    </Tooltip>
  );
};
