import { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Button, Alert, CircularProgress, Autocomplete, TextField,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Profile, Relationship, ProfileClaim } from '../types';
import { SubmissionCard } from './SubmissionCard';
import { ProfileEditor } from './ProfileEditor';
import { NotFound } from '../../NotFound';

export function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [claims, setClaims] = useState<ProfileClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [mergePrimary, setMergePrimary] = useState<Profile | null>(null);
  const [mergeDuplicate, setMergeDuplicate] = useState<Profile | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [profilesRes, relsRes, claimsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('relationships').select('*'),
      supabase.from('profile_claims').select('*').order('created_at', { ascending: false }),
    ]);
    setProfiles((profilesRes.data || []) as Profile[]);
    setRelationships((relsRes.data || []) as Relationship[]);
    setClaims((claimsRes.data || []) as ProfileClaim[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  if (authLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (!isAdmin) {
    return <NotFound />;
  }

  const pendingProfiles = profiles.filter(p => p.status === 'pending');
  const pendingClaims = claims.filter(c => c.status === 'pending');

  const batchGroups = new Map<string, Profile[]>();
  for (const p of pendingProfiles) {
    const batch = batchGroups.get(p.submission_batch_id) || [];
    batch.push(p);
    batchGroups.set(p.submission_batch_id, batch);
  }

  const handleApprove = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    await supabase.from('profiles').update({ status: 'approved' }).eq('id', profileId);

    await supabase
      .from('relationships')
      .update({ status: 'approved' })
      .or(`person_a_id.eq.${profileId},person_b_id.eq.${profileId}`)
      .eq('status', 'pending');

    const pendingClaimForProfile = claims.find(
      c => c.profile_id === profileId && c.status === 'pending'
    );
    if (pendingClaimForProfile && profile.death_year != null) {
      await supabase
        .from('profile_claims')
        .update({ status: 'approved', resolved_at: new Date().toISOString() })
        .eq('id', pendingClaimForProfile.id);
    }

    fetchData();
  };

  const handleDeny = async (profileId: string) => {
    await supabase.from('profiles').update({ status: 'denied' }).eq('id', profileId);

    await supabase
      .from('relationships')
      .update({ status: 'denied' })
      .or(`person_a_id.eq.${profileId},person_b_id.eq.${profileId}`)
      .eq('status', 'pending');

    fetchData();
  };

  const handleApproveClaim = async (claimId: string) => {
    await supabase
      .from('profile_claims')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('id', claimId);
    fetchData();
  };

  const handleDenyClaim = async (claimId: string) => {
    await supabase
      .from('profile_claims')
      .update({ status: 'denied', resolved_at: new Date().toISOString() })
      .eq('id', claimId);
    fetchData();
  };

  const handleMerge = async (primaryId: string, duplicateId: string) => {
    await supabase.from('relationships').update({ person_a_id: primaryId }).eq('person_a_id', duplicateId);
    await supabase.from('relationships').update({ person_b_id: primaryId }).eq('person_b_id', duplicateId);
    await supabase.from('profile_claims')
      .update({ status: 'denied', resolved_at: new Date().toISOString() })
      .eq('profile_id', duplicateId);
    await supabase.from('profiles').update({ status: 'denied' }).eq('id', duplicateId);
    fetchData();
  };

  const hasDependents = (profileId: string) => {
    return relationships.some(
      r => r.status === 'pending' &&
        (r.person_a_id === profileId || r.person_b_id === profileId) &&
        r.person_a_id !== r.person_b_id
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Family Tree Admin
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Submissions (${pendingProfiles.length})`} />
        <Tab label={`Claims (${pendingClaims.length})`} />
        <Tab label="Manage" />
      </Tabs>

      {loading && <CircularProgress />}

      {!loading && tab === 0 && (
        <>
          {pendingProfiles.length === 0 ? (
            <Alert severity="info">No pending submissions.</Alert>
          ) : (
            Array.from(batchGroups.entries()).map(([batchId, batchProfiles]) => (
              <Box key={batchId} sx={{ mb: 4 }}>
                <Typography variant="overline" color="text.secondary">
                  Batch — {batchProfiles.length} profile{batchProfiles.length > 1 ? 's' : ''}
                </Typography>
                {batchProfiles.map(profile => (
                  <SubmissionCard
                    key={profile.id}
                    profile={profile}
                    relationships={relationships.filter(
                      r => r.person_a_id === profile.id || r.person_b_id === profile.id
                    )}
                    allProfiles={profiles}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onEdit={setEditingProfile}
                    hasDependents={hasDependents(profile.id)}
                  />
                ))}
              </Box>
            ))
          )}
        </>
      )}

      {!loading && tab === 1 && (
        <>
          {pendingClaims.length === 0 ? (
            <Alert severity="info">No pending claims.</Alert>
          ) : (
            pendingClaims.map(claim => {
              const profile = profiles.find(p => p.id === claim.profile_id);
              return (
                <Box key={claim.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Claim for: {profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Claimant: {claim.claimant_id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submitted {new Date(claim.created_at).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button size="small" color="error" onClick={() => handleDenyClaim(claim.id)}>
                      Deny
                    </Button>
                    <Button size="small" variant="contained" color="success" onClick={() => handleApproveClaim(claim.id)}>
                      Approve
                    </Button>
                  </Box>
                </Box>
              );
            })
          )}
        </>
      )}

      {!loading && tab === 2 && (() => {
        const approvedProfiles = profiles.filter(p => p.status === 'approved');
        const options = approvedProfiles.map(p => ({ id: p.id, label: `${p.first_name} ${p.last_name}` }));
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}>
            <Typography variant="h6">Merge Duplicate Profiles</Typography>
            <Autocomplete
              options={options}
              getOptionLabel={(o) => o.label}
              value={mergePrimary ? { id: mergePrimary.id, label: `${mergePrimary.first_name} ${mergePrimary.last_name}` } : null}
              onChange={(_, v) => setMergePrimary(v ? (approvedProfiles.find(p => p.id === v.id) ?? null) : null)}
              renderInput={(params) => <TextField {...params} label="Primary profile (keep)" size="small" />}
              isOptionEqualToValue={(o, v) => o.id === v.id}
            />
            <Autocomplete
              options={options}
              getOptionLabel={(o) => o.label}
              value={mergeDuplicate ? { id: mergeDuplicate.id, label: `${mergeDuplicate.first_name} ${mergeDuplicate.last_name}` } : null}
              onChange={(_, v) => setMergeDuplicate(v ? (approvedProfiles.find(p => p.id === v.id) ?? null) : null)}
              renderInput={(params) => <TextField {...params} label="Duplicate profile (remove)" size="small" />}
              isOptionEqualToValue={(o, v) => o.id === v.id}
            />
            <Button
              variant="contained"
              color="warning"
              disabled={!mergePrimary || !mergeDuplicate || mergePrimary.id === mergeDuplicate.id}
              onClick={() => {
                if (mergePrimary && mergeDuplicate) {
                  handleMerge(mergePrimary.id, mergeDuplicate.id);
                  setMergePrimary(null);
                  setMergeDuplicate(null);
                }
              }}
            >
              Merge
            </Button>
          </Box>
        );
      })()}

      {editingProfile && (
        <ProfileEditor
          profile={editingProfile}
          open={true}
          onClose={() => setEditingProfile(null)}
          onSaved={fetchData}
        />
      )}
    </Container>
  );
}
