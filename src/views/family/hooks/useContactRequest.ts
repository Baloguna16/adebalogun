import { useState } from 'react';
import { supabase } from '../supabaseClient';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.functions.invoke('request-info', {
        body: {
          requester_email: user.email,
          profile_id: profileId,
          profile_name: profileName,
          request_type: type,
        },
      });
      if (error) throw error;
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
