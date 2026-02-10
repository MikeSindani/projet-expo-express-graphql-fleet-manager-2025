import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { graphqlClient } from '@/lib/graphql-client';
import { REGISTER_WITH_PHONE } from '@/lib/graphql-queries';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, Phone, Truck, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PhoneRegisterScreen() {
  const [name, setName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'GESTIONNAIRE' | 'CHAUFFEUR'>('GESTIONNAIRE');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const handleRegister = async () => {
    if (!name || !telephone || !password || !confirmPassword) {
      if (isWeb) alert('Veuillez remplir tous les champs');
      else Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      if (isWeb) alert('Les mots de passe ne correspondent pas');
      else Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      if (isWeb) alert('Le mot de passe doit contenir au moins 6 caractères');
      else Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const data = await graphqlClient.mutate(REGISTER_WITH_PHONE, {
        name,
        telephone,
        password,
        role,
      });

      if (data?.registerWithPhone) {
        await signIn(data.registerWithPhone.token, data.registerWithPhone.user);
        if(role === 'CHAUFFEUR'){
          router.replace('/org/join');    
        } else {
          router.replace('/org/create');
        }
      }
    } catch (error: any) {
      if (isWeb) alert(error.message || 'Inscription échouée');
      else Alert.alert('Erreur', error.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="flex-1 items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
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

              <View className="mb-8">
                <Text className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
                  Inscription <Text className="text-blue-600">Mobile</Text>
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Créez votre compte rapidement avec votre numéro.
                </Text>
              </View>

              {/* Name Input */}
              <View className="mb-6">
                <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3" style={{ opacity: isWeb ? 1 : 0.8 }}>
                  Nom complet
                </Text>
                <View className="flex-row items-center border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-5 py-4">
                  <UserIcon size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                  <TextInput
                    className="flex-1 ml-4 text-base text-gray-900 dark:text-gray-100 font-medium"
                    placeholder="Votre nom complet"
                    placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Phone Input */}
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

              {/* Role Selection */}
              <View className="mb-8">
                <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4" style={{ opacity: isWeb ? 1 : 0.8 }}>
                  Type de compte
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setRole('GESTIONNAIRE')}
                    disabled={loading}
                    className={`flex-1 p-5 rounded-2xl border transition-all ${
                      role === 'GESTIONNAIRE'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <Text className={`text-center font-black ${
                      role === 'GESTIONNAIRE' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      Gestionnaire
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRole('CHAUFFEUR')}
                    disabled={loading}
                    className={`flex-1 p-5 rounded-2xl border transition-all ${
                      role === 'CHAUFFEUR'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <Text className={`text-center font-black ${
                      role === 'CHAUFFEUR' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      Chauffeur
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Inputs */}
              <View className="mb-6">
                <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3" style={{ opacity: isWeb ? 1 : 0.8 }}>
                  Mot de passe
                </Text>
                <View className="flex-row items-center border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-5 py-4 mb-4">
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
                <View className="flex-row items-center border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-5 py-4">
                  <Lock size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                  <TextInput
                    className="flex-1 ml-4 text-base text-gray-900 dark:text-gray-100 font-medium"
                    placeholder="Confirmez le mot de passe"
                    placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className={`rounded-2xl p-5 mt-4 shadow-lg shadow-blue-500/30 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-black text-lg">
                    S'inscrire
                  </Text>
                )}
              </TouchableOpacity>

              {/* Email Register Link */}
              <TouchableOpacity
                onPress={() => router.push('/auth/register')}
                disabled={loading}
                className="mt-6 py-4 flex-row justify-center items-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800"
              >
                <Mail size={18} color={isDark ? '#9ca3af' : '#6b7280'} className="mr-2" />
                <Text className="text-gray-700 dark:text-gray-300 font-bold ml-2">S'inscrire par email</Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row justify-center items-center mt-8">
                <Text className="text-gray-500 dark:text-gray-400 font-medium">Déjà un compte ? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/auth/phone-login')}
                  disabled={loading}
                >
                  <Text className="text-blue-600 dark:text-blue-400 font-black">Se connecter</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
