import { Container, Box } from '@mui/material';
import { Typography, Breadcrumbs, Link } from '@mui/material';

import { ProjectCard as Recursive3DCard } from './recursive3d';


export const ProjectPage = () => {
    return (
        <Container maxWidth="sm">
            <Breadcrumbs aria-label="breadcrumb" sx={{ ml: 3 }}>
                <Link underline="hover" color="inherit" href="/">
                    Home
                </Link>
                <Typography color="text.primary">Projects</Typography>
            </Breadcrumbs>
            <Box sx={{ mt: 5, mb: 4 }}>
                <Recursive3DCard />
            </Box>
        </Container>
    );
}