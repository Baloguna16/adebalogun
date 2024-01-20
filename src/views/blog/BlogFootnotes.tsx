import React from 'react';
import { List, ListItem, Card, CardContent, Typography } from '@mui/material';

interface Footnote {
    index: number;
    body: string;
    link?: string;
}

interface BlogFootnotesProps {
    footnotes: Footnote[];
}

export const BlogFootnotes: React.FC<BlogFootnotesProps> = ({ footnotes }) => {
  return (
    <List>
      {footnotes.map(({ index, body, link }, arrayIndex) => (
        <ListItem key={arrayIndex}>
          <Card variant="outlined" style={{ width: '100%' }}>
            <CardContent>
              {link ? (
                <>
                  <Typography variant="body2" color="textSecondary" style={{ display: 'inline-block', marginRight: '8px' }}>
                    {`${index}.`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ display: 'inline-block' }}>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {body}
                    </a>
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {`${index}. ${body}`}
                </Typography>
              )}
            </CardContent>
          </Card>
        </ListItem>
      ))}
    </List>
  );
};
