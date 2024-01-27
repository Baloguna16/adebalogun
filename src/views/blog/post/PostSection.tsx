import ReactMarkdown from 'react-markdown';
import { Typography, Paper } from '@mui/material';
import { Card, CardMedia } from '@mui/material';

import { PostTitle } from './PostTitle';
import { PostQuote } from './PostQuote';

interface SectionData {
  title: string;
  paragraphs: string[];
  quote?: {
    text: string;
    source?: string;
  };
  image?: string;
}

interface PostSectionProps {
  section: SectionData;
  index: number;
}

export const PostSection = ({ section, index }: PostSectionProps) => {

    return (
        <Paper key={index} elevation={0} style={{ margin: '20px 0', padding: '15px' }}>
          <PostTitle title={section.title} variant="h4" />
          {section.image && (
            <Card>
              <CardMedia component="img" alt={`Section ${index + 1} Image`} height="140" image={section.image} />
            </Card>
          )}
          {section.paragraphs.map((paragraph, pIndex) => (
            <Typography key={pIndex} style={{ textAlign: 'justify' }} paragraph>
              <ReactMarkdown>{paragraph}</ReactMarkdown>
            </Typography>
          ))}
          {section.quote && <PostQuote text={section.quote.text} source={section.quote.source} />}
        </Paper>
    );
}
