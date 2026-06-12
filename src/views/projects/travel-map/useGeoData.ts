import { useCallback, useEffect, useState } from 'react';

export interface GeoData {
  topology: unknown | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

export const useGeoData = (url: string): GeoData => {
  const [topology, setTopology] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTopology(null);
    setLoading(true);
    setError(false);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTopology(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url, attempt]);

  return { topology, loading, error, retry };
};
