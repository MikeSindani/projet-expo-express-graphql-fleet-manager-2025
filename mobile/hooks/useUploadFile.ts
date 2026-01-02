import { useCallback, useState } from 'react';
import { graphqlClient } from '@/lib/graphql-client';

interface UseUploadFileResult {
  mutate: (variables: { file: string; [key: string]: any }) => Promise<string>;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  data: string | null;
}

/**
 * Custom hook for GraphQL file uploads
 * @param mutation GraphQL mutation string
 * @returns Hook results (mutate function and status)
 */
export const useUploadFile = (mutation: string): UseUploadFileResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);

  const mutate = useCallback(async (variables: { file: string; [key: string]: any }): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await graphqlClient.upload(mutation, variables);
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.message || 'Erreur lors de l\'upload du fichier';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutation]);

  return { 
    mutate, 
    isLoading, 
    isError: error !== null, 
    error, 
    data 
  };
};
