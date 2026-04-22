import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebaseConfig';
import { ProfileFormData } from '../submission/ProfileForm';
import { RelationshipFormData } from '../submission/RelationshipPicker';
import { RelationshipType } from '../types';

interface PendingSubmission {
  tempId: string;
  profileData: ProfileFormData;
  relationship: RelationshipFormData;
}

export function useSubmission() {
  const [batchId] = useState(() => uuidv4());
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitProfile = async (
    profileData: ProfileFormData,
    relationship: RelationshipFormData,
    isSelf: boolean
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      let photoUrl: string | null = null;
      if (profileData.photo) {
        const ext = profileData.photo.name.split('.').pop();
        const path = `photos/${user.uid}/${uuidv4()}.${ext}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, profileData.photo);
        photoUrl = await getDownloadURL(storageRef);
      }

      const profileRef = await addDoc(collection(db, 'profiles'), {
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        birthYear: profileData.birth_year,
        birthYearApproximate: profileData.birth_year_approximate,
        deathYear: profileData.death_year,
        bio: profileData.bio || null,
        photoUrl,
        createdBy: user.uid,
        submissionBatchId: batchId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (profileData.location || profileData.contact_info) {
        await addDoc(collection(db, 'privateFields'), {
          profileId: profileRef.id,
          location: profileData.location || null,
          contactInfo: profileData.contact_info || null,
        });
      }

      const { personAId, personBId, relType } = resolveRelationship(
        profileRef.id,
        relationship.relatedToId,
        relationship.relationshipLabel
      );

      await addDoc(collection(db, 'relationships'), {
        personAId,
        personBId,
        relationshipType: relType,
        subtype: relationship.subtype,
        startYear: relationship.startYear,
        endYear: relationship.endYear,
        status: 'pending',
        submissionBatchId: batchId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      if (isSelf) {
        await addDoc(collection(db, 'profileClaims'), {
          profileId: profileRef.id,
          claimantId: user.uid,
          status: 'pending',
          createdAt: serverTimestamp(),
          resolvedAt: null,
        });
      }

      setPendingSubmissions(prev => [
        ...prev,
        { tempId: profileRef.id, profileData, relationship },
      ]);

      return profileRef.id;
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    batchId,
    pendingSubmissions,
    submitting,
    error,
    submitProfile,
  };
}

function resolveRelationship(
  newProfileId: string,
  relatedToId: string,
  label: 'child_of' | 'parent_of' | 'spouse_of'
): { personAId: string; personBId: string; relType: RelationshipType } {
  switch (label) {
    case 'child_of':
      return { personAId: relatedToId, personBId: newProfileId, relType: 'parent_child' };
    case 'parent_of':
      return { personAId: newProfileId, personBId: relatedToId, relType: 'parent_child' };
    case 'spouse_of':
      return {
        personAId: newProfileId < relatedToId ? newProfileId : relatedToId,
        personBId: newProfileId < relatedToId ? relatedToId : newProfileId,
        relType: 'spouse',
      };
  }
}
