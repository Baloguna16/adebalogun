import { useContext } from 'react';
import { Container, Box, Paper, IconButton } from '@mui/material';
import { Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DarkMode, LightMode } from '@mui/icons-material';

import { ColorModeContext } from '../../App';

export const Navbar = () => {
    const theme = useTheme();
    const { toggleColorMode } = useContext(ColorModeContext);

    return (
        <Container maxWidth="sm">
            <Paper
                component="nav"
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
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Link href="/" underline="none" sx={{ my: 2, mr: 3, color: 'primary.main', display: 'block' }}>Main</Link>
                    <Link href="/projects" underline="none" sx={{ my: 2, mr: 3, color: 'primary.main', display: 'block' }}>Projects</Link>
                    <Link href="/blog" underline="none" sx={{ my: 2, mr: 3, color: 'primary.main', display: 'block' }}>Blog</Link>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 1 }}>
                        {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
                    </IconButton>
                </Box>
            </Paper>
        </Container>

    );

}
