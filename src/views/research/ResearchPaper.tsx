import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AudioPlayer } from './AudioPlayer';
import type { Paper, ResearchManifest } from './types';

export const ResearchPaper = () => {
  const { slug } = useParams<{ slug: string }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const [paper, setPaper] = useState<Paper | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [manifestRes, mdRes] = await Promise.all([
          fetch(`${process.env.PUBLIC_URL}/research-data/manifest.json`),
          fetch(`${process.env.PUBLIC_URL}/research-data/papers/${slug}.md`),
        ]);

        if (manifestRes.ok) {
          const manifest: ResearchManifest = await manifestRes.json();
          const found = manifest.papers.find(p => p.slug === slug);
          if (found) setPaper(found);
        }

        if (mdRes.ok) {
          setMarkdown(await mdRes.text());
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!paper) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h5">Paper not found</Typography>
        <RouterLink to="/research" style={{ color: primaryColor, textDecoration: 'none' }}>
          ← Back to Research
        </RouterLink>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <RouterLink
        to="/research"
        style={{ color: primaryColor, textDecoration: 'none', fontSize: '0.875rem' }}
      >
        ← Back to Research
      </RouterLink>

      <Typography
        sx={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          color: 'primary.main',
          textTransform: 'uppercase',
          letterSpacing: 1,
          mt: 3,
          mb: 1,
        }}
      >
        {paper.category}
      </Typography>

      <Typography
        variant="h4"
        sx={{ fontFamily: 'Space Mono, monospace', fontWeight: 'bold', mb: 1, lineHeight: 1.3 }}
      >
        {paper.title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Typography variant="body2" color="textSecondary">
          {new Date(paper.date + 'T00:00:00').toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </Typography>
        <Typography variant="body2" color="textSecondary">·</Typography>
        <Typography variant="body2" color="textSecondary">
          {paper.readTimeMinutes} min read
        </Typography>
      </Box>

      {paper.hasAudio && (
        <AudioPlayer src={`${process.env.PUBLIC_URL}/research-data/${paper.audioFile}`} />
      )}

      <Box
        sx={{
          fontFamily: 'Open Sans, Roboto, sans-serif',
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'text.primary',
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontFamily: 'Space Mono, Roboto Mono, monospace',
            mt: 3,
            mb: 1,
          },
          '& h1': { fontSize: '2rem', borderBottom: `2px solid ${primaryColor}`, pb: 0.5 },
          '& h2': { fontSize: '1.5rem', borderBottom: `1px solid ${borderColor}`, pb: 0.5 },
          '& h3': { fontSize: '1.25rem' },
          '& p': { my: 1.5 },
          '& a': { color: primaryColor, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
          '& blockquote': {
            borderLeft: `3px solid ${primaryColor}`,
            pl: 2,
            ml: 0,
            color: 'text.secondary',
            fontStyle: 'italic',
          },
          '& code': {
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.85em',
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            px: 0.75,
            py: 0.25,
            borderRadius: 0.5,
          },
          '& pre': { my: 2, borderRadius: 1, overflow: 'auto' },
          '& pre code': { bgcolor: 'transparent', p: 0 },
          '& .table-wrapper': {
            overflowX: 'auto',
            my: 2,
            borderRadius: 1,
            border: `1px solid ${borderColor}`,
          },
          '& table': { width: '100%', borderCollapse: 'collapse', minWidth: 400 },
          '& th, & td': {
            borderBottom: `1px solid ${borderColor}`,
            px: 2,
            py: 1.25,
            textAlign: 'left',
            verticalAlign: 'top',
            lineHeight: 1.6,
            fontSize: '0.9rem',
          },
          '& td:not(:last-child), & th:not(:last-child)': {
            borderRight: `1px solid ${borderColor}`,
          },
          '& th': {
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            fontFamily: 'Space Mono, monospace',
            fontWeight: 600,
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
          },
          '& tr:last-child td': { borderBottom: 'none' },
          '& tr:nth-of-type(even)': {
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
          },
          '& hr': { border: 'none', borderTop: `1px solid ${borderColor}`, my: 3 },
          '& img': { maxWidth: '100%', borderRadius: 1 },
          '& ul, & ol': { pl: 3 },
          '& li': { mb: 0.5 },
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table({ children }) {
              return (
                <div className="table-wrapper">
                  <table>{children}</table>
                </div>
              );
            },
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match && !String(children).includes('\n');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={isDark ? oneDark : oneLight}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: 6, fontSize: '0.85rem' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>{children}</code>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </Box>
    </Container>
  );
};
