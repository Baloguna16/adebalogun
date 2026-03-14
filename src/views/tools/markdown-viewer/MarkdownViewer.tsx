import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const STORAGE_KEY = 'md-viewer-content';

const SAMPLE_MD = `# Markdown Viewer

Welcome! Paste your **Markdown** here and see it rendered live.

## Features

- Live preview as you type
- Syntax-highlighted code blocks
- Light & dark theme support

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('world'));
\`\`\`

### A Table

| Component | File | What it does |
|---|---|---|
| **Server** | \`server/index.ts\` | Express HTTP server + WebSocket server on port 3001. Manages in-memory document state. |
| **Git manager** | \`server/gitManager.ts\` | Wraps git CLI via \`execSync\`. Initializes a git repo in \`pfd-data/\`. |
| **Doc generation** | \`server/routes/generate.ts\` | \`/api/upload\` (multer, PDF parsing), \`/api/generate\` (Claude streaming via SSE). |

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

---

Start editing to see your own Markdown rendered here.
`;

export const MarkdownViewer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const [markdown, setMarkdown] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ?? SAMPLE_MD;
  });
  const [editorOpen, setEditorOpen] = useState(true);
  const [copyTooltip, setCopyTooltip] = useState('Copy Markdown');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, markdown);
  }, [markdown]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopyTooltip('Copied!');
      setTimeout(() => setCopyTooltip('Copy Markdown'), 1500);
    });
  }, [markdown]);

  const handleClear = useCallback(() => {
    setMarkdown('');
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleExportPdf = useCallback(() => {
    const previewEl = previewContentRef.current;
    if (!previewEl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(
      `<!DOCTYPE html><html><head><title>Markdown Export</title>` +
      `<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">` +
      `<style>` +
      `body { font-family: 'Open Sans', sans-serif; line-height: 1.7; padding: 40px; max-width: 800px; margin: 0 auto; color: #222; }` +
      `h1, h2, h3, h4, h5, h6 { font-family: 'Space Mono', monospace; margin-top: 1.5em; margin-bottom: 0.5em; }` +
      `h1 { font-size: 2rem; border-bottom: 2px solid #333; padding-bottom: 4px; }` +
      `h2 { font-size: 1.5rem; border-bottom: 1px solid #ccc; padding-bottom: 4px; }` +
      `h3 { font-size: 1.25rem; }` +
      `p { margin: 1em 0; }` +
      `code { font-family: 'Space Mono', monospace; font-size: 0.85em; background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 3px; }` +
      `pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow: auto; margin: 1em 0; }` +
      `pre code { background: transparent; padding: 0; }` +
      `blockquote { border-left: 3px solid #333; padding-left: 16px; margin-left: 0; color: #555; font-style: italic; }` +
      `.table-wrapper { overflow-x: auto; margin: 1em 0; border-radius: 4px; border: 1px solid #ddd; }` +
      `table { width: 100%; border-collapse: collapse; min-width: 400px; }` +
      `th, td { border-bottom: 1px solid #ddd; padding: 10px 16px; text-align: left; vertical-align: top; font-size: 0.9rem; }` +
      `td:not(:last-child), th:not(:last-child) { border-right: 1px solid #ddd; }` +
      `th { background: rgba(0,0,0,0.04); font-family: 'Space Mono', monospace; font-weight: 600; font-size: 0.85rem; }` +
      `tr:last-child td { border-bottom: none; }` +
      `hr { border: none; border-top: 1px solid #ccc; margin: 24px 0; }` +
      `img { max-width: 100%; }` +
      `ul, ol { padding-left: 24px; }` +
      `li { margin-bottom: 4px; }` +
      `a { color: #1976d2; text-decoration: none; }` +
      `@media print { body { padding: 0; } }` +
      `</style></head><body>${previewEl.innerHTML}</body></html>`,
    );
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }, []);

  const lineCount = markdown.split('\n').length;

  const handleScroll = () => {
    if (textareaRef.current && lineNumberRef.current) {
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const primaryColor = theme.palette.primary.main;
  const editorBg = isDark ? '#1e1e1e' : '#fafafa';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const lineNumColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  const toolbar = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        py: 0.5,
        borderBottom: `1px solid ${borderColor}`,
        minHeight: 40,
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontFamily: 'Space Mono, monospace', color: 'text.secondary' }}
      >
        Editor
      </Typography>
      <Box>
        <Tooltip title={copyTooltip}>
          <IconButton size="small" onClick={handleCopy}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear">
          <IconButton size="small" onClick={handleClear}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Export as PDF">
          <IconButton size="small" onClick={handleExportPdf}>
            <PictureAsPdfIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={editorOpen ? 'Collapse editor' : 'Expand editor'}>
          <IconButton size="small" onClick={() => setEditorOpen((v) => !v)}>
            {isMobile ? (
              editorOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />
            ) : (
              editorOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const editorPanel = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: isMobile ? 'none' : `1px solid ${borderColor}`,
        borderBottom: isMobile ? `1px solid ${borderColor}` : 'none',
      }}
    >
      {toolbar}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Line numbers */}
        <Box
          ref={lineNumberRef}
          sx={{
            width: 48,
            flexShrink: 0,
            overflow: 'hidden',
            bgcolor: editorBg,
            borderRight: `1px solid ${borderColor}`,
            py: 1.5,
            px: 0.5,
            userSelect: 'none',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <Box
              key={i}
              sx={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.85rem',
                lineHeight: '1.5rem',
                textAlign: 'right',
                pr: 1,
                color: lineNumColor,
              }}
            >
              {i + 1}
            </Box>
          ))}
        </Box>
        {/* Textarea */}
        <Box
          component="textarea"
          ref={textareaRef}
          value={markdown}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMarkdown(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          sx={{
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            p: 1.5,
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.85rem',
            lineHeight: '1.5rem',
            bgcolor: editorBg,
            color: 'text.primary',
            overflow: 'auto',
            '&::placeholder': { color: lineNumColor },
          }}
          placeholder="Paste your Markdown here..."
        />
      </Box>
    </Box>
  );

  const previewPanel = (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: { xs: 2, md: 3 },
        minWidth: 0,
      }}
    >
      {!editorOpen && (
        <Box sx={{ mb: 1, display: 'flex', gap: 0.5 }}>
          <Tooltip title="Expand editor">
            <IconButton size="small" onClick={() => setEditorOpen(true)}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export as PDF">
            <IconButton size="small" onClick={handleExportPdf}>
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Box
        ref={previewContentRef}
        sx={{
          fontFamily: 'Open Sans, Roboto, sans-serif',
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'text.primary',
          maxWidth: 800,
          mx: 'auto',
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
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 400,
          },
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
          '& tr:last-child td': {
            borderBottom: 'none',
          },
          '& tr:nth-of-type(even)': {
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
          },
          '& td code': {
            fontSize: '0.8em',
            whiteSpace: 'nowrap',
          },
          '& hr': {
            border: 'none',
            borderTop: `1px solid ${borderColor}`,
            my: 3,
          },
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
                  customStyle={{
                    margin: 0,
                    borderRadius: 6,
                    fontSize: '0.85rem',
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* Editor */}
      {editorOpen && (
        <Box
          sx={{
            width: isMobile ? '100%' : '45%',
            height: isMobile ? '40vh' : '100%',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {editorPanel}
        </Box>
      )}
      {/* Preview */}
      {previewPanel}
    </Box>
  );
};
