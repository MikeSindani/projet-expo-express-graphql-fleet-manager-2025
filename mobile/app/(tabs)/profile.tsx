import WebLayout from '@/components/web/WebLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useMutation, useQuery } from '@/hooks';
import { GET_USER_WITH_ORG, LOGOUT, UPDATE_PROFILE } from '@/lib/graphql-queries';
import { imageApi } from '@/lib/imageApi';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Building2, Camera, Copy, Edit2, FileText, LogOut, Moon, QrCode, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, token, signOut, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { pdfTemplate, setPdfTemplate } = useSettings();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [telephone, setTelephone] = useState(user?.telephone || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [logout] = useMutation(LOGOUT);
  // Fetch user with organization
  const { data, loading: loadingData, refetch } = useQuery(GET_USER_WITH_ORG, {
    variables: { id: user?.id },
    skip: !user?.id,
    onCompleted: (data) => {
      const user = data.user;
      console.log(user);
      if (user) {
        updateUser({
          ...user,
          organizationId: user.organizationId,
          organization: user.organization,
          role: user.role,
        });
      }
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    }
  });
  // Update profile mutation
  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE, {
    onCompleted: (data) => {
      const updatedUser = data.updateProfile;
      if (user) {
        updateUser({
          ...user,
          name: updatedUser.name,
          email: updatedUser.email,
        });
      }
      setIsEditing(false);
      setPassword('');
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      refetch();
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const handleUpdateProfile = () => {
    if (!name || !email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (!user?.id || !user?.role) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }
    updateProfile({
      id: user.id,
      name,
      email,
      telephone,  
      password: password || 'unchanged',
      image: user.image, // Garder l'image actuelle si non modifiée par cette fonction
      role: user.role,
    });
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Désolé, nous avons besoin des permissions pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri && user?.id) {
      setIsUploadingAvatar(true);
      try {
        // Utilisation de uploadMultiple car c'est ce qu'on a implémenté, mais avec un seul fichier
        const uploadResult = await imageApi.uploadMultiple([result.assets[0].uri], 'chauffeur', user.id);
        
        if (uploadResult.images && uploadResult.images.length > 0) {
          const newAvatarUrl = uploadResult.images[0].url;
          
          // Mettre à jour le profil via GraphQL
          await updateProfile({
            id: user.id,
            name: name,
            email: email,
            telephone,
            password: 'unchanged',
            image: newAvatarUrl,
            role: user.role
          });
        }
      } catch (error) {
        console.error("Avatar upload failed:", error);
        Alert.alert('Erreur', "Échec de l'upload de l'avatar");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              if (token) {
                await logout({ variables: { token: token } });
              }
            } catch (error) {
              console.error('Erreur lors de la déconnexion serveur:', error);
            } finally {
              await signOut();
              setIsLoggingOut(false);
              router.replace('/onboarding');
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'GESTIONNAIRE':
        return 'bg-blue-100 text-blue-800';
      case 'CHAUFFEUR':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'GESTIONNAIRE':
        return 'Gestionnaire';
      case 'CHAUFFEUR':
        return 'Chauffeur';
      default:
        return role;
    }
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Aucun utilisateur connecté</Text>
      </SafeAreaView>
    );
  }

  const organization = data?.user?.organization;
  const hasAccess = !!data?.user?.organizationAccess;

  return (
    <WebLayout>
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1 pb-10">
        <View className="max-w-4xl mx-auto w-full">
          {/* Header Section */}
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} px-6 py-10 items-center border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} md:rounded-b-[48px] md:shadow-sm`}>
            <TouchableOpacity 
              onPress={handlePickAvatar}
              disabled={isUploadingAvatar}
              className="relative mb-6"
            >
              <View className={`w-32 h-32 rounded-full ${isDark ? 'bg-gray-700' : 'bg-blue-50'} items-center justify-center border-4 ${isDark ? 'border-gray-600' : 'border-white'} shadow-md overflow-hidden`}>
                {user.image ? (
                  <Image source={{ uri: user.image }} className="w-full h-full" />
                ) : (
                  <UserIcon size={64} color={isDark ? '#60a5fa' : '#3b82f6'} />
                )}
              </View>
              <View className="absolute bottom-1 right-1 bg-blue-600 p-2.5 rounded-full border-4 border-white dark:border-gray-800 shadow-lg">
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Camera size={18} color="white" />
                )}
              </View>
            </TouchableOpacity>
            
            <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {user.name}
            </Text>
            <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 font-medium`}>
              {user.email}
            </Text>
            <View className={`px-6 py-2 rounded-full ${getRoleBadgeColor(user.role)} shadow-sm`}>
              <Text className="font-bold text-xs uppercase tracking-widest">{getRoleLabel(user.role)}</Text>
            </View>
          </View>

        <View className="px-4 py-6">
          {/* Organization Card */}
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 ml-2`}>
            Mon Organisation
          </Text>

          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-sm mb-6`}>
            {loadingData ? (
              <ActivityIndicator color="#3b82f6" />
            ) : !organization ? (
              <View className="items-center py-4">
                <Text className={`text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Vous n'avez pas encore rejoint d'organisation.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/org/create')}
                  className="bg-blue-600 py-3 px-6 rounded-xl w-full"
                >
                  <Text className="text-white font-bold text-center">Créer ou Rejoindre</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="flex-row items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <View className="flex-row items-center">
                    <Building2 size={24} color="#3b82f6" />
                    <View className="ml-3">
                      <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {organization.name}
                      </Text>
                      <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ID: {organization.id}
                      </Text>
                    </View>
                  </View>
                  {!hasAccess && (
                    <View className="bg-yellow-100 px-3 py-1 rounded-full">
                      <Text className="text-yellow-800 text-xs font-bold">En attente</Text>
                    </View>
                  )}
                </View>

                {hasAccess && (
                  <View className="space-y-3 gap-y-3">
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={async () => {
                          await Clipboard.setStringAsync(organization.id);
                          Alert.alert('Succès', 'ID copié !');
                        }}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl flex-row items-center justify-center"
                      >
                        <Copy size={18} color={isDark ? '#fff' : '#374151'} />
                        <Text className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>Copier ID</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowQrModal(true)}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl flex-row items-center justify-center"
                      >
                        <QrCode size={18} color={isDark ? '#fff' : '#374151'} />
                        <Text className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>QR Code</Text>
                      </TouchableOpacity>
                    </View>

                    {user.role === 'GESTIONNAIRE' && (
                      <TouchableOpacity
                        onPress={() => router.push('/(tabs)/drivers')}
                        className="w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex-row items-center justify-center border border-blue-100 dark:border-blue-900"
                      >
                        <UserIcon size={20} color="#3b82f6" />
                        <Text className="text-blue-600 dark:text-blue-400 font-bold ml-2">Gérer les chauffeurs</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => router.push('/org/create')}
                  className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                >
                  <Text className="text-gray-500 text-center text-sm">Changer d'organisation</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Personal Info Card */}
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 ml-2`}>
            Mes Informations
          </Text>
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-sm mb-6`}>
            {isEditing ? (
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-500 mb-1 ml-1 text-xs uppercase font-bold">Nom Complet</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </View>
                <View>
                  <Text className="text-gray-500 mb-1 ml-1 text-xs uppercase font-bold">Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </View>
                <View>
                  <Text className="text-gray-500 mb-1 ml-1 text-xs uppercase font-bold">Téléphone</Text>
                  <TextInput
                    value={telephone}
                    onChangeText={setTelephone}
                    className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </View>
                <View>
                  <Text className="text-gray-500 mb-1 ml-1 text-xs uppercase font-bold">Mot de passe</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Laisser vide si inchangé"
                    secureTextEntry
                    className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </View>

                <View className="flex-row gap-3 pt-2">
                  <TouchableOpacity onPress={() => setIsEditing(false)} className="flex-1 bg-gray-200 p-4 rounded-xl">
                    <Text className="text-gray-700 font-bold text-center">Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateProfile} className="flex-1 bg-blue-600 p-4 rounded-xl" disabled={updating}>
                    {updating ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-center">Enregistrer</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs uppercase font-bold mb-1">Nom</Text>
                  <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</Text>
                </View>
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs uppercase font-bold mb-1">Email</Text>
                  <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.email}</Text>
                </View>
                <View className="mb-6">
                  <Text className="text-gray-500 text-xs uppercase font-bold mb-1">Téléphone</Text>
                  <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.telephone || 'Non renseigné'}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(true);
                    setName(user.name);
                    setEmail(user.email);
                  }}
                  className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl flex-row justify-center items-center"
                >
                  <Edit2 size={16} color={isDark ? '#fff' : '#374151'} />
                  <Text className={`ml-2 font-bold ${isDark ? 'text-white' : 'text-gray-700'}`}>Modifier</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Preferences & Logout */}
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-2 shadow-sm mb-8`}>
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <View className="flex-row items-center">
                <Moon size={20} color={isDark ? '#fff' : '#6b7280'} />
                <Text className={`ml-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Mode Sombre</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={isDark ? '#60a5fa' : '#f3f4f6'}
              />
            </View>

            {/* PDF Template Picker */}
            <View className="p-4 border-b border-gray-100 dark:border-gray-700">
              <View className="flex-row items-center mb-3">
                <FileText size={20} color={isDark ? '#fff' : '#6b7280'} />
                <Text className={`ml-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Modèle de Rapport PDF</Text>
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setPdfTemplate('classic')}
                  className={`flex-1 rounded-xl border-2 p-3 items-center ${
                    pdfTemplate === 'classic'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-2xl mb-1`}>📋</Text>
                  <Text className={`text-xs font-bold ${
                    pdfTemplate === 'classic' ? 'text-blue-600' : (isDark ? 'text-gray-300' : 'text-gray-700')
                  }`}>Classique</Text>
                  <Text className={`text-xs mt-1 text-center ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Bleu & cartes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPdfTemplate('modern')}
                  className={`flex-1 rounded-xl border-2 p-3 items-center ${
                    pdfTemplate === 'modern'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <Text className={`text-2xl mb-1`}>🖤</Text>
                  <Text className={`text-xs font-bold ${
                    pdfTemplate === 'modern' ? 'text-blue-600' : (isDark ? 'text-gray-300' : 'text-gray-700')
                  }`}>Moderne</Text>
                  <Text className={`text-xs mt-1 text-center ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Sombre & tableau</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleLogout} className="flex-row items-center p-4">
              <LogOut size={20} color="#ef4444" />
              <Text className="ml-3 font-medium text-red-500">Se déconnecter</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </ScrollView>

      {/* QR Code Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showQrModal}
        onRequestClose={() => setShowQrModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-3xl items-center shadow-2xl w-10/12`}>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {organization?.name}
            </Text>
            <Text className="text-gray-500 mb-6 text-sm">Scannez pour rejoindre</Text>

            <View className="bg-white p-4 rounded-xl mb-6 shadow-sm">
              {organization?.id && (
                <QRCode
                  value={organization.id}
                  size={200}
                />
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowQrModal(false)}
              className="bg-gray-100 dark:bg-gray-700 py-3 px-8 rounded-xl w-full"
            >
              <Text className={`font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </WebLayout>
  );
}
