import { FormInput } from '@/components/ui/form/FormInput';
import { FormPasswordInput } from '@/components/ui/form/FormPasswordInput';
import { useAuth } from '@/contexts/AuthContext';
import { graphqlClient } from '@/lib/graphql-client';
import { LOGIN } from '@/lib/graphql-queries';
import { loginSchema } from '@/schemas/auth';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      setLoading(true);
      try {
        const data = await graphqlClient.mutate(LOGIN, {
          email: value.email,
          password: value.password,
        });

        if (data?.login) {
          await signIn(data.login.token, data.login.user);
        }
      } catch (error: any) {
        Alert.alert('Erreur', error.message || 'Connexion échouée');
      } finally {
        setLoading(false);
      }
    },
  });

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
        <form.Field
          name="email"
          validators={{
            onChange: loginSchema.shape.email,
          }}
          children={(field) => (
            <FormInput
              field={field}
              label="Email"
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon={Mail}
              editable={!loading}
            />
          )}
        />

        {/* Password Input */}
        <form.Field
          name="password"
          validators={{
            onChange: loginSchema.shape.password,
          }}
          children={(field) => (
            <FormPasswordInput
              field={field}
              label="Mot de passe"
              placeholder="Votre mot de passe"
              editable={!loading}
            />
          )}
        />
        
        <TouchableOpacity 
          onPress={() => router.push('/auth/forgot-password')}
          className="self-end mb-4"
        >
          <Text className="text-blue-600 text-sm font-medium">Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          className={`rounded-xl p-4 mb-4 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
          onPress={form.handleSubmit}
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
