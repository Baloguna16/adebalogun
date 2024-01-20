import { Typography } from '@mui/material';

interface BlogTitleProps {
    title: string;
    variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2" | "caption" | "button" | "overline" | "inherit" | undefined;
}

export const BlogTitle = ({ title, variant }: BlogTitleProps) => {
    const titleFontSize = calculateTitleFontSize();

    function calculateTitleFontSize() {
        // You can adjust these values based on your design requirements
        const baseFontSize = 2; // in rem
        const viewportWidthThreshold = 600; // in pixels

        // Calculate font size based on viewport width
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const fontSize = viewportWidth < viewportWidthThreshold ? baseFontSize * (viewportWidth / viewportWidthThreshold) : baseFontSize;

        return `${fontSize}rem`;
    }

    return (
        <Typography variant={variant} fontWeight="bold" gutterBottom style={{ fontSize: titleFontSize }}>
            {title}
        </Typography>
    );
}

interface BlogSubtitleProps {
    subtitle: string;
  }
  
  export const BlogSubtitle: React.FC<BlogSubtitleProps> = ({ subtitle }) => {
    return (
      <Typography 
        variant="body1" 
        component="div" 
        color="textSecondary" 
        fontSize="1.2rem" 
        style={{ marginBottom: '10px' }}
        >
        {subtitle}
      </Typography>
    );
  };