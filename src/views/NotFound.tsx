import { Container, Box, Typography } from '@mui/material';
import { Link } from '@mui/material';

export const NotFound = () => {
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
                <Typography variant="h1" sx={{ fontSize: '4rem' }} fontWeight="bold" gutterBottom>
                    404
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Page not found
                </Typography>
                <Typography color="textSecondary" mb={3}>
                    The page you're looking for doesn't exist.
                </Typography>
                <Link href="/" underline="hover" color="primary">
                    Go back home
                </Link>
            </Box>
        </Container>
    );
};
