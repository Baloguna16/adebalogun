import { Typography } from '@mui/material';

interface PostTitleProps {
    title: string;
    variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2" | "caption" | "button" | "overline" | "inherit" | undefined;
}

export const PostTitle = ({ title, variant }: PostTitleProps) => {
    return (
        <Typography
            variant={variant}
            fontWeight="bold"
            gutterBottom
            sx={{
                fontSize: { xs: 'clamp(1rem, 5vw, 2rem)', sm: '2rem' },
            }}
        >
            {title}
        </Typography>
    );
}

interface PostSubtitleProps {
    subtitle: string;
}

export const PostSubtitle: React.FC<PostSubtitleProps> = ({ subtitle }) => {
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
