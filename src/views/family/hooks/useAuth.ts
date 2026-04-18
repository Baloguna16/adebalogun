import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { AccessState, ProfileClaim } from '../types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [accessState, setAccessState] = useState<AccessState>({ type: 'unauthenticated' });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAccessState({ type: 'unauthenticated' });
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    const checkAccess = async () => {
      setLoading(true);
      const { data: adminRow } = await supabase
        .from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle();
      setIsAdmin(!!adminRow);
      const { data: claims } = await supabase
        .from('profile_claims').select('*').eq('claimant_id', session.user.id);
      if (!claims || claims.length === 0) {
        const { data: ownProfiles } = await supabase
          .from('profiles').select('status').eq('created_by', session.user.id);
        if (ownProfiles && ownProfiles.length > 0) {
          const hasPending = ownProfiles.some(p => p.status === 'pending');
          const hasDenied = ownProfiles.some(p => p.status === 'denied');
          if (hasPending) setAccessState({ type: 'pending' });
          else if (hasDenied) setAccessState({ type: 'denied' });
          else setAccessState({ type: 'new_user' });
        } else {
          setAccessState({ type: 'new_user' });
        }
      } else {
        const approvedClaim = (claims as ProfileClaim[]).find(c => c.status === 'approved');
        const pendingClaim = (claims as ProfileClaim[]).find(c => c.status === 'pending');
        if (approvedClaim) setAccessState({ type: 'approved', profileId: approvedClaim.profile_id });
        else if (pendingClaim) setAccessState({ type: 'pending' });
        else setAccessState({ type: 'denied' });
      }
      setLoading(false);
    };
    checkAccess();
  }, [session]);

  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/family/auth/callback` },
    });
    return { error };
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return { session, accessState, loading, isAdmin, sendMagicLink, signOut };
}
