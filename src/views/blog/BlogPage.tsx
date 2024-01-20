import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Card, Box, CardMedia, Container } from '@mui/material';

import { BlogSection } from './BlogSection';
import { BlogTitle, BlogSubtitle } from './BlogTitle';
import { BlogFootnotes } from './BlogFootnotes';

interface BlogData {
    title: string;
    subtitle: string;
    banner_image: string;
    banner_image_alt: string;
    sections: Array<{
        title: string;
        paragraphs: string[];
        image?: string;
  }>;
    footnotes: Array<{
        index: number;
        body: string;
        link?: string;
    }>;
}

export const BlogPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [postData, setPostData] = useState<BlogData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const response = await fetch(`../posts/${slug}.json`); // Adjust the path accordingly
            const data: BlogData = await response.json();

            setPostData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, []);

    if (!postData) return null;

    const { title, subtitle, banner_image, banner_image_alt, sections, footnotes } = postData;

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, mb: 1 }}>
                <BlogTitle title={title} variant="h2" />
                <BlogSubtitle subtitle={subtitle} />
                <Card>
                    <CardMedia component="img" alt={banner_image_alt} image={banner_image} />
                </Card>
            </Box>
            <Box sx={{ mt: 1, mb: 4 }}>
                {sections.map((section, index) => (
                    <BlogSection section={section} index={index} />
                ))}
                <BlogFootnotes footnotes={footnotes} />
            </Box>
        </Container>
    );
};