import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';

interface UseFetchOptions {
  skip?: boolean;
  refetchInterval?: number;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user for authentication
      const user = getCurrentUser();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if user is logged in
      if (user) {
        headers['Authorization'] = `Bearer token_${user.id}`;
      }
      
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.skip) return;

    fetchData();

    if (options.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [url, options.skip, options.refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}
