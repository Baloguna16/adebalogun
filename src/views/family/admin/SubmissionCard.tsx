import {
  Card, CardContent, Typography, Box, Button, Avatar, Chip, Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Profile, Relationship } from '../types';

interface SubmissionCardProps {
  profile: Profile;
  relationships: Relationship[];
  allProfiles: Profile[];
  onApprove: (profileId: string) => void;
  onDeny: (profileId: string) => void;
  onEdit: (profile: Profile) => void;
  hasDependents: boolean;
}

export function SubmissionCard({
  profile,
  relationships,
  allProfiles,
  onApprove,
  onDeny,
  onEdit,
  hasDependents,
}: SubmissionCardProps) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  const getPersonName = (id: string) => {
    const p = allProfiles.find(ap => ap.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar
            src={profile.photoUrl || undefined}
            sx={{ width: 48, height: 48 }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.birthYear
                ? `${profile.birthYearApproximate ? 'c. ' : 'b. '}${profile.birthYear}`
                : 'Birth year unknown'}
              {profile.deathYear ? ` — d. ${profile.deathYear}` : ''}
            </Typography>
            {profile.bio && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{profile.bio}"
              </Typography>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="caption" color="text.secondary" display="block">
              Relationships:
            </Typography>
            {relationships.map(r => {
              const isParent = r.relationshipType === 'parent_child' && r.personAId === profile.id;
              const isChild = r.relationshipType === 'parent_child' && r.personBId === profile.id;
              const otherPersonId = r.personAId === profile.id ? r.personBId : r.personAId;
              const label = isParent
                ? `Parent of ${getPersonName(otherPersonId)}`
                : isChild
                  ? `Child of ${getPersonName(otherPersonId)}`
                  : `Spouse of ${getPersonName(otherPersonId)}`;

              return (
                <Chip
                  key={r.id}
                  label={label}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 0.5, mt: 0.5 }}
                />
              );
            })}

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Submitted {new Date(profile.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(profile)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => {
              if (hasDependents) {
                const confirmed = window.confirm(
                  'This profile has other pending submissions that depend on it. Denying it will also deny those relationships. Continue?'
                );
                if (!confirmed) return;
              }
              onDeny(profile.id);
            }}
          >
            Deny
          </Button>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => onApprove(profile.id)}
          >
            Approve
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
