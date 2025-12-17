import { useAuth } from '@/contexts/AuthContext';
import { graphqlClient } from '@/lib/graphql-client';
import { REGISTER } from '@/lib/graphql-queries';
import { useRouter } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'GESTIONNAIRE' | 'CHAUFFEUR'>('GESTIONNAIRE');
  const [organizationId, setOrganizationId] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const data = await graphqlClient.mutate(REGISTER, {
        name,
        email,
        password,
        role,
      });

       if (data?.register) {
        await signIn(data.register.token, data.register.user);
      }

      if(role === 'CHAUFFEUR'){
        router.replace('/org/join');
      } else {
        router.replace('/org/create');
      }
     
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-1 items-center justify-center h-12">
          <Text className="text-3xl font-bold text-blue-900">Fleet Manager</Text>
        </View>
        <View className="p-6">
          {/* Header */}
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Inscription par Email
          </Text>
          <Text className="text-gray-600 mb-8">
            Créez votre compte avec votre adresse email
          </Text>

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
              <User size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="Votre nom complet"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>
          </View>

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

          {/* Role Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Rôle
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setRole('GESTIONNAIRE')}
                disabled={loading}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  role === 'GESTIONNAIRE'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    role === 'GESTIONNAIRE' ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  Gestionnaire
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole('CHAUFFEUR')}
                disabled={loading}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  role === 'CHAUFFEUR'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    role === 'CHAUFFEUR' ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  Chauffeur
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
              <Lock size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="Minimum 6 caractères"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
              <Lock size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            className={`rounded-xl p-4 mb-4 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                S'inscrire
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600">Déjà un compte ? </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              disabled={loading}
            >
              <Text className="text-blue-600 font-semibold">Se connecter</Text>
            </TouchableOpacity>
          </View>

          {/* Phone Register Link */}
          <View className="mt-6 pt-6 border-t border-gray-200 mb-6">
            <TouchableOpacity
              onPress={() => router.push('/auth/phone-register')}
              disabled={loading}
              className="flex-row justify-center items-center"
            >
              <Text className="text-gray-600">S'inscrire avec un numéro de téléphone</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
