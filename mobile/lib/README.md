# GraphQL Client with Caching

This directory contains a custom GraphQL client implementation with built-in caching support.

## Features

### Caching
- **In-memory cache** with configurable TTL (Time To Live)
- **Cache invalidation** by pattern matching
- **Automatic cache updates** after mutations
- **Multiple fetch policies**: `cache-first`, `network-only`, `cache-and-network`

### Client (`graphql-client.ts`)

#### Methods

**`query<T>(query: string, variables?: any, options?: RequestOptions): Promise<T>`**
- Executes a GraphQL query with caching support
- Options:
  - `skipCache`: Bypass cache and fetch from network
  - `cacheTTL`: Custom cache time-to-live in milliseconds (default: 5 minutes)

**`mutate<T>(mutation: string, variables?: any, invalidatePatterns?: string[]): Promise<T>`**
- Executes a GraphQL mutation
- Automatically invalidates cache entries matching the provided patterns

**`invalidateCache(pattern?: string): void`**
- Invalidates cache entries
- If no pattern provided, clears entire cache
- Pattern matching uses substring search

**`refetchQueries(queries: Array<{query: string, variables?: any}>): Promise<void>`**
- Refetches multiple queries, bypassing cache

### Hooks (`graphql-hooks.ts`)

#### `useQuery<TData, TVariables>(query: string, options?: UseQueryOptions)`

Options:
- `variables`: Query variables
- `skip`: Skip query execution
- `fetchPolicy`: `'cache-first'` | `'network-only'` | `'cache-and-network'`
- `cacheTTL`: Custom cache TTL in milliseconds
- `onCompleted`: Callback on successful query
- `onError`: Callback on error

Returns:
- `loading`: Loading state
- `error`: Error object if any
- `data`: Query result data
- `refetch`: Function to refetch data from network

#### `useMutation<TData, TVariables>(mutation: string, options?: UseMutationOptions)`

Options:
- `onCompleted`: Callback on successful mutation
- `onError`: Callback on error
- `refetchQueries`: Array of queries to refetch after mutation
- `invalidatePatterns`: Cache key patterns to invalidate after mutation

Returns: `[mutate, { loading, error, data }]`

## Usage Examples

### Basic Query with Caching

```typescript
import { useQuery } from '@/lib/graphql-hooks';

const GET_USERS = `
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

function UsersList() {
  const { data, loading, error, refetch } = useQuery(GET_USERS);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {data?.users.map(user => (
        <Text key={user.id}>{user.name}</Text>
      ))}
      <Button onPress={refetch} title="Refresh" />
    </View>
  );
}
```

### Mutation with Cache Invalidation

```typescript
import { useMutation } from '@/lib/graphql-hooks';

const CREATE_USER = `
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

const GET_USERS = `
  query GetUsers {
    users {
      id
      name
    }
  }
`;

function CreateUserForm() {
  const [createUser, { loading }] = useMutation(CREATE_USER, {
    // Option 1: Invalidate cache by pattern
    invalidatePatterns: ['GetUsers'],
    
    // Option 2: Refetch specific queries
    refetchQueries: [{ query: GET_USERS }],
    
    onCompleted: (data) => {
      console.log('User created:', data);
    },
  });

  const handleSubmit = () => {
    createUser({
      name: 'John Doe',
      email: 'john@example.com',
    });
  };

  return <Button onPress={handleSubmit} title="Create User" disabled={loading} />;
}
```

### Custom Fetch Policies

```typescript
// Cache-first (default): Use cache if available, otherwise fetch
const { data } = useQuery(GET_USERS, {
  fetchPolicy: 'cache-first',
});

// Network-only: Always fetch from network, update cache
const { data } = useQuery(GET_USERS, {
  fetchPolicy: 'network-only',
});

// Cache-and-network: Return cached data immediately, then fetch fresh data
const { data } = useQuery(GET_USERS, {
  fetchPolicy: 'cache-and-network',
});
```

### Custom Cache TTL

```typescript
// Cache for 10 minutes
const { data } = useQuery(GET_USERS, {
  cacheTTL: 10 * 60 * 1000,
});
```

### Manual Cache Control

```typescript
import { graphqlClient } from '@/lib/graphql-client';

// Invalidate all cache entries containing "users"
graphqlClient.invalidateCache('users');

// Clear entire cache
graphqlClient.invalidateCache();

// Refetch specific queries
await graphqlClient.refetchQueries([
  { query: GET_USERS },
  { query: GET_USER, variables: { id: '123' } },
]);
```

## Example: Add Driver with Auto-Update

```typescript
const CREATE_CHAUFFEUR = `
  mutation CreateChauffeur($name: String!, $email: String!, ...) {
    createUser(name: $name, email: $email, ...) {
      id
      name
    }
  }
`;

const GET_CHAUFFEURS = `
  query GetChauffeurs {
    users(role: CHAUFFEUR) {
      id
      name
    }
  }
`;

function AddDriverScreen() {
  const [createDriver, { loading }] = useMutation(CREATE_CHAUFFEUR, {
    // Automatically refetch the drivers list after creation
    refetchQueries: [{ query: GET_CHAUFFEURS }],
    
    // Or invalidate cache pattern
    invalidatePatterns: ['GetChauffeurs', 'users'],
    
    onCompleted: () => {
      router.back(); // Navigate back - the list will be updated!
    },
  });

  // ... rest of component
}
```

## Cache Behavior

1. **Query Execution**:
   - First checks cache for valid data (within TTL)
   - If found, returns cached data immediately
   - If not found or expired, fetches from network and caches result

2. **Mutation Execution**:
   - Always executes against network (no cache)
   - After success, invalidates specified cache patterns
   - Refetches specified queries if provided

3. **Cache Invalidation**:
   - Pattern matching uses substring search on cache keys
   - Cache keys format: `<query>:<variables>`
   - Example: Pattern `"users"` matches all queries containing "users"

4. **TTL (Time To Live)**:
   - Default: 5 minutes
   - Configurable per query
   - Expired entries are automatically removed on next access
