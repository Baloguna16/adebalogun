import { Container, Typography, Chip, Box, Stack } from '@mui/material';
import { HubbubNavbar } from './sim/HubbubNavbar';
import { HubbubHero } from './sim/HubbubHero';
import { HubbubCategories } from './sim/HubbubCategories';
import { HubbubProducts } from './sim/HubbubProducts';
import { HubbubPerks } from './sim/HubbubPerks';
import { HubbubFooter } from './sim/HubbubFooter';
import './HubbubPage.css';

const techStack = [
  'React', 'Python', 'Flask', 'PostgreSQL', 'RabbitMQ',
  'Docker', 'Stripe', 'AWS S3', 'GCP Cloud Run', 'Heroku',
];

export const HubbubPage = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    {/* Project Info */}
    <Typography variant="h3" fontWeight="bold" gutterBottom>
      Hubbub
    </Typography>
    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
      Rental marketplace &mdash; Jan 2020 - Dec 2022
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
      Role: Co-Founder &amp; Tech Lead
    </Typography>
    <Typography variant="body1" sx={{ my: 2, lineHeight: 1.8 }}>
      Co-founded a rental marketplace for college students to rent household items
      instead of buying and discarding them. Grew to 450 users across NYU and Columbia, processed
      $20K in orders, diverted 10 tons of waste from landfills, facilitated 530 rental transactions
      and 330 delivery events, conducted 300+ user interviews, and advanced to Y Combinator's
      final interview round. Built and operated 28+ microservices across the platform.
    </Typography>

    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 4 }}>
      {techStack.map((tech) => (
        <Chip key={tech} label={tech} size="small" variant="outlined" />
      ))}
    </Stack>

    {/* Mini-Sim */}
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Website Simulation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A recreation of the Hubbub homepage as it appeared during operation.
      </Typography>
      <div className="hubbub-sim">
        <HubbubNavbar />
        <HubbubHero />
        <HubbubCategories />
        <HubbubProducts />
        <HubbubPerks />
        <HubbubFooter />
      </div>
    </Box>
  </Container>
);
