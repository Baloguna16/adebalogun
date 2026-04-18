import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let photoUrl: string | null = null;
      if (profileData.photo) {
        const ext = profileData.photo.name.split('.').pop();
        const path = `${user.id}/${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, profileData.photo);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(path);
        photoUrl = publicUrl;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          birth_year: profileData.birth_year,
          birth_year_approximate: profileData.birth_year_approximate,
          death_year: profileData.death_year,
          bio: profileData.bio || null,
          photo_url: photoUrl,
          created_by: user.id,
          submission_batch_id: batchId,
          status: 'pending',
        })
        .select()
        .single();

      if (profileError) throw profileError;

      if (profileData.location || profileData.contact_info) {
        await supabase.from('private_fields').insert({
          profile_id: profile.id,
          location: profileData.location || null,
          contact_info: profileData.contact_info || null,
        });
      }

      const { personAId, personBId, relType } = resolveRelationship(
        profile.id,
        relationship.relatedToId,
        relationship.relationshipLabel
      );

      await supabase.from('relationships').insert({
        person_a_id: personAId,
        person_b_id: personBId,
        relationship_type: relType,
        subtype: relationship.subtype,
        start_year: relationship.startYear,
        end_year: relationship.endYear,
        status: 'pending',
        submission_batch_id: batchId,
        created_by: user.id,
      });

      if (isSelf) {
        await supabase.from('profile_claims').insert({
          profile_id: profile.id,
          claimant_id: user.id,
          status: 'pending',
        });
      }

      const tempId = profile.id;
      setPendingSubmissions(prev => [
        ...prev,
        { tempId, profileData, relationship },
      ]);

      return profile.id;
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
