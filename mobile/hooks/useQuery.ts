import { graphqlClient } from '@/lib/graphql-client';
import { useCallback, useEffect, useState } from 'react';

interface UseQueryResult<TData> {
  loading: boolean;
  error: Error | null;
  data: TData | null;
  refetch: () => Promise<void>;
}

interface UseQueryOptions {
  skip?: boolean;
  onCompleted?: (data: any) => void;
  onError?: (error: Error) => void;
  fetchPolicy?: 'cache-first' | 'network-only' | 'cache-and-network';
  cacheTTL?: number; // Time to live in milliseconds
}

/**
 * Custom hook for GraphQL queries (alternative to Apollo's useQuery)
 * @param query GraphQL query string
 * @param options Query options including variables, skip, fetchPolicy, etc.
 * @returns Query result with loading, error, data, and refetch function
 */
export function useQuery<TData = any, TVariables = any>(
  query: string,
  options?: UseQueryOptions & { variables?: TVariables }
): UseQueryResult<TData> {
  const [loading, setLoading] = useState(!options?.skip);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const fetchData = useCallback(async (skipCache: boolean = false) => {
    if (options?.skip) return;

    setLoading(true);
    setError(null);

    try {
      const fetchPolicy = options?.fetchPolicy || 'cache-first';
      const shouldSkipCache = skipCache || fetchPolicy === 'network-only';
      
      const result = await graphqlClient.query<TData>(
        query, 
        options?.variables as any,
        { 
          skipCache: shouldSkipCache,
          cacheTTL: options?.cacheTTL
        }
      );
      
      setData(result);
      
      if (options?.onCompleted) {
        options.onCompleted(result);
      }

      // For cache-and-network, fetch from network after returning cached data
      if (fetchPolicy === 'cache-and-network' && !skipCache) {
        graphqlClient.query<TData>(
          query,
          options?.variables as any,
          { skipCache: true, cacheTTL: options?.cacheTTL }
        ).then(freshResult => {
          setData(freshResult);
          if (options?.onCompleted) {
            options.onCompleted(freshResult);
          }
        }).catch(() => {
          // Silently fail background refresh
        });
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (options?.onError) {
        options.onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [query, JSON.stringify(options?.variables), options?.skip, options?.fetchPolicy, options?.cacheTTL]);

  const refetch = useCallback(async () => {
    await fetchData(true); // Force network request
  }, [fetchData]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    data,
    refetch,
  };
}
