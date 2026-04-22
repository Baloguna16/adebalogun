import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CasinoIcon from '@mui/icons-material/Casino';

const SITE_DOMAIN = 'www.adebalogun.me';

const generateRandomSlug = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const buildRickrollUrl = (slug: string, title: string, imageUrl: string): string => {
  const base = `https://${SITE_DOMAIN}/r/${slug}`;
  const params = new URLSearchParams();
  if (title.trim()) params.set('t', title.trim());
  if (imageUrl.trim()) params.set('img', imageUrl.trim());
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
};

export const RickrollGenerator = () => {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const displaySlug = slug || 'your-slug';
  const fullUrl = buildRickrollUrl(slug || 'your-slug', title, imageUrl);

  const handleCopy = async () => {
    if (!slug) return;
    const url = buildRickrollUrl(slug, title, imageUrl);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandom = () => {
    setSlug(generateRandomSlug());
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Rickroll Link Generator
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Generate a disguised link that redirects to a surprise. Add a title and image for a convincing link preview in iMessage, Slack, and Discord.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="Slug"
            placeholder="free-pizza"
            value={slug}
            onChange={(e) => setSlug(e.target.value.replace(/\s/g, '-'))}
            size="small"
          />
          <Button
            variant="outlined"
            onClick={handleRandom}
            startIcon={<CasinoIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Random
          </Button>
        </Box>

        <TextField
          fullWidth
          label="Link Preview Title (optional)"
          placeholder="Free Concert Tickets Giveaway"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="small"
        />

        <TextField
          fullWidth
          label="Link Preview Image URL (optional)"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          size="small"
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: 'action.hover',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            flex: 1,
            color: slug ? 'text.primary' : 'text.disabled',
          }}
        >
          {fullUrl}
        </Typography>
        <IconButton
          onClick={handleCopy}
          disabled={!slug}
          color={copied ? 'success' : 'default'}
          size="small"
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Paper>

      {copied && (
        <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
          Copied!
        </Typography>
      )}
    </Container>
  );
};
