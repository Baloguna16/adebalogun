import { Container, Grid, Card, CardContent, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface Tool {
  path: string;
  title: string;
  description: string;
}

const tools: Tool[] = [
  {
    path: '/tools/markdown-viewer',
    title: 'Markdown Viewer',
    description: 'Paste Markdown and preview it rendered in real time.',
  },
];

export const ToolsIndex = () => (
  <Container maxWidth="sm" sx={{ mt: 4 }}>
    <Typography variant="h4" gutterBottom>
      Tools
    </Typography>
    <Grid container spacing={2}>
      {tools.map((tool) => (
        <Grid item xs={12} key={tool.path}>
          <RouterLink to={tool.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card
              sx={{
                border: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'background-color 0.2s',
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {tool.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {tool.description}
                </Typography>
              </CardContent>
            </Card>
          </RouterLink>
        </Grid>
      ))}
    </Grid>
  </Container>
);
