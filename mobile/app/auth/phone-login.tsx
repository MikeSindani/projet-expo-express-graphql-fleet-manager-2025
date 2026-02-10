import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { graphqlClient } from '@/lib/graphql-client';
import { LOGIN_WITH_PHONE } from '@/lib/graphql-queries';
import { Href, useRouter } from 'expo-router';
import { ArrowLeft, Lock, Phone, Truck } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PhoneLoginScreen() {
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const handleLogin = async () => {
    if (!telephone || !password) {
      if (isWeb) alert('Veuillez remplir tous les champs');
      else Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const data = await graphqlClient.mutate(LOGIN_WITH_PHONE, {
        telephone,
        password,
      });

      if (data?.loginWithPhone) {
        await signIn(data.loginWithPhone.token, data.loginWithPhone.user);
      }
    } catch (error: any) {
      if (isWeb) alert(error.message || 'La connexion a échoué');
      else Alert.alert('Erreur', error.message || 'La connexion a échoué');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 items-center justify-center p-6">
          <View className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[40px] p-8 lg:p-12 shadow-xl border border-gray-100 dark:border-gray-800">
            
            {/* Header */}
            <View className="flex-row items-center justify-between mb-10">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 items-center justify-center"
              >
                <ArrowLeft size={20} color={isDark ? '#f3f4f6' : '#111827'} />
              </TouchableOpacity>
              <View className="w-10 h-10 rounded-xl bg-blue-600 items-center justify-center">
                <Truck size={20} color="white" />
              </View>
            </View>

            <View className="mb-10">
              <Text className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
                Connexion <Text className="text-blue-600">Mobile</Text>
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Connectez-vous avec votre numéro de téléphone et votre mot de passe.
              </Text>
            </View>

            {/* Telephone Input */}
            <View className="mb-6">
              <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3" style={{ opacity: isWeb ? 1 : 0.8 }}>
                Numéro de téléphone
              </Text>
              <View className="flex-row items-center border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-5 py-4">
                <Phone size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                <TextInput
                  className="flex-1 ml-4 text-base text-gray-900 dark:text-gray-100 font-medium"
                  placeholder="08xxxxxxxx"
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                  value={telephone}
                  onChangeText={setTelephone}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-10">
              <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3" style={{ opacity: isWeb ? 1 : 0.8 }}>
                Mot de passe
              </Text>
              <View className="flex-row items-center border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-5 py-4">
                <Lock size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                <TextInput
                  className="flex-1 ml-4 text-base text-gray-900 dark:text-gray-100 font-medium"
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/auth/forgot-password-phone' as Href)}
                className="mt-3 self-end"
              >
                <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`rounded-2xl p-5 shadow-lg shadow-blue-500/30 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-black text-lg">
                  Se connecter
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.replace('/auth/login' as Href)}
              className="mt-8 items-center"
            >
              <Text className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                Utiliser plutôt votre <Text className="text-blue-600 font-bold italic">email</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
