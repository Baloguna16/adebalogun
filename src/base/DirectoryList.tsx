import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export interface DirectoryEntry {
  title: string;
  href: string;
  external?: boolean;
  date: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
}

export interface DirectoryListProps {
  heading: string;
  entries: DirectoryEntry[];
  toolbar?: React.ReactNode;
}

const rowSx = (isLast: boolean) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.5,
  py: 1.5,
  borderBottom: isLast ? 0 : 1,
  borderColor: 'divider',
  textDecoration: 'none',
  color: 'inherit',
  '&:hover': { bgcolor: 'action.hover' },
  '&:hover .dir-title': { textDecoration: 'underline' },
});

const RowBody: React.FC<{ entry: DirectoryEntry }> = ({ entry }) => (
  <>
    {entry.thumbnail && (
      <Box
        component="img"
        src={entry.thumbnail}
        alt=""
        sx={{
          width: 56,
          height: 56,
          objectFit: 'cover',
          borderRadius: 1,
          flexShrink: 0,
        }}
      />
    )}

    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        className="dir-title"
        variant="body1"
        component="span"
        sx={{
          fontFamily: '"Space Mono", monospace',
          fontWeight: 'bold',
          color: 'primary.main',
          display: 'block',
        }}
      >
        {entry.title}
        {entry.external && ' ↗'}
      </Typography>

      {entry.description && (
        <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
          {entry.description}
        </Typography>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Space Mono", monospace',
            color: 'text.secondary',
            display: 'block',
          }}
        >
          {entry.tags.map((t) => '#' + t).join('  ')}
        </Typography>
      )}
    </Box>

    <Typography
      variant="caption"
      sx={{
        fontFamily: '"Space Mono", monospace',
        color: 'text.secondary',
        whiteSpace: 'nowrap',
        ml: 'auto',
        flexShrink: 0,
        pt: 0.25,
      }}
    >
      {entry.date}
    </Typography>
  </>
);

export const DirectoryList: React.FC<DirectoryListProps> = ({ heading, entries, toolbar }) => {
  const entryLabel = entries.length === 1 ? '1 entry' : `${entries.length} entries`;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          {heading}
          <Box
            component="span"
            sx={{ color: 'primary.main', fontFamily: '"Space Mono", monospace' }}
          >
            _
          </Box>
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Space Mono", monospace',
            color: 'text.secondary',
            display: 'block',
          }}
        >
          {entryLabel}
        </Typography>
      </Box>

      {/* Optional toolbar */}
      {toolbar && <Box sx={{ mb: 2 }}>{toolbar}</Box>}

      {/* Rows */}
      <Box>
        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1;

          if (entry.external) {
            return (
              <Box
                key={entry.href + index}
                component="a"
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={rowSx(isLast)}
              >
                <RowBody entry={entry} />
              </Box>
            );
          }

          return (
            <Box
              key={entry.href + index}
              component={RouterLink}
              to={entry.href}
              sx={rowSx(isLast)}
            >
              <RowBody entry={entry} />
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};
