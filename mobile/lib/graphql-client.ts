import { GRAPHQL_URL } from '@/config/graphql-url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

//const API_URL = process.env.EXPO_PUBLIC_GRAPHQL_HTTP_URL || 'http://192.168.1.217:4001/graphql';

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; extensions?: any }>;
}

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}

interface RequestOptions {
  skipCache?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
}

interface HyperLinkOptions {
  baseUrl: string;
}

/**
 * Custom GraphQL client using fetch with caching support
 * Lighter alternative to Apollo Client
 */
class GraphQLClient {
  private baseUrl: string;
  private cache: Map<string, CacheEntry> = new Map();
  private defaultCacheTTL: number = 5 * 60 * 1000; // 5 minutes default

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  HyperLink(options:HyperLinkOptions){
     this.baseUrl = options.baseUrl;
  }

  /**
   * Generate a cache key from query and variables
   */
  private getCacheKey(query: string, variables?: Record<string, any>): string {
    const normalizedQuery = query.replace(/\s+/g, ' ').trim();
    const variablesKey = variables ? JSON.stringify(variables) : '';
    return `${normalizedQuery}:${variablesKey}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(entry: CacheEntry, ttl: number): boolean {
    return Date.now() - entry.timestamp < ttl;
  }

  /**
   * Get cached data if available and valid
   */
  private getCachedData<T>(
    query: string,
    variables?: Record<string, any>,
    ttl: number = this.defaultCacheTTL
  ): T | null {
    const key = this.getCacheKey(query, variables);
    const entry = this.cache.get(key);

    if (entry && this.isCacheValid(entry, ttl)) {
      console.log('📦 Cache hit for:', query.substring(0, 50) + '...');
      return entry.data as T;
    }

    if (entry) {
      console.log('⏰ Cache expired for:', query.substring(0, 50) + '...');
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Store data in cache
   */
  private setCachedData<T>(
    query: string,
    variables: Record<string, any> | undefined,
    data: T
  ): void {
    const key = this.getCacheKey(query, variables);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.log('💾 Cached data for:', query.substring(0, 50) + '...');
  }

  /**
   * Invalidate cache entries
   * @param pattern - Optional pattern to match cache keys (substring match)
   */
  invalidateCache(pattern?: string): void {
    if (!pattern) {
      console.log('🗑️ Clearing entire cache');
      this.cache.clear();
      return;
    }

    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`);
  }

  /**
   * Execute a GraphQL query or mutation
   */
  async request<T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: RequestOptions
  ): Promise<T> {
    const token = await AsyncStorage.getItem('token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const body: GraphQLRequest = {
      query,
      variables,
    };

    console.log('📤 GraphQL Request:', { query: query.substring(0, 100) + '...', variables });

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();
      console.log('📥 Response data:', result);

      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors[0].message;
        console.error('❌ GraphQL errors:', result.errors);
        throw new Error(errorMessage);
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL server');
      }

      return result.data;
    } catch (error: any) {
      console.error('❌ GraphQL request failed:', error);
      throw error;
    }
  }

  /**
   * Execute a GraphQL mutation
   * @param invalidatePatterns - Cache key patterns to invalidate after successful mutation
   */
  async mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>,
    invalidatePatterns?: string[]
  ): Promise<T> {
    const result = await this.request<T>(mutation, variables, { skipCache: true });
    
    // Invalidate related cache entries after successful mutation
    if (invalidatePatterns && invalidatePatterns.length > 0) {
      invalidatePatterns.forEach(pattern => this.invalidateCache(pattern));
    }
    
    return result;
  }

  /**
   * Execute a GraphQL query with caching
   */
  async query<T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: RequestOptions
  ): Promise<T> {
    // Check cache first unless skipCache is true
    if (!options?.skipCache) {
      const cachedData = this.getCachedData<T>(query, variables, options?.cacheTTL);
      if (cachedData !== null) {
        return cachedData;
      }
    }

    // Fetch from network
    const data = await this.request<T>(query, variables, options);
    
    // Cache the result
    if (!options?.skipCache) {
      this.setCachedData(query, variables, data);
    }
    
    return data;
  }

  /**
   * Refetch specific queries (useful after mutations)
   */
  async refetchQueries(queries: Array<{ query: string; variables?: Record<string, any> }>): Promise<void> {
    console.log(`🔄 Refetching ${queries.length} queries...`);
    
    await Promise.all(
      queries.map(({ query, variables }) => 
        this.query(query, variables, { skipCache: true })
      )
    );
  }

  /**
   * Upload a file to the GraphQL server
   */
  async upload(query: string, variables: Record<string, any>): Promise<string> {
    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();

    const operations = {
      query,
      variables: {
        ...variables,
        file: null,
      },
    };
    formData.append('operations', JSON.stringify(operations));

    const map = {
      '0': ['variables.file'],
    };
    formData.append('map', JSON.stringify(map));

    const uri = variables.file;
    if (!uri) throw new Error('File URI is required in variables.file');

    const filename = uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const file = {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: filename,
      type,
    } as any;

    formData.append('0', file);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      // Automatically find the first field in data as the result
      if (!result.data) {
        throw new Error('Upload failed: No data returned');
      }

      const keys = Object.keys(result.data);
      return result.data[keys[0]];
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const graphqlClient = new GraphQLClient(GRAPHQL_URL);

// Export the class for custom instances
export { GraphQLClient };

