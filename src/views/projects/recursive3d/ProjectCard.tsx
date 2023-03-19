import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import { Card, CardMedia, CardContent } from '@mui/material';

import recursive3DJpg from '../assets/recursive3d.jpg';

export const ProjectCard = () => {
    return (
        <Card sx={{ display: 'flex' }}>
            
            <CardMedia
                component="img"
                sx={{ width: 151 }}
                image={recursive3DJpg}
                alt="Live from space album cover"
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h5">
                        Live From Space
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
}