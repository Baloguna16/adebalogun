import { Container, Grid, Card, CardContent, Typography, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface Link {
  path: string;
  title: string;
  date_completed: string;
  type?: 'internal' | 'external';
}

interface LinkArray {
  links: Link[];
}

const linksData: LinkArray = {
  links: [
    { path: '/projects/hubbub', title: 'Hubbub — Rental marketplace', date_completed: 'December 2022', type: 'internal' },
    { path: '/documents/pr-cultivation-io-2021.pdf', title: 'Modelling input-output relationships to optimize production of a live-attenuated malaria vaccine', date_completed: 'January 27, 2024' }
  ],
};

const LinkCard = ({ link }: { link: Link }) => (
  <Card sx={{ border: 'none', boxShadow: 'none' }}>
    <Grid container>
      <Grid item xs={12}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" component="div">
            {link.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {"Completed on "} {link.date_completed}
          </Typography>
        </CardContent>
      </Grid>
    </Grid>
  </Card>
);

export const ProjectPosts = () => {
  return (
    <Container maxWidth="sm">
      <Grid container spacing={3}>
        {linksData.links.map((link, index) => (
          <Grid item xs={12} key={index}>
            {link.type === 'internal' ? (
              <RouterLink
                to={link.path}
                style={{ textDecoration: 'none', color: 'blue' }}
              >
                <LinkCard link={link} />
              </RouterLink>
            ) : (
              <a
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'blue' }}
              >
                <LinkCard link={link} />
              </a>
            )}
            {index < linksData.links.length - 1 && <Divider sx={{ marginY: 2 }} />}
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
