import { useEffect, useState, useMemo } from 'react';
import { Chip, Stack } from '@mui/material';
import { DirectoryList, DirectoryEntry } from '../../base/DirectoryList';

interface Post {
  filename: string;
  date_created: string;
  title: string;
  subtitle: string;
  banner_image: string;
  slug: string;
  tags?: string[];
}

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

  const entries: DirectoryEntry[] = filteredPosts.map((post) => ({
    href: post.slug,
    title: post.title,
    description: post.subtitle,
    thumbnail: post.banner_image || undefined,
    date: post.date_created,
    tags: post.tags,
  }));

  const toolbar =
    allTags.length > 0 ? (
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
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
    ) : undefined;

  return <DirectoryList heading="Blog" entries={entries} toolbar={toolbar} />;
};
