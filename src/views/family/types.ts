export type ProfileStatus = 'pending' | 'approved' | 'denied';
export type ClaimStatus = 'pending' | 'approved' | 'denied';
export type RelationshipType = 'parent_child' | 'spouse';
export type RelationshipSubtype = 'biological' | 'adoptive' | 'step' | 'foster';

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  birthYear: number | null;
  birthYearApproximate: boolean;
  deathYear: number | null;
  bio: string | null;
  photoUrl: string | null;
  createdBy: string;
  submissionBatchId: string;
  status: ProfileStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileClaim {
  id: string;
  profileId: string;
  claimantId: string;
  status: ClaimStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface Relationship {
  id: string;
  personAId: string;
  personBId: string;
  relationshipType: RelationshipType;
  subtype: RelationshipSubtype | null;
  startYear: number | null;
  endYear: number | null;
  status: ProfileStatus;
  submissionBatchId: string;
  createdBy: string;
  createdAt: string;
}

export interface PrivateFields {
  profileId: string;
  location: string | null;
  contactInfo: string | null;
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
