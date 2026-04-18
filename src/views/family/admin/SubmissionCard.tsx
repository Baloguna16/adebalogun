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
  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();

  const getPersonName = (id: string) => {
    const p = allProfiles.find(ap => ap.id === id);
    return p ? `${p.first_name} ${p.last_name}` : 'Unknown';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar
            src={profile.photo_url || undefined}
            sx={{ width: 48, height: 48 }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {profile.first_name} {profile.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.birth_year
                ? `${profile.birth_year_approximate ? 'c. ' : 'b. '}${profile.birth_year}`
                : 'Birth year unknown'}
              {profile.death_year ? ` — d. ${profile.death_year}` : ''}
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
              const isParent = r.relationship_type === 'parent_child' && r.person_a_id === profile.id;
              const isChild = r.relationship_type === 'parent_child' && r.person_b_id === profile.id;
              const otherPersonId = r.person_a_id === profile.id ? r.person_b_id : r.person_a_id;
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
              Submitted {new Date(profile.created_at).toLocaleDateString()}
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
