import { Container, Box, Paper } from '@mui/material';
import { Link } from '@mui/material';

export const Navbar = () => {
    return (
        <Container maxWidth="sm">
            <Paper 
                elevation={0}
                sx={{
                    my: 2,
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
                }}
            >
                <Box sx={{ 
                    ml: 2,
                    flexGrow: 0, 
                    display: 'flex'
                }}>
                    <Link href="/" underline="none" sx={{ my: 2, mr: 3, color: 'primary.main', display: 'block' }}>Projects</Link>
                    <Link href="/" underline="none" sx={{ my: 2, mr: 3, color: 'primary.main', display: 'block' }}>Writing</Link>
                </Box>
            </Paper>
        </Container>
        
    );

}