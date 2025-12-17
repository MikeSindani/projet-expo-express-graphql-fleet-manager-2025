import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from 'react-native';

export default function App() {
  const auth = useAuth();
  
  // Safety check - if auth is undefined, show loading
  if (!auth) {
    console.log('⚠️ Auth context is undefined');
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Initialisation...</Text>
      </View>
    );
  }
  
  const { user, isLoading } = auth;

  console.log('🔍 App Index - Auth State:', { user: user?.name, isLoading });

  // Show loading screen while checking authentication
  if (isLoading) {
    console.log('⏳ Showing loading screen');
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  // If user is authenticated
  if (user) {
    console.log('✅ User authenticated, redirecting to tabs');
    // If user is GESTIONNAIRE without organization, redirect to create org
    if (user.role === 'GESTIONNAIRE' && !user.organizationId) {
      return <Redirect href="/org/create" />;
    }
    // Otherwise, redirect to main app
    return <Redirect href="/(tabs)" />;
  }

  // If not authenticated, redirect to onboarding
  console.log('❌ No user, redirecting to onboarding');
  return <Redirect href="/onboarding" />;
}