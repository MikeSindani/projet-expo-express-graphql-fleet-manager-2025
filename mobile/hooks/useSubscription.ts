import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, createClient } from 'graphql-ws';
import { useEffect, useRef, useState } from 'react';

interface SubscriptionOptions<T> {
  query: string;
  variables?: Record<string, any>;
  onData?: (data: T) => void;
  onError?: (error: any) => void;
  onComplete?: () => void;
  enabled?: boolean;
}

interface SubscriptionResult<T> {
  data: T | null;
  error: any | null;
  loading: boolean;
}

/**
 * Custom hook for GraphQL subscriptions using graphql-ws
 * @param options Subscription configuration options
 * @returns Subscription result with data, error, and loading state
 */
export function useSubscription<T = any>(
  options: SubscriptionOptions<T>
): SubscriptionResult<T> {
  const {
    query,
    variables,
    onData,
    onError,
    onComplete,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const wsClient = useRef<Client | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Get WebSocket URL from environment variables
    const wsUrl =
      process.env.EXPO_PUBLIC_GRAPHQL_WS_URL || 'ws://192.168.1.217:4001/graphql';

    // Create WebSocket client if not already created
    if (!wsClient.current) {
      let retryCount = 0;
      const MAX_RETRIES = 5;

      wsClient.current = createClient({
        url: wsUrl,
        connectionParams: async () => {
          const token = await AsyncStorage.getItem('token');
          return token ? { authorization: `Bearer ${token}` } : {};
        },
        shouldRetry: () => {
          const shouldContinue = retryCount < MAX_RETRIES;
          if (!shouldContinue) {
            console.log('🔌 Max retries reached, stopping reconnection attempts');
          }
          retryCount++;
          return shouldContinue;
        },
        retryAttempts: MAX_RETRIES,
        retryWait: (retries) => {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const delay = Math.min(1000 * Math.pow(2, retries), 16000);
          console.log(`🔌 Retry attempt ${retries + 1}/${MAX_RETRIES} in ${delay}ms`);
          return new Promise(resolve => setTimeout(resolve, delay));
        },
        on: {
          connected: () => {
            console.log('🔌 WebSocket connected');
            retryCount = 0; // Reset retry count on successful connection
          },
          closed: () => console.log('🔌 WebSocket closed'),
          error: (err) => console.error('🔌 WebSocket error:', err),
        },
      });
    }

    // Subscribe to the GraphQL subscription
    const unsubscribe = wsClient.current.subscribe(
      {
        query,
        variables,
      },
      {
        next: (result: any) => {
          setLoading(false);
          if (result.data) {
            setData(result.data);
            onData?.(result.data);
          }
          if (result.errors) {
            const err = result.errors[0];
            setError(err);
            onError?.(err);
          }
        },
        error: (err: any) => {
          setLoading(false);
          setError(err);
          onError?.(err);
          console.error('❌ Subscription error:', err);
        },
        complete: () => {
          setLoading(false);
          onComplete?.();
          console.log('✅ Subscription complete');
        },
      }
    );

    unsubscribeRef.current = unsubscribe;

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query, JSON.stringify(variables), enabled, onData, onError, onComplete]);

  // Cleanup WebSocket client on unmount
  useEffect(() => {
    return () => {
      if (wsClient.current) {
        wsClient.current.dispose();
        wsClient.current = null;
      }
    };
  }, []);

  return { data, error, loading };
}
