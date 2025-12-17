import { useAuth } from '@/contexts/AuthContext';
import { graphqlClient } from '@/lib/graphql-client';
import { LOGIN } from '@/lib/graphql-queries';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const data = await graphqlClient.mutate(LOGIN, {
        email,
        password,
      });

      if (data?.login) {
        await signIn(data.login.token, data.login.user);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Connexion échouée');
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
        {/* Header */}

        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Connexion par Email
        </Text>
        <Text className="text-gray-600 mb-8">
          Connectez-vous avec votre adresse email
        </Text>

        {/* Email Input */}
        <View className="mb-4">
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
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 mb-2">
            <Lock size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Votre mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/auth/forgot-password')}
            className="self-end"
          >
            <Text className="text-blue-600 text-sm font-medium">Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className={`rounded-xl p-4 mb-4 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Se connecter
            </Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Pas encore de compte ? </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            disabled={loading}
          >
            <Text className="text-blue-600 font-semibold">S'inscrire</Text>
          </TouchableOpacity>
        </View>

        {/* Phone Login Link */}
        <View className="mt-6 pt-6 border-t border-gray-200">
          <TouchableOpacity
            onPress={() => router.push('/auth/phone-login')}
            disabled={loading}
            className="flex-row justify-center items-center"
          >
            <Text className="text-gray-600">Se connecter avec un numéro de téléphone</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
