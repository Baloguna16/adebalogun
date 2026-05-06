import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc,
  serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { auth, db, storage } from '../firebaseConfig';
import { Profile, ProfileEdit, ProfileClaim } from '../types';

export function useProfileEdit(profileId: string | null) {
  const [pendingEdit, setPendingEdit] = useState<ProfileEdit | null>(null);
  const [loading, setLoading] = useState(false);

  const checkPendingEdit = useCallback(async () => {
    if (!profileId || !auth.currentUser) return;
    const snap = await getDocs(
      query(
        collection(db, 'profileEdits'),
        where('profileId', '==', profileId),
        where('submittedBy', '==', auth.currentUser.uid),
        where('status', '==', 'pending')
      )
    );
    setPendingEdit(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as ProfileEdit);
  }, [profileId]);

  useEffect(() => {
    checkPendingEdit();
  }, [checkPendingEdit]);

  const submitEdit = async (
    profile: Profile,
    formData: {
      firstName: string;
      lastName: string;
      birthYear: number | null;
      birthYearApproximate: boolean;
      deathYear: number | null;
      bio: string | null;
      photo: File | null;
      location: string;
      contactInfo: string;
    },
    currentPrivateFields: { location: string | null; contactInfo: string | null } | null
  ) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      let photoUrl: string | undefined;
      if (formData.photo) {
        const ext = formData.photo.name.split('.').pop();
        const path = `photos/${user.uid}/${uuidv4()}.${ext}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, formData.photo);
        photoUrl = await getDownloadURL(storageRef);
      }

      const changes: Record<string, any> = {};
      if (formData.firstName !== profile.firstName) changes.firstName = formData.firstName;
      if (formData.lastName !== profile.lastName) changes.lastName = formData.lastName;
      if (formData.birthYear !== profile.birthYear) changes.birthYear = formData.birthYear;
      if (formData.birthYearApproximate !== profile.birthYearApproximate) changes.birthYearApproximate = formData.birthYearApproximate;
      if (formData.deathYear !== profile.deathYear) changes.deathYear = formData.deathYear;
      if ((formData.bio || null) !== profile.bio) changes.bio = formData.bio || null;
      if (photoUrl !== undefined) changes.photoUrl = photoUrl;

      const currentLoc = currentPrivateFields?.location ?? '';
      const currentContact = currentPrivateFields?.contactInfo ?? '';
      let privateFieldChanges: { location?: string | null; contactInfo?: string | null } | null = null;
      if (formData.location !== currentLoc || formData.contactInfo !== currentContact) {
        privateFieldChanges = {};
        if (formData.location !== currentLoc) privateFieldChanges.location = formData.location || null;
        if (formData.contactInfo !== currentContact) privateFieldChanges.contactInfo = formData.contactInfo || null;
      }

      if (Object.keys(changes).length === 0 && !privateFieldChanges) {
        setLoading(false);
        return false;
      }

      await addDoc(collection(db, 'profileEdits'), {
        profileId: profile.id,
        submittedBy: user.uid,
        changes,
        privateFieldChanges,
        status: 'pending',
        createdAt: serverTimestamp(),
        resolvedAt: null,
      });

      await checkPendingEdit();
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return { pendingEdit, loading, submitEdit, checkPendingEdit };
}

export async function canEditProfile(
  profileId: string,
  uid: string
): Promise<boolean> {
  const profileSnap = await getDoc(doc(db, 'profiles', profileId));
  if (!profileSnap.exists()) return false;
  const profile = profileSnap.data() as Profile;
  if (profile.status !== 'approved') return false;

  const claimsSnap = await getDocs(
    query(collection(db, 'profileClaims'), where('profileId', '==', profileId), where('status', '==', 'approved'))
  );

  if (!claimsSnap.empty) {
    return claimsSnap.docs.some(d => (d.data() as ProfileClaim).claimantId === uid);
  }

  return profile.createdBy === uid;
}

export async function approveEdit(editId: string, edit: ProfileEdit) {
  const batch = writeBatch(db);

  if (Object.keys(edit.changes).length > 0) {
    batch.update(doc(db, 'profiles', edit.profileId), {
      ...edit.changes,
      updatedAt: serverTimestamp(),
    });
  }

  if (edit.privateFieldChanges) {
    const pfSnap = await getDocs(
      query(collection(db, 'privateFields'), where('profileId', '==', edit.profileId))
    );
    if (!pfSnap.empty) {
      batch.update(pfSnap.docs[0].ref, edit.privateFieldChanges);
    }
  }

  batch.update(doc(db, 'profileEdits', editId), {
    status: 'approved',
    resolvedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function denyEdit(editId: string) {
  await updateDoc(doc(db, 'profileEdits', editId), {
    status: 'denied',
    resolvedAt: serverTimestamp(),
  });
}
