import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Use 'react-router-dom' if you're using React Router
import { Container, Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';

import { BlogTitle } from './BlogTitle';

interface Post {
    filename: string;
    title: string;
    subtitle: string;
    banner_image: string;
    slug: string;
    // Add other necessary properties
};

export const BlogPosts = () => {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch('./posts.json'); // Adjust the path accordingly
            const data: Post[] = await response.json();
            setPosts(data);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
    
        fetchData();
      }, []);

  return (
    
    <Container maxWidth="sm">
        <Grid container spacing={3}>
        {posts.map((post, index) => (
          <Grid item xs={12} key={index}>
            <RouterLink to={post.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card sx={{ border: 'none', boxShadow: 'none' }}>
                <Grid container>
                    {post.banner_image && (
                    <Grid item xs={3}>
                        <CardMedia
                        component="img"
                        alt="Post Banner"
                        height="100"
                        image={post.banner_image}
                        style={{ marginTop: '10px' }}
                        />
                    </Grid>
                    )}
                    <Grid item xs={post.banner_image ? 9 : 12}>
                    <CardContent>
                        <Typography variant="h5" fontWeight="bold" component="div">
                        {post.title}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        {post.subtitle}
                        </Typography>
                        {/* Add other content of the post if needed */}
                    </CardContent>
                    </Grid>
                </Grid>
                </Card>
            </RouterLink>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};