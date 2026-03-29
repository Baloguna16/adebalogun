import { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import type { Paper, ResearchManifest } from './types';

export const ResearchIndex = () => {
  const [manifest, setManifest] = useState<ResearchManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/research/manifest.json`)
      .then(res => res.json())
      .then((data: ResearchManifest) => setManifest(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!manifest) return [];
    const query = search.toLowerCase();
    return manifest.papers.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = !query ||
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [manifest, search, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, Paper[]> = {};
    for (const paper of filtered) {
      if (!groups[paper.category]) groups[paper.category] = [];
      groups[paper.category].push(paper);
    }
    return groups;
  }, [filtered]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!manifest) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h5">No research papers found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Run <code>npm run sync-research</code> to sync papers.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Research
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        {manifest.papers.length} papers across {manifest.categories.length} categories
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Search papers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2.5 }}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3.5 }}>
        <Chip
          label={`All (${manifest.papers.length})`}
          onClick={() => setActiveCategory('All')}
          color={activeCategory === 'All' ? 'primary' : 'default'}
          variant={activeCategory === 'All' ? 'filled' : 'outlined'}
          size="small"
        />
        {manifest.categories.map(cat => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => setActiveCategory(cat)}
            color={activeCategory === cat ? 'primary' : 'default'}
            variant={activeCategory === cat ? 'filled' : 'outlined'}
            size="small"
          />
        ))}
      </Box>

      {Object.entries(grouped).map(([category, papers]) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              mb: 1.5,
            }}
          >
            {category}
          </Typography>

          {papers.map((paper, i) => (
            <Box key={paper.slug}>
              <RouterLink
                to={`/research/${paper.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Box
                  sx={{
                    py: 1.75,
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s',
                    px: 1,
                    borderRadius: '4px',
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {paper.title}
                  </Typography>
                  {paper.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                      {paper.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(paper.date + 'T00:00:00').toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">·</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {paper.readTimeMinutes} min read
                    </Typography>
                    {paper.hasAudio && (
                      <>
                        <Typography variant="caption" color="textSecondary">·</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <VolumeUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="textSecondary">Audio</Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </RouterLink>
              {i < papers.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      ))}

      {filtered.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
          No papers match your search.
        </Typography>
      )}
    </Container>
  );
};
