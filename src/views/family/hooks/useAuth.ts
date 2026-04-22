import { useState, useEffect } from 'react';
import { onAuthStateChanged, sendSignInLinkToEmail, signOut as fbSignOut, User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { AccessState, ProfileClaim } from '../types';

const EMAIL_STORAGE_KEY = 'familyTreeSignInEmail';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [accessState, setAccessState] = useState<AccessState>({ type: 'unauthenticated' });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setAccessState({ type: 'unauthenticated' });
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    const checkAccess = async () => {
      setLoading(true);

      const adminSnap = await getDocs(
        query(collection(db, 'adminUsers'), where('userId', '==', user.uid))
      );
      setIsAdmin(!adminSnap.empty);

      const claimsSnap = await getDocs(
        query(collection(db, 'profileClaims'), where('claimantId', '==', user.uid))
      );

      if (claimsSnap.empty) {
        const profilesSnap = await getDocs(
          query(collection(db, 'profiles'), where('createdBy', '==', user.uid))
        );
        if (!profilesSnap.empty) {
          const statuses = profilesSnap.docs.map(d => d.data().status as string);
          if (statuses.includes('pending')) setAccessState({ type: 'pending' });
          else if (statuses.includes('denied')) setAccessState({ type: 'denied' });
          else setAccessState({ type: 'new_user' });
        } else {
          setAccessState({ type: 'new_user' });
        }
      } else {
        const claims = claimsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProfileClaim[];
        const approvedClaim = claims.find(c => c.status === 'approved');
        const pendingClaim = claims.find(c => c.status === 'pending');
        if (approvedClaim) setAccessState({ type: 'approved', profileId: approvedClaim.profileId });
        else if (pendingClaim) setAccessState({ type: 'pending' });
        else setAccessState({ type: 'denied' });
      }
      setLoading(false);
    };
    checkAccess();
  }, [user]);

  const sendMagicLink = async (email: string) => {
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/family/auth/callback`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => { await fbSignOut(auth); };

  return { user, session: user, accessState, loading, isAdmin, sendMagicLink, signOut };
}
