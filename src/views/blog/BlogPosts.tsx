import { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Chip, Stack } from '@mui/material';

interface Post {
    filename: string;
    date_created: string;
    title: string;
    subtitle: string;
    banner_image: string;
    slug: string;
    tags?: string[];
};

const formatDate = (inputDate: string): string => {
  const [year, month, day] = inputDate.split('-');
  const months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
};

export const BlogPosts = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [activeTag, setActiveTag] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch('/posts.json');
            const data: Post[] = await response.json();
            setPosts(data);
          } catch {
            setPosts([]);
          }
        };

        fetchData();
      }, []);

    const allTags = useMemo(() => {
      const tagSet = new Set<string>();
      posts.forEach((post) => post.tags?.forEach((tag) => tagSet.add(tag)));
      return Array.from(tagSet).sort();
    }, [posts]);

    const filteredPosts = activeTag
      ? posts.filter((post) => post.tags?.includes(activeTag))
      : posts;

  return (
    <Container maxWidth="sm">
      {allTags.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3, mt: 1 }}>
          <Chip
            label="All"
            size="small"
            variant={activeTag === null ? 'filled' : 'outlined'}
            color="primary"
            onClick={() => setActiveTag(null)}
            sx={{ cursor: 'pointer' }}
          />
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant={activeTag === tag ? 'filled' : 'outlined'}
              color="primary"
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>
      )}

      <Grid container spacing={3}>
        {filteredPosts.map((post, index) => (
          <Grid item xs={12} key={index}>
            <RouterLink to={post.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card sx={{ border: 'none', boxShadow: 'none' }}>
                <Grid container>
                    {post.banner_image && (
                    <Grid item xs={3}>
                        <CardMedia
                        component="img"
                        alt={`Banner for ${post.title}`}
                        height="100"
                        image={post.banner_image}
                        style={{ marginTop: '10px' }}
                        />
                    </Grid>
                    )}
                    <Grid item xs={post.banner_image ? 9 : 12}>
                    <CardContent>
                        <Typography variant="h5" fontWeight="bold" component="div" color="primary">
                        {post.title}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        {"Posted on "} {formatDate(post.date_created)}
                        </Typography>
                        {post.tags && (
                          <Stack direction="row" gap={0.5} sx={{ mt: 0.5 }}>
                            {post.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" color="primary"
                                sx={{ fontSize: '0.7rem', height: '22px' }}
                              />
                            ))}
                          </Stack>
                        )}
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
