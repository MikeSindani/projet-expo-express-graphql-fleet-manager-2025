import { graphqlClient } from '@/lib/graphql-client';
import { FORGOT_PASSWORD_WITH_PHONE } from '@/lib/graphql-queries';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordPhoneScreen() {
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!telephone) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      const data = await graphqlClient.mutate(FORGOT_PASSWORD_WITH_PHONE, {
        telephone,
      });

      if (data?.forgotPasswordWithPhone) {
        Alert.alert(
          'SMS envoyé',
          'Si ce numéro est enregistré, vous recevrez un code de réinitialisation.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center h-12">
        <Text className="text-3xl font-bold text-blue-900">Fleet Manager</Text>
      </View>
      <View className="p-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 flex-row items-center"
        >
          <ArrowLeft size={24} color="#1f2937" />
          <Text className="ml-2 text-lg font-medium text-gray-900">Retour</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Mot de passe oublié
        </Text>
        <Text className="text-gray-600 mb-8">
          Entrez votre numéro de téléphone pour réinitialiser votre mot de passe
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
            <Phone size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="+243 123 456 789"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password')}
            className="self-end"
          >
            <Text className="text-blue-600 text-sm font-medium">Se connecter avec l'email ?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`rounded-xl p-4 mb-4 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Envoyer le code
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
