import { graphqlClient } from '@/lib/graphql-client';
import { FORGOT_PASSWORD } from '@/lib/graphql-queries';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    setLoading(true);
    try {
      const data = await graphqlClient.mutate(FORGOT_PASSWORD, {
        email,
      });

      if (data?.forgotPassword) {
        Alert.alert(
          'Email envoyé',
          'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
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
          Entrez votre email pour réinitialiser votre mot de passe
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Email
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
            <Mail size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password-phone')}
            className="self-start"
          >
            <Text className="text-blue-600 text-sm font-medium">Se connecter avec le numéro de téléphone</Text>
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
              Envoyer le lien
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
