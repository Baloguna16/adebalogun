import { Container, Box } from '@mui/material';
import { Typography } from '@mui/material';

import { WaveEmoji } from '../../base/emojis';

import profileJpg from './assets/profile-2.jpg';

export const MainPage = () => {
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, mb: 4 }}>
                <img src={profileJpg} className='headshot-image' alt='ade' />
            </Box>
            <Box sx={{ mt: 5, mb: 4 }}>
                <Typography variant="h4" mb={2}>
                    Hey, I'm Ade
                    <WaveEmoji />
                </Typography>
                <Typography>
                    I'm passionate about <strong>engineering</strong> 🔨 and our great, big <strong>Planet Earth</strong> 🌱 
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