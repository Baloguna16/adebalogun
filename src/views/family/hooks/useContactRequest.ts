import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export function useContactRequest() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const requestInfo = async (
    profileId: string,
    profileName: string,
    type: 'location' | 'contact'
  ) => {
    setSending(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      await addDoc(collection(db, 'contactRequests'), {
        requesterEmail: user.email,
        requesterUid: user.uid,
        profileId,
        profileName,
        requestType: type,
        createdAt: serverTimestamp(),
      });
      setSent(prev => {
        const next = new Set(Array.from(prev));
        next.add(`${profileId}-${type}`);
        return next;
      });
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setSending(false);
    }
  };

  const hasSent = (profileId: string, type: 'location' | 'contact') =>
    sent.has(`${profileId}-${type}`);

  return { requestInfo, sending, hasSent };
}
