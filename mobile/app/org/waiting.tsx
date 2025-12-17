import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@/lib/graphql-hooks';
import { GET_USER_WITH_ORG } from '@/lib/graphql-queries';
import { useRouter } from 'expo-router';
import { LogOut, RefreshCw, ShieldAlert } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WaitingScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, loading, refetch } = useQuery(GET_USER_WITH_ORG, {
    variables: { id: user?.id },
    skip: !user?.id,
  });

  const checkStatus = async () => {
    setIsRefreshing(true);
    try {
        const result = await refetch();
        if (result.data?.user?.organizationAccess) {
            Alert.alert('Félicitations', 'Votre accès a été validé !');
            router.replace('/(tabs)');
        } else {
            // Optional: User is still pending
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (data?.user?.organizationAccess) {
        router.replace('/(tabs)');
    }
  }, [data]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-yellow-50 items-center px-6 pt-20">
      <View className="bg-white p-8 rounded-full shadow-sm mb-8">
        <ShieldAlert size={64} color="#eab308" />
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
        Accès en attente
      </Text>
      
      <Text className="text-gray-600 text-center mb-8 leading-6">
        Votre demande d'adhésion à <Text className="font-bold">{data?.user?.organization?.name || "l'organisation"}</Text> est en cours de traitement.
        {"\n\n"}
        Un administrateur doit valider votre compte avant que vous puissiez accéder à l'application.
      </Text>

      <TouchableOpacity
        onPress={checkStatus}
        disabled={loading || isRefreshing}
        className="w-full bg-yellow-500 py-4 rounded-xl flex-row items-center justify-center mb-4"
      >
        {loading || isRefreshing ? (
             <ActivityIndicator color="white" />
        ) : (
            <>
                <RefreshCw size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                    Vérifier le statut
                </Text>
            </>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={handleLogout}
        className="w-full bg-white border border-gray-200 py-4 rounded-xl flex-row items-center justify-center"
      >
        <LogOut size={20} color="#6b7280" />
        <Text className="text-gray-600 font-semibold text-lg ml-2">
            Se déconnecter
        </Text>
      </TouchableOpacity>

      <View className="mt-8 bg-blue-50 p-4 rounded-lg">
          <Text className="text-blue-800 text-xs text-center">
              ID Compte: {user?.id}
          </Text>
      </View>
    </SafeAreaView>
  );
}
