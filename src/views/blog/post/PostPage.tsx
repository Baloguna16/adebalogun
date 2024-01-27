import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Box, CardMedia, Container } from '@mui/material';

import { PostSection } from './PostSection';
import { PostTitle, PostSubtitle } from './PostTitle';
import { PostFootnotes } from './PostFootnotes';

interface PostData {
    title: string;
    subtitle: string;
    banner_image: string;
    banner_image_alt: string;
    sections: Array<{
        title: string;
        paragraphs: string[];
        quote?: {
            text: string;
            source?: string;
        };
        image?: string;
  }>;
    footnotes: Array<{
        index: number;
        body: string;
        link?: string;
    }>;
}

export const PostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [postData, setPostData] = useState<PostData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const response = await fetch(`../posts/${slug}.json`); // Adjust the path accordingly
            const data: PostData = await response.json();

            setPostData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, [slug]);

    if (!postData) return null;

    const { title, subtitle, banner_image, banner_image_alt, sections, footnotes } = postData;

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, mb: 1 }}>
                <PostTitle title={title} variant="h2" />
                <PostSubtitle subtitle={subtitle} />
                <Card>
                    <CardMedia component="img" alt={banner_image_alt} image={banner_image} />
                </Card>
            </Box>
            <Box sx={{ mt: 1, mb: 4 }}>
                {sections.map((section, index) => (
                    <PostSection section={section} index={index} />
                ))}
                <PostFootnotes footnotes={footnotes} />
            </Box>
        </Container>
    );
};