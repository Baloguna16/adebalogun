export type ProfileStatus = 'pending' | 'approved' | 'denied';
export type ClaimStatus = 'pending' | 'approved' | 'denied';
export type RelationshipType = 'parent_child' | 'spouse';
export type RelationshipSubtype = 'biological' | 'adoptive' | 'step' | 'foster';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: number | null;
  birth_year_approximate: boolean;
  death_year: number | null;
  bio: string | null;
  photo_url: string | null;
  created_by: string;
  submission_batch_id: string;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export interface ProfileClaim {
  id: string;
  profile_id: string;
  claimant_id: string;
  status: ClaimStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface Relationship {
  id: string;
  person_a_id: string;
  person_b_id: string;
  relationship_type: RelationshipType;
  subtype: RelationshipSubtype | null;
  start_year: number | null;
  end_year: number | null;
  status: ProfileStatus;
  submission_batch_id: string;
  created_by: string;
  created_at: string;
}

export interface PrivateFields {
  profile_id: string;
  location: string | null;
  contact_info: string | null;
}

export interface ProfileWithClaim extends Profile {
  claim?: ProfileClaim;
}

export type AccessState =
  | { type: 'unauthenticated' }
  | { type: 'new_user' }
  | { type: 'pending' }
  | { type: 'approved'; profileId: string }
  | { type: 'denied' };
