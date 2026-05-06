import { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Button, Alert, CircularProgress, Autocomplete, TextField,
} from '@mui/material';
import {
  collection, getDocs, doc, updateDoc, query, where, orderBy, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { Profile, Relationship, ProfileClaim, ProfileEdit } from '../types';
import { approveEdit, denyEdit } from '../hooks/useProfileEdit';
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
  const [edits, setEdits] = useState<ProfileEdit[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [profilesSnap, relsSnap, claimsSnap, editsSnap] = await Promise.all([
      getDocs(query(collection(db, 'profiles'), orderBy('createdAt', 'desc'))),
      getDocs(collection(db, 'relationships')),
      getDocs(query(collection(db, 'profileClaims'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'profileEdits'), orderBy('createdAt', 'desc'))),
    ]);
    setProfiles(profilesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Profile[]);
    setRelationships(relsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Relationship[]);
    setClaims(claimsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProfileClaim[]);
    setEdits(editsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProfileEdit[]);
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
  const pendingEdits = edits.filter(e => e.status === 'pending');

  const batchGroups = new Map<string, Profile[]>();
  for (const p of pendingProfiles) {
    const batch = batchGroups.get(p.submissionBatchId) || [];
    batch.push(p);
    batchGroups.set(p.submissionBatchId, batch);
  }

  const handleApprove = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    await updateDoc(doc(db, 'profiles', profileId), { status: 'approved', updatedAt: serverTimestamp() });

    const relatedRels = relationships.filter(
      r => r.status === 'pending' && (r.personAId === profileId || r.personBId === profileId)
    );
    for (const rel of relatedRels) {
      await updateDoc(doc(db, 'relationships', rel.id), { status: 'approved' });
    }

    const pendingClaimForProfile = claims.find(
      c => c.profileId === profileId && c.status === 'pending'
    );
    if (pendingClaimForProfile && profile.deathYear == null) {
      await updateDoc(doc(db, 'profileClaims', pendingClaimForProfile.id), {
        status: 'approved',
        resolvedAt: serverTimestamp(),
      });
    }

    fetchData();
  };

  const handleDeny = async (profileId: string) => {
    await updateDoc(doc(db, 'profiles', profileId), { status: 'denied', updatedAt: serverTimestamp() });

    const relatedRels = relationships.filter(
      r => r.status === 'pending' && (r.personAId === profileId || r.personBId === profileId)
    );
    for (const rel of relatedRels) {
      await updateDoc(doc(db, 'relationships', rel.id), { status: 'denied' });
    }

    fetchData();
  };

  const handleApproveClaim = async (claimId: string) => {
    await updateDoc(doc(db, 'profileClaims', claimId), {
      status: 'approved',
      resolvedAt: serverTimestamp(),
    });
    fetchData();
  };

  const handleDenyClaim = async (claimId: string) => {
    await updateDoc(doc(db, 'profileClaims', claimId), {
      status: 'denied',
      resolvedAt: serverTimestamp(),
    });
    fetchData();
  };

  const handleApproveEdit = async (edit: ProfileEdit) => {
    await approveEdit(edit.id, edit);
    fetchData();
  };

  const handleDenyEdit = async (editId: string) => {
    await denyEdit(editId);
    fetchData();
  };

  const handleMerge = async (primaryId: string, duplicateId: string) => {
    const batch = writeBatch(db);

    const relsWithDuplicate = relationships.filter(
      r => r.personAId === duplicateId || r.personBId === duplicateId
    );
    for (const rel of relsWithDuplicate) {
      const updates: Record<string, string> = {};
      if (rel.personAId === duplicateId) updates.personAId = primaryId;
      if (rel.personBId === duplicateId) updates.personBId = primaryId;
      batch.update(doc(db, 'relationships', rel.id), updates);
    }

    const dupClaims = claims.filter(c => c.profileId === duplicateId);
    for (const claim of dupClaims) {
      batch.update(doc(db, 'profileClaims', claim.id), {
        status: 'denied',
        resolvedAt: serverTimestamp(),
      });
    }

    batch.update(doc(db, 'profiles', duplicateId), { status: 'denied', updatedAt: serverTimestamp() });

    await batch.commit();
    fetchData();
  };

  const handleRemoveProfile = async (profileId: string) => {
    await updateDoc(doc(db, 'profiles', profileId), { status: 'denied', updatedAt: serverTimestamp() });
    const relatedRels = relationships.filter(
      r => r.personAId === profileId || r.personBId === profileId
    );
    for (const rel of relatedRels) {
      await updateDoc(doc(db, 'relationships', rel.id), { status: 'denied' });
    }
    fetchData();
  };

  const hasDependents = (profileId: string) => {
    return relationships.some(
      r => r.status === 'pending' &&
        (r.personAId === profileId || r.personBId === profileId) &&
        r.personAId !== r.personBId
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
        <Tab label={`Edits (${pendingEdits.length})`} />
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
                      r => r.personAId === profile.id || r.personBId === profile.id
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
              const profile = profiles.find(p => p.id === claim.profileId);
              return (
                <Box key={claim.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Claim for: {profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Claimant: {claim.claimantId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submitted {(claim.createdAt as any)?.toDate?.()?.toLocaleDateString?.() ?? ''}
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

      {!loading && tab === 2 && (
        <>
          {pendingEdits.length === 0 ? (
            <Alert severity="info">No pending edits.</Alert>
          ) : (
            pendingEdits.map(edit => {
              const profile = profiles.find(p => p.id === edit.profileId);
              return (
                <Box key={edit.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Edit for: {profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Submitted by: {edit.submittedBy} — {(edit.createdAt as any)?.toDate?.()?.toLocaleDateString?.() ?? ''}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(edit.changes).map(([field, newValue]) => {
                      const oldValue = profile ? (profile as any)[field] : undefined;
                      return (
                        <Box key={field} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>
                            {field}:
                          </Typography>
                          <Typography variant="body2" color="error.main" sx={{ textDecoration: 'line-through' }}>
                            {String(oldValue ?? '(empty)')}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            {String(newValue ?? '(empty)')}
                          </Typography>
                        </Box>
                      );
                    })}
                    {edit.privateFieldChanges && Object.entries(edit.privateFieldChanges).map(([field, newValue]) => (
                      <Box key={field} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>
                          {field} (private):
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          {String(newValue ?? '(empty)')}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button size="small" color="error" onClick={() => handleDenyEdit(edit.id)}>
                      Deny
                    </Button>
                    <Button size="small" variant="contained" color="success" onClick={() => handleApproveEdit(edit)}>
                      Approve
                    </Button>
                  </Box>
                </Box>
              );
            })
          )}
        </>
      )}

      {!loading && tab === 3 && (() => {
        const approvedProfiles = profiles.filter(p => p.status === 'approved');
        const options = approvedProfiles.map(p => ({ id: p.id, label: `${p.firstName} ${p.lastName}` }));
        return (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}>
              <Typography variant="h6">Merge Duplicate Profiles</Typography>
              <Autocomplete
                options={options}
                getOptionLabel={(o) => o.label}
                value={mergePrimary ? { id: mergePrimary.id, label: `${mergePrimary.firstName} ${mergePrimary.lastName}` } : null}
                onChange={(_, v) => setMergePrimary(v ? (approvedProfiles.find(p => p.id === v.id) ?? null) : null)}
                renderInput={(params) => <TextField {...params} label="Primary profile (keep)" size="small" />}
                isOptionEqualToValue={(o, v) => o.id === v.id}
              />
              <Autocomplete
                options={options}
                getOptionLabel={(o) => o.label}
                value={mergeDuplicate ? { id: mergeDuplicate.id, label: `${mergeDuplicate.firstName} ${mergeDuplicate.lastName}` } : null}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480, mt: 4 }}>
              <Typography variant="h6">Remove Profile</Typography>
              <Autocomplete
                options={approvedProfiles.map(p => ({ id: p.id, label: `${p.firstName} ${p.lastName}` }))}
                getOptionLabel={(o) => o.label}
                renderInput={(params) => <TextField {...params} label="Profile to remove" size="small" />}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                onChange={(_, v) => {
                  if (v) {
                    const confirmed = window.confirm(`Remove ${v.label} from the family tree? This will hide them and their relationships.`);
                    if (confirmed) handleRemoveProfile(v.id);
                  }
                }}
              />
            </Box>
          </>
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
