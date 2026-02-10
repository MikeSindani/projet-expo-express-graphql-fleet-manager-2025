import { GRAPHQL_URL } from '@/config/graphql-url';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_USER, LOGOUT } from '@/lib/graphql-queries';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  telephone: string;
  image?: string;
  role: 'ADMIN' | 'GESTIONNAIRE' | 'CHAUFFEUR';
  organizationId?: string;
  organization?: {id: string, name: string}
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load auth storage', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    
    if (!user && !inAuthGroup && !inOnboarding) {
      // Redirect to the sign-in page.
      router.replace('/onboarding');
    } else if (user && (inAuthGroup || inOnboarding)) {
      // Redirect away from the sign-in page.
      if (!user.organizationId && user.role === 'GESTIONNAIRE') {
         router.replace('/org/create');
      } else {
         router.replace('/(tabs)');
      }
    }
  }, [user, segments, isLoading]);
  
  // ✅ Token validity checker (si le token est vide ou invalide -> logout)
  useEffect(() => {
    if (isLoading) return;

    const verifyTokenValidity = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        
        // 1. Si le token est vide dans le stockage (mais on a un user en state)
        if (!storedToken && user) {
          console.log('🛡️ Token missing in storage, forcing logout...');
          await signOut();
          return;
        }

        // 2. Si on a un user, on vérifie périodiquement sa validité avec le serveur
        if (user && storedToken) {
          try {
            await graphqlClient.request(GET_USER, { id: user.id });
          } catch (error: any) {
            const isAuthError = 
              error.message?.includes('Not authenticated') || 
              error.message?.includes('authorized') ||
              error.message?.includes('expired');

            if (isAuthError) {
              console.log('🛡️ Session invalid or expired on server, forcing logout...');
              await signOut();
            }
          }
        }
      } catch (e) {
        console.error('Error during token verification:', e);
      }
    };

    // Vérifier au montage et lors d'un changement d'utilisateur
    verifyTokenValidity();

    // Vérifier périodiquement toutes les 2 minutes
    const interval = setInterval(verifyTokenValidity, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, isLoading]);

  const signIn = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  };

  const signOut = async () => {
    try {
      // 1. Capture token before clearing
      const currentToken = token;

      // 2. Clear state immediately for best responsiveness
      setToken(null);
      setUser(null);
      
      // 3. Clear Storage immediately
      const keysToRemove = [
        'token', 
        'user', 
        'fleet_chauffeurs', 
        'fleet_vehicules', 
        'fleet_rapports'
      ];
      await AsyncStorage.multiRemove(keysToRemove);

      // 4. Clear TanStack Query Cache
      const { queryClient } = await import('@/lib/query-client');
      queryClient.clear();

      // 5. Attempt Background Server Logout (Best Effort)
      if (currentToken) {
        // We call fetch directly to avoid the GraphQLClient's automatic header injection
        // that might cause server-side verification logs before the resolver runs.
        console.log('Sending silent logout notification to server...');
        
        fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            query: LOGOUT,
            variables: { token: currentToken }
          })
        })
        .then(async (res) => {
          const result = await res.json();
          console.log('Server logout background response:', result);
        })
        .catch((err) => {
          console.log('Server logout background call failed (expected if offline/expired):', err.message);
        });
      }

    } catch (error) {
      console.error('Critical error during signOut:', error);
    } finally {
      // 6. Final safety: insure everything is null and we are at onboarding
      setToken(null);
      setUser(null);
      await AsyncStorage.multiRemove(['token', 'user']).catch(() => {});
      router.replace('/onboarding');
    }
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
