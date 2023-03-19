import { Container, Box } from '@mui/material';
import { Typography, Link } from '@mui/material';

import { Email, GitHub, LinkedIn } from '@mui/icons-material';

export const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                    ? theme.palette.grey[200]
                    : theme.palette.grey[800],
            }}
        >
            <Container maxWidth="sm">
                <Typography variant="body1">
                    {'I\'ve been thinking about '}
                    <Link href="https://youtu.be/3tkQyqLnFbk?t=5478" underline="none">{'this interview'}</Link>.
                </Typography>
                <Box sx={{ mt: 1 }}>
                    <Link href="mailto:ade.d.balogun@gmail.com" mr={2}><Email /></Link>
                    <Link href="https://github.com/Baloguna16" mr={2}><GitHub /></Link>
                    <Link href="https://www.linkedin.com/in/adbalogun/" mr={2}><LinkedIn /></Link>
                </Box>
            </Container>
        </Box>
    );
}

