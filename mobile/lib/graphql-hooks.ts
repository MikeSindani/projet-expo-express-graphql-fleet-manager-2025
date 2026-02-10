import { UseMutationOptions, UseQueryOptions, useMutation as useTanStackMutation, useQuery as useTanStackQuery } from '@tanstack/react-query';
import { graphqlClient } from './graphql-client';
export { useSubscription } from '../hooks/useSubscription';

/**
 * Custom hook for GraphQL queries using TanStack Query
 * Adapts to Apollo Client-like API
 */
export function useQuery<TData = any, TError = any>(
  query: string,
  // Apollo useQuery signature: (query, options) where options has variables
  optionsOrVariables?: Record<string, any> | (Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & { skip?: boolean, variables?: Record<string, any> }),
  legacyOptions?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  // Handle both signatures: useQuery(query, { variables, ... }) and useQuery(query, variables, options)
  // The original implementation had: useQuery(query, variables, options)
  // But Apollo is useQuery(query, options)
  
  // Let's support the signature used in index.tsx: useQuery(GET_USER_WITH_ORG, { variables: ..., skip: ... })
  // So the second argument is options.
  
  let variables: Record<string, any> | undefined;
  let options: any = {};
  
  if (optionsOrVariables && 'variables' in optionsOrVariables && !legacyOptions) {
     // Usage: useQuery(query, { variables: {...}, ... })
     variables = optionsOrVariables.variables;
     options = optionsOrVariables;
  } else {
     // Usage: useQuery(query, variables, options) - keeping backward comp if any
     variables = optionsOrVariables as Record<string, any>;
     options = legacyOptions || {};
  }
  
  const { skip, ...queryOptions } = options || {};
  
  const result = useTanStackQuery<TData, TError>({
    queryKey: [query, variables],
    queryFn: () => graphqlClient.request<TData>(query, variables),
    enabled: !skip,
    ...queryOptions,
  });

  return {
    ...result,
    loading: result.isLoading, // Map isLoading to loading for Apollo compatibility
  };
}

/**
 * Custom hook for GraphQL mutations using TanStack Query
 * Adapts to Apollo Client-like API (returns tuple)
 */
export function useMutation<TData = any, TError = any, TVariables = any>(
  mutation: string,
  options?: UseMutationOptions<TData, TError, TVariables> & { onCompleted?: (data: TData) => void }
) {
  const { onCompleted, ...mutationOptions } = options || {};

  const result = useTanStackMutation<TData, TError, TVariables>({
    mutationFn: (args: any) => {
        // Handle Apollo-style { variables: { ... } } invocation
        const vars = args?.variables ? args.variables : args;
        return graphqlClient.request<TData>(mutation, vars);
    },
    onSuccess: (data) => {
        if (onCompleted) {
            onCompleted(data);
        }
        if (options?.onSuccess) {
            // @ts-ignore
            options.onSuccess(data, undefined, undefined);
        }
    },
    ...mutationOptions,
  });

  // Return tuple [mutateFunction, resultObj] to match Apollo Client
  // using mutateAsync to allow await if needed (Apollo mutate returns Promise)
  return [
    result.mutateAsync, 
    { 
        ...result, 
        loading: result.isPending 
    }
  ] as const;
}
