import { useTheme } from '@/contexts/ThemeContext';
import { graphqlClient } from '@/lib/graphql-client';
import { FORGOT_PASSWORD_WITH_PHONE } from '@/lib/graphql-queries';
import { Href, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Phone, Truck } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordPhoneScreen() {
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { isDark } = useTheme();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const handleReset = async () => {
    if (!telephone) {
      if (isWeb) alert('Veuillez entrer votre numéro de téléphone');
      else Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      await graphqlClient.mutate(FORGOT_PASSWORD_WITH_PHONE, {
        telephone,
      });
      setSubmitted(true);
    } catch (error: any) {
      if (isWeb) alert(error.message || 'La réinitialisation a échoué');
      else Alert.alert('Erreur', error.message || 'La réinitialisation a échoué');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950 justify-center p-6">
        <View className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 rounded-[40px] p-10 shadow-xl border border-gray-100 dark:border-gray-800 items-center">
          <View className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-8">
            <CheckCircle2 size={40} color={isDark ? '#4ade80' : '#16a34a'} />
          </View>
          <Text className="text-3xl font-black text-gray-900 dark:text-gray-100 text-center mb-3 tracking-tighter">
            Code envoyé
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-10 font-medium leading-relaxed">
            Un code de réinitialisation a été envoyé au {telephone}.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 w-full rounded-2xl p-5 shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
            onPress={() => router.push('/auth/phone-login' as Href)}
          >
            <Text className="text-white text-center font-black text-lg">
              Retour à la connexion
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
                        Réinitialisation <Text className="text-blue-600">SMS</Text>
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        Entrez votre numéro pour recevoir un code de sécurité par SMS.
                    </Text>
                </View>

                {/* Phone Input */}
                <View className="mb-10">
                    <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                        Numéro de téléphone
                    </Text>
                    <View className="flex-row items-center border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-5 py-4">
                        <Phone size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <TextInput
                            className="flex-1 ml-4 text-base text-gray-900 dark:text-gray-100 font-medium"
                            placeholder="+243 123 456 789"
                            placeholderTextColor={isDark ? '#4b5563' : '#9ca3af'}
                            value={telephone}
                            onChangeText={setTelephone}
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    className={`rounded-2xl p-5 shadow-lg shadow-blue-500/30 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
                    onPress={handleReset}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-black text-lg">
                            Envoyer le code
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => router.push('/auth/forgot-password' as Href)}
                    className="mt-8 items-center"
                >
                    <Text className="text-blue-600 dark:text-blue-400 font-bold">Réinitialiser par email</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
