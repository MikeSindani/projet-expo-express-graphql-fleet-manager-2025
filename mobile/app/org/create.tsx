import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@/hooks';
import { CREATE_ORGANIZATION } from '@/lib/graphql-queries';
import { useRouter } from 'expo-router';
import { Building2, Users } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateOrganizationScreen() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [createOrg, { loading }] = useMutation(CREATE_ORGANIZATION, {
    onCompleted: (data) => {
      const org = data.createOrganization;
      // Update local user state with new organization
      if (user) {
        updateUser({
            ...user,
            organizationId: org.id,
            organization:{id: org.id, name: org.name},
            role: 'GESTIONNAIRE'
        });
      }
      Alert.alert('Succès', 'Organisation créée avec succès !');
      router.replace('/(tabs)');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    }
  });

  const handleCreateOrg = () => {
    if (!name) {
      Alert.alert('Erreur', 'Veuillez entrer un nom d\'organisation');
      return;
    }
    createOrg({ name, userId: user?.id });
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <View className="w-full max-w-sm mx-auto">
        <View className="items-center mb-8">
          <View className="bg-blue-100 p-4 rounded-full mb-4">
            <Building2 size={48} color="#2563eb" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Configuration Organisation
          </Text>
          <Text className="text-gray-600 text-center">
            Créez votre organisation ou rejoignez-en une existante
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Nom de l'Organisation
            </Text>
            <TextInput
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500"
              placeholder="ex: Acme Logistics"
              value={name}
              onChangeText={setName}
            />
          </View>

          <TouchableOpacity
            onPress={handleCreateOrg}
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-xl items-center mt-6"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                Créer l'Organisation
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500 text-sm">OU</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/org/join')}
            className="w-full bg-gray-100 py-4 rounded-xl items-center flex-row justify-center gap-2"
          >
            <Users size={20} color="#4b5563" />
            <Text className="text-gray-700 font-semibold text-base">
              Rejoindre une Organisation
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
