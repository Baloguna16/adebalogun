import { Container, Grid, Card, CardContent, Typography, Divider } from '@mui/material';

interface Link {
  path: string;
  title: string;
  date_completed: string;
}

interface LinkArray {
  links: Link[];
}

const linksData: LinkArray = {
  links: [
    { path: '/documents/pr-cultivation-io-2021.pdf', title: 'Modelling input-output relationships to optimize production of a live-attenuated malaria vaccine', date_completed: 'January 27, 2024' }
  ],
};

export const ProjectPosts = () => {
    
  return (
    
    <Container maxWidth="sm">
      <Grid container spacing={3}>
        {linksData.links.map((link, index) => (
          <Grid item xs={12} key={index}>
          <a 
            href={link.path}
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'blue' }}
          >
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
          </a>
          {/* Add a Divider after each item (except the last one) */}
          {index < linksData.links.length - 1 && <Divider sx={{ marginY: 2 }} />}
        </Grid>
        ))}
      </Grid>
    </Container>
  );
};