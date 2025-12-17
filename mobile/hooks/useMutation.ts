import { graphqlClient } from '@/lib/graphql-client';
import { useCallback, useState } from 'react';

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: Error | null;
  data: TData | null;
}

interface UseMutationOptions<TData> {
  onCompleted?: (data: TData) => void | Promise<void>;
  onError?: (error: Error) => void;
  refetchQueries?: Array<{ query: string; variables?: Record<string, any> }>;
  invalidatePatterns?: string[]; // Cache key patterns to invalidate
}

/**
 * Custom hook for GraphQL mutations (alternative to Apollo's useMutation)
 * @param mutation GraphQL mutation string
 * @param options Mutation options including callbacks and cache invalidation
 * @returns Tuple of [mutate function, mutation result]
 */
export function useMutation<TData = any, TVariables = any>(
  mutation: string,
  options?: UseMutationOptions<TData>
): [
  (variables: TVariables) => Promise<TData>,
  UseMutationResult<TData, TVariables>
] {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setLoading(true);
      setError(null);

      try {
        const result = await graphqlClient.mutate<TData>(
          mutation, 
          variables as any,
          options?.invalidatePatterns
        );
        setData(result);
        
        // Refetch queries if specified
        if (options?.refetchQueries && options.refetchQueries.length > 0) {
          await graphqlClient.refetchQueries(options.refetchQueries);
        }
        
        if (options?.onCompleted) {
          await options.onCompleted(result);
        }
        
        return result;
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        if (options?.onError) {
          options.onError(error);
        }
        
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutation, options]
  );

  return [
    mutate,
    {
      mutate,
      loading,
      error,
      data,
    },
  ];
}
