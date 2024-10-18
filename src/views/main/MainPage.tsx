import { Container, Box } from '@mui/material';
import { Typography } from '@mui/material';

import { WaveEmoji } from '../../base/emojis';

import profileJpg from './assets/profile-3.jpg';

export const MainPage = () => {
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, mb: 4 }}>
                <img src={profileJpg} className='headshot-image' alt='ade' />
            </Box>
            <Box sx={{ mt: 5, mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" mb={2}>
                    Hey, I'm Adekunle
                    <WaveEmoji />
                </Typography>
                <Typography>
                    I love <strong>engineering</strong> 🔨 and our great, big <strong>Planet Earth</strong> 🌱 
                </Typography>
                <Typography>
                    {'\nand for a living, I get to use the first thing to fix the other.'}
                </Typography>
                <Typography mt={3}>
                    When I'm not doing that, I like to tinker~
                </Typography>
            </Box>
        </Container>
    );
}