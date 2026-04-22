import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Profile } from '../types';

interface CompactNodeData {
  profile: Profile;
  isCollapsed: boolean;
  collapsedCount: number;
}

function CompactNodeInner({ data }: NodeProps) {
  const theme = useTheme();
  const { profile, isCollapsed, collapsedCount } = data as unknown as CompactNodeData;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <Avatar
        src={profile.photoUrl || undefined}
        sx={{
          width: 40,
          height: 40,
          bgcolor: theme.palette.primary.main,
          fontSize: 14,
          fontWeight: 'bold',
        }}
      >
        {initials}
      </Avatar>
      <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', maxWidth: 80 }} noWrap>
        {profile.firstName}
      </Typography>
      {isCollapsed && collapsedCount > 0 && (
        <Chip label={`+${collapsedCount}`} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
      )}
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </Box>
  );
}

export const CompactNode = memo(CompactNodeInner);
