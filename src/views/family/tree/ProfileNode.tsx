import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Typography, Avatar, IconButton, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Profile } from '../types';

interface ProfileNodeData {
  profile: Profile;
  isCollapsed: boolean;
  collapsedCount: number;
  onToggleCollapse: () => void;
  hasPrivateFields?: boolean;
  onRequestLocation?: () => void;
  onRequestContact?: () => void;
}

function ProfileNodeInner({ data }: NodeProps) {
  const theme = useTheme();
  const { profile, isCollapsed, collapsedCount, onToggleCollapse, hasPrivateFields, onRequestLocation, onRequestContact } = data as unknown as ProfileNodeData;

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  const birthDisplay = profile.birthYear
    ? `${profile.birthYearApproximate ? 'c. ' : 'b. '}${profile.birthYear}`
    : '';
  const deathDisplay = profile.deathYear ? ` — d. ${profile.deathYear}` : '';

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        width: 260,
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />

      <Box
        sx={{
          height: 60,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Avatar
          src={profile.photoUrl || undefined}
          sx={{
            width: 56,
            height: 56,
            border: `3px solid ${theme.palette.background.paper}`,
            position: 'absolute',
            bottom: -28,
            bgcolor: theme.palette.secondary.main,
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          {initials}
        </Avatar>
      </Box>

      <Box sx={{ pt: 4, pb: 2, px: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {profile.firstName} {profile.lastName}
        </Typography>
        {(birthDisplay || deathDisplay) && (
          <Typography variant="caption" color="text.secondary">
            {birthDisplay}{deathDisplay}
          </Typography>
        )}
        {profile.bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontStyle: 'italic', fontSize: '0.75rem' }}
          >
            "{profile.bio}"
          </Typography>
        )}

        {hasPrivateFields && (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mt: 1 }}>
            {onRequestLocation && (
              <Chip
                label="Request Location"
                size="small"
                variant="outlined"
                color="primary"
                onClick={(e) => { e.stopPropagation(); onRequestLocation(); }}
                sx={{ fontSize: '0.65rem' }}
              />
            )}
            {onRequestContact && (
              <Chip
                label="Request Contact"
                size="small"
                variant="outlined"
                color="primary"
                onClick={(e) => { e.stopPropagation(); onRequestContact(); }}
                sx={{ fontSize: '0.65rem' }}
              />
            )}
          </Box>
        )}

        {collapsedCount > 0 && (
          <Box sx={{ mt: 1 }}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}>
              {isCollapsed ? <UnfoldMoreIcon fontSize="small" /> : <UnfoldLessIcon fontSize="small" />}
            </IconButton>
            {isCollapsed && (
              <Chip label={`+${collapsedCount}`} size="small" sx={{ ml: 0.5 }} />
            )}
          </Box>
        )}
      </Box>

      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </Box>
  );
}

export const ProfileNode = memo(ProfileNodeInner);
