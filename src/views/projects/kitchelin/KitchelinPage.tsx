import { Container, Typography, Chip, Stack, Button, Box } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import LanguageIcon from '@mui/icons-material/Language';
import { PhoneFrame } from './sim/PhoneFrame';
import { CookScreen } from './sim/CookScreen';
import { RecipeScreen } from './sim/RecipeScreen';
import { SousChefScreen } from './sim/SousChefScreen';
import './KitchelinPage.css';

const techStack = [
  'SwiftUI', 'TypeScript', 'Express', 'PostgreSQL', 'Prisma',
  'Gemini 2.5 Flash', 'ElevenLabs', 'Google Cloud Run', 'Stripe',
  'StoreKit 2', 'Next.js', 'Docker',
];

const features = [
  { title: 'Ingredient Scanning', description: 'Snap a photo of your fridge or pantry — AI identifies every ingredient instantly.' },
  { title: 'AI Recipe Generation', description: 'One tap produces a full recipe tailored to your ingredients, mood, and available cookware.' },
  { title: 'Voice Sous-Chef', description: 'Ask questions hands-free while cooking. Wake word activation means you never touch your phone with dirty hands.' },
  { title: 'Kitchen Inventory', description: 'Photograph your cookware and the app catalogs it, factoring it into every recipe suggestion.' },
  { title: 'Recipe Remixing', description: 'Modify any recipe via chat — "make it spicier", "swap the chicken" — and get a new variant.' },
  { title: 'Community Publishing', description: 'Publish recipes to the web with shareable cards, building a community cookbook.' },
];

export const KitchelinPage = () => (
  <Container maxWidth="md" sx={{ py: 6 }} className="kitchelin-page">
    <Typography variant="h3" fontWeight="bold" gutterBottom>
      Kitchelin
    </Typography>
    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
      AI-powered cooking assistant &mdash; Oct 2024 - Present
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
      Role: Founder &amp; Developer
    </Typography>
    <Typography variant="body1" sx={{ my: 2, lineHeight: 1.8 }}>
      Built an iOS app that turns whatever's in your fridge into restaurant-quality meals.
      Users snap photos of their ingredients, and the app generates complete recipes using AI —
      including step-by-step instructions, chef's tips, and cookware suggestions. A voice-activated
      sous-chef guides you through cooking hands-free, answering questions in real time.
      The backend runs entirely on Google Cloud with no API keys on-device, and the companion
      website handles subscriptions, published recipes, and an admin dashboard.
    </Typography>

    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
      {techStack.map((tech) => (
        <Chip
          key={tech}
          label={tech}
          size="small"
          variant="outlined"
          sx={{ borderColor: '#FF6A1A', color: '#FF6A1A' }}
        />
      ))}
    </Stack>

    <Stack direction="row" gap={2} sx={{ mb: 6 }}>
      <Button
        variant="contained"
        startIcon={<AppleIcon />}
        href="https://apps.apple.com/us/app/kitchelin/id6760368348"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          bgcolor: '#FF6A1A',
          '&:hover': { bgcolor: '#e55e15' },
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        App Store
      </Button>
      <Button
        variant="outlined"
        startIcon={<LanguageIcon />}
        href="https://www.kitchelin.com"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          borderColor: '#FF6A1A',
          color: '#FF6A1A',
          '&:hover': { borderColor: '#e55e15', bgcolor: 'rgba(255,106,26,0.04)' },
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        Website
      </Button>
    </Stack>

    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        App Preview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Simulated screens from the Kitchelin iOS app.
      </Typography>
      <div className="kitchelin-phone-grid">
        <PhoneFrame label="Scan Ingredients">
          <CookScreen />
        </PhoneFrame>
        <PhoneFrame label="Cook a Recipe">
          <RecipeScreen />
        </PhoneFrame>
        <PhoneFrame label="Voice Sous-Chef">
          <SousChefScreen />
        </PhoneFrame>
      </div>
    </Box>

    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Key Features
      </Typography>
      <Stack spacing={2}>
        {features.map((feature) => (
          <Box key={feature.title}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#FF6A1A' }}>
              {feature.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {feature.description}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  </Container>
);
