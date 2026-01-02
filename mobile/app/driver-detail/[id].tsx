import DocumentImagePicker from '@/components/DocumentImagePicker';
import ProfileImagePicker from '@/components/ProfileImagePicker';
import { FormInput } from '@/components/ui/form/FormInput';
import { useAuth } from '@/contexts/AuthContext';
import { useFleet } from '@/contexts/FleetContext';
import { useTheme } from '@/contexts/ThemeContext';
import { driverSchema } from '@/schemas/driver';
import { getImageUrl } from '@/utils/images';
import { generatePassword } from '@/utils/password_generator';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Check, Edit2, Key, Mail, Phone, RefreshCw, ShieldAlert, Trash2, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams();
  const { chauffeurs, updateChauffeur, deleteChauffeur, manageAccess, isLoading } = useFleet();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const chauffeur = useMemo(() => chauffeurs.find(c => c.id === id), [chauffeurs, id]);
  const isManager = user?.role === "GESTIONNAIRE" || user?.role === "ADMIN";

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      name: chauffeur?.name || '',
      email: chauffeur?.email || '',
      telephone: chauffeur?.telephone || '',
      licenseNumber: chauffeur?.licenseNumber || '',
      licenseExpiryDate: chauffeur?.licenseExpiryDate || '',
      password: '',
    },
    validatorAdapter: zodValidator() as any,
    onSubmit: async ({ value }: { value: any }) => {
      if (!chauffeur) return;
      setIsSaving(true);
      try {
        const updateData: any = { 
          ...value,
          image: profileImage || undefined,
          licenseImage: licenseImage || undefined
        };

        if (!updateData.password) {
          delete updateData.password;
        }

        await updateChauffeur(chauffeur.id, updateData);
        setIsEditing(false);
        Alert.alert("Succès", "Informations mises à jour.");
      } catch (error: any) {
        Alert.alert("Erreur", error.message || "Impossible de mettre à jour.");
      } finally {
        setIsSaving(false);
      }
    },
  } as any);

  useEffect(() => {
    if (chauffeur) {
      form.reset({
        name: chauffeur.name || "name",
        email: chauffeur.email || "email",
        telephone: chauffeur.telephone || '',
        licenseNumber: chauffeur.licenseNumber || '',
        licenseExpiryDate: chauffeur.licenseExpiryDate || '',
        password: '',
      });
      setProfileImage(chauffeur.image || null);
      setLicenseImage(chauffeur.licenseImage || null);
    }
  }, [chauffeur]);

  const handleGeneratePassword = () => {
    const newPass = generatePassword();
    form.setFieldValue("password", newPass);
    Alert.alert(
      "Mot de passe généré", 
      `Le nouveau mot de passe est : ${newPass}\nIl a été copié dans le presse-papier.`,
      [
        { text: "OK" },
        { text: "Copier", onPress: () => Clipboard.setStringAsync(newPass) }
      ]
    );
  };

  if (isLoading || !chauffeur) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Supprimer le chauffeur",
      "Êtes-vous sûr de vouloir supprimer ce chauffeur ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteChauffeur(chauffeur.id);
              router.back();
            } catch (error: any) {
              Alert.alert("Erreur", error.message || "Impossible de supprimer.");
            }
          } 
        },
      ]
    );
  };

  const toggleAccess = async () => {
    try {
      await manageAccess(chauffeur.id, !chauffeur.organizationAccess);
      Alert.alert("Succès", `Accès ${chauffeur.organizationAccess ? 'révoqué' : 'accordé'}.`);
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Action impossible.");
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1 px-4 py-6">

        <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
          <View className="items-center mb-6">
            <View className="mb-4">
              <ProfileImagePicker
                imageUri={getImageUrl(profileImage)}
                onImageSelected={setProfileImage}
                size={100}
                editable={isEditing}
              />
            </View>
            {!isEditing ? (
              <>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{chauffeur.name}</Text>
                <View className={`mt-2 px-3 py-1 rounded-full ${chauffeur.organizationAccess ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <Text className={`text-xs font-bold ${chauffeur.organizationAccess ? 'text-green-800' : 'text-yellow-800'}`}>
                    {chauffeur.organizationAccess ? 'ACTIF' : 'EN ATTENTE / BLOQUÉ'}
                  </Text>
                </View>
              </>
            ) : (
                <form.Field
                  name="name"
                  validators={{ onChange: driverSchema.shape.name as any }}
                  children={(field) => (
                    <FormInput
                      field={field}
                      placeholder="Nom complet"
                      className="text-center text-xl  font-bold"
                      editable={!isSaving}
                    />
                  )}
                />
            )}
          </View>

          <View className="space-y-4">
            <View>
              {isEditing ? (
                <form.Field
                  name="email"
                  validators={{ onChange: driverSchema.shape.email as any }}
                  children={(field) => (
                    <FormInput
                      field={field}
                      label="Email"
                      keyboardType="email-address"
                      icon={Mail}
                      editable={!isSaving}
                    />
                  )}
                />
              ) : (
                <>
                  <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Email</Text>
                  <View className="flex-row items-center p-1">
                    <Mail size={18} color="#6b7280" />
                    <Text className={`ml-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{chauffeur.email}</Text>
                  </View>
                </>
              )}
            </View>

            <View>
              {isEditing ? (
                <form.Field
                  name="telephone"
                  validators={{ onChange: driverSchema.shape.telephone as any }}
                  children={(field) => (
                    <FormInput
                      field={field}
                      label="Téléphone"
                      keyboardType="phone-pad"
                      icon={Phone}
                      editable={!isSaving}
                    />
                  )}
                />
              ) : (
                <>
                  <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Téléphone</Text>
                  <View className="flex-row items-center p-1">
                    <Phone size={18} color="#6b7280" />
                    <Text className={`ml-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{chauffeur.telephone || 'Non renseigné'}</Text>
                  </View>
                </>
              )}
            </View>

            <View>
              {isEditing ? (
                <form.Field
                  name="licenseNumber"
                  validators={{ onChange: driverSchema.shape.licenseNumber as any }}
                  children={(field) => (
                    <FormInput
                      field={field}
                      label="Numéro de Permis"
                      icon={ShieldAlert}
                      editable={!isSaving}
                    />
                  )}
                />
              ) : (
                <>
                  <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Numéro de Permis</Text>
                  <View className="flex-row items-center p-1">
                    <ShieldAlert size={18} color="#6b7280" />
                    <Text className={`ml-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{chauffeur.licenseNumber || 'Non renseigné'}</Text>
                  </View>
                </>
              )}
            </View>
            <View>
              {isEditing ? (
                <form.Field
                  name="licenseExpiryDate"
                  validators={{ onChange: driverSchema.shape.licenseExpiryDate as any }}
                  children={(field) => (
                    <FormInput
                      field={field}
                      label="Expiration Permis (YYYY-MM-DD)"
                      icon={Calendar}
                      editable={!isSaving}
                    />
                  )}
                />
              ) : (
                <>
                  <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Expiration Permis</Text>
                  <View className="flex-row items-center p-1">
                    <ShieldAlert size={18} color="#6b7280" />
                    <Text className={`ml-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{chauffeur.licenseExpiryDate || 'Non renseigné'}</Text>
                  </View>
                </>
              )}
            </View>

            <View className="mt-4">
              <Text className="text-gray-500 text-xs uppercase font-bold mb-2 ml-1">Photo du Permis</Text>
              {isEditing ? (
                <View className="items-center">
                  <DocumentImagePicker
                    imageUri={getImageUrl(licenseImage)}
                    onImageSelected={setLicenseImage}
                    width={150}
                    height={100}
                    editable={true}
                  />
                </View>
              ) : (
                <View className="items-center">
                  {chauffeur.licenseImage ? (
                    <Image 
                      source={{ uri: getImageUrl(chauffeur.licenseImage) as string }} 
                      className="w-full h-40 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className={`w-full h-40 rounded-xl border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'} items-center justify-center`}>
                       <Text className="text-gray-400">Aucune photo du permis</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {isEditing && (
            <View className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
              <Text className="text-gray-500 text-xs uppercase font-bold mb-4 ml-1">Sécurité</Text>
              
              <form.Field
                name="password"
                children={(field) => (
                  <View className="mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nouveau mot de passe</Text>
                      <TouchableOpacity 
                        onPress={handleGeneratePassword}
                        className="flex-row items-center"
                      >
                        <RefreshCw size={14} color="#3b82f6" />
                        <Text className="text-xs text-blue-600 font-bold ml-1">Générer</Text>
                      </TouchableOpacity>
                    </View>
                    <View className={`flex-row items-center p-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <Key size={18} color="#9ca3af" />
                      <TextInput
                        value={field.state.value}
                        onChangeText={field.handleChange}
                        placeholder="Laisser vide pour ne pas changer"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry
                        style={{ color: isDark ? 'white' : 'black' }}
                        className="flex-1 ml-3"
                      />
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          {isManager && (
            <View className="mt-8 space-y-3">
              {isEditing ? (
                <View className="flex-row gap-3">
                  <TouchableOpacity 
                    onPress={() => setIsEditing(false)} 
                    className="flex-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-2xl"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={form.handleSubmit} 
                    className="flex-1 bg-blue-600 p-4 rounded-2xl"
                    disabled={isSaving}
                  >
                    {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-center">Enregistrer</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-col gap-3">
                  <TouchableOpacity 
                    onPress={() => setIsEditing(true)} 
                    className="w-full bg-blue-600 p-4 rounded-2xl flex-row items-center justify-center"
                  >
                    <Edit2 size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Modifier les informations</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={toggleAccess} 
                    className={`w-full ${chauffeur.organizationAccess ? 'bg-orange-100' : 'bg-green-100'} p-4 rounded-2xl flex-row items-center justify-center`}
                  >
                    {chauffeur.organizationAccess ? <X size={20} color="#f97316" /> : <Check size={20} color="#22c55e" />}
                    <Text className={`font-bold ml-2 ${chauffeur.organizationAccess ? 'text-orange-700' : 'text-green-700'}`}>
                      {chauffeur.organizationAccess ? "Bloquer l'accès" : "Autoriser l'accès"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleDelete} 
                    className="w-full bg-red-100 p-4 rounded-2xl flex-row items-center justify-center"
                  >
                    <Trash2 size={20} color="#ef4444" />
                    <Text className="text-red-700 font-bold ml-2">Supprimer le chauffeur</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
