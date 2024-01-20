import { Typography, Paper } from '@mui/material';
import { Card, CardMedia } from '@mui/material';

import { BlogTitle } from './BlogTitle';

interface SectionData {
  title: string;
  paragraphs: string[];
  image?: string;
}

interface BlogSectionProps {
  section: SectionData;
  index: number;
}

export const BlogSection = ({ section, index }: BlogSectionProps) => {

    return (
        <Paper key={index} elevation={0} style={{ margin: '20px 0', padding: '15px' }}>
          <BlogTitle title={section.title} variant="h4" />
          {section.image && (
            <Card>
              <CardMedia component="img" alt={`Section ${index + 1} Image`} height="140" image={section.image} />
            </Card>
          )}
          {section.paragraphs.map((paragraph, pIndex) => (
            <Typography key={pIndex} paragraph>
              {paragraph}
            </Typography>
          ))}
        </Paper>
    );
}
