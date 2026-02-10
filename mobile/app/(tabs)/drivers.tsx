import WebLayout from '@/components/web/WebLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useFleet } from '@/contexts/FleetContext';
import { getImageUrl } from '@/utils/images';
import { useRouter } from 'expo-router';
import { Mail, Phone, Plus, ShieldAlert, User as UserIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DriversScreen() {
  const { chauffeurs, manageAccess, isLoading } = useFleet();
  const auth = useAuth();
  const user = auth?.user;
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isManager = user?.role === "GESTIONNAIRE"

  const activeChauffeurs = chauffeurs.filter((c) => c.organizationAccess !== false);
  const pendingChauffeurs = chauffeurs.filter((c) => c.organizationAccess === false);

  const handleAccess = async (id: string, access: boolean) => {
    setProcessingId(id);
    try {
      await manageAccess(id, access);
      // Success alert is handled in manageAccess or we can show one here
      // But manageAccess usually invalidates queries so UI updates automatically
      if (access) {
        Alert.alert("Succès", "L'accès du chauffeur a été approuvé.");
      } else {
        Alert.alert("Succès", "L'accès du chauffeur a été refusé.");
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
    } finally {
      setProcessingId(null);
    }
  };

  const confirmBlock = (id: string) => {
    Alert.alert(
      "Refuser l'accès",
      "Êtes-vous sûr de vouloir refuser l'accès à ce chauffeur ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Refuser", style: "destructive", onPress: () => handleAccess(id, false) },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <WebLayout>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="p-4 md:p-8 lg:p-12 w-full max-w-7xl mx-auto">
          {/* En-tête de la page */}
          <View className="mb-10">
            <Text className="text-4xl font-black text-gray-900 dark:text-white mb-2">Chauffeurs</Text>
            <View className="w-20 h-1.5 bg-blue-600 rounded-full mb-3" />
            <Text className="text-gray-500 dark:text-gray-400 text-lg font-medium">Gestion de votre flotte de conducteurs</Text>
          </View>

          {/* SECTION: EN ATTENTE (Managers Only) */}
          {isManager && pendingChauffeurs.length > 0 && (
            <View className="mb-12">
              <View className="flex-row items-center mb-6">
                <View className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full items-center justify-center">
                  <ShieldAlert size={20} color="#f59e0b" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white ml-3">Rejointes en attente</Text>
                <View className="ml-3 bg-yellow-500 px-2.5 py-0.5 rounded-full">
                  <Text className="text-white text-xs font-black">{pendingChauffeurs.length}</Text>
                </View>
              </View>

              <View className="flex-row flex-wrap">
                {pendingChauffeurs.map((chauffeur) => {
                  const initials = chauffeur.name
                    ? chauffeur.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    : '??';

                  return (
                    <View key={chauffeur.id} className="w-full md:w-1/2 lg:w-1/3 p-2">
                      <View className="bg-white dark:bg-gray-800 rounded-[32px] p-6 border-l-[12px] border-yellow-500 shadow-sm h-full flex-col">
                        <View className="flex-row mb-6">
                          <View className="w-20 h-20 rounded-2xl bg-blue-600 items-center justify-center mr-4 overflow-hidden shadow-md">
                            {chauffeur.image ? (
                              <Image 
                                source={{ uri: getImageUrl(chauffeur.image) as string }} 
                                className="w-full h-full"
                                resizeMode="cover"
                              />
                            ) : (
                              <Text className="text-3xl font-bold text-white">{initials}</Text>
                            )}
                          </View>
                          <View className="flex-1 justify-center">
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                              {chauffeur.name}
                            </Text>
                            <View className="flex-row items-center mb-1">
                              <Mail size={12} color="#9ca3af" />
                              <Text className="text-gray-400 dark:text-gray-500 text-xs ml-2 font-medium" numberOfLines={1}>{chauffeur.email}</Text>
                            </View>
                            <View className="flex-row items-center">
                              <Phone size={12} color="#9ca3af" />
                              <Text className="text-gray-400 dark:text-gray-500 text-xs ml-2 font-medium">{chauffeur.telephone || "N/A"}</Text>
                            </View>
                          </View>
                        </View>

                        <View className="flex-row gap-3 mt-auto">
                          <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center bg-red-50 dark:bg-red-900/10 py-4 rounded-2xl border border-red-100 dark:border-red-900/30"
                            onPress={() => confirmBlock(chauffeur.id)}
                            disabled={processingId === chauffeur.id}
                          >
                            {processingId === chauffeur.id ? (
                              <ActivityIndicator size="small" color="#ef4444" />
                            ) : (
                              <Text className="text-red-600 dark:text-red-400 font-bold">Refuser</Text>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center bg-green-50 dark:bg-green-900/10 py-4 rounded-2xl border border-green-100 dark:border-green-900/30"
                            onPress={() => handleAccess(chauffeur.id, true)}
                            disabled={processingId === chauffeur.id}
                          >
                            {processingId === chauffeur.id ? (
                              <ActivityIndicator size="small" color="#22c55e" />
                            ) : (
                              <Text className="text-green-600 dark:text-green-400 font-bold">Approuver</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chauffeurs actifs</Text>
            <View className="flex-row flex-wrap">
              {activeChauffeurs.map((chauffeur) => {
                const initials = chauffeur.name
                  ? chauffeur.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                  : '??';

                return (
                  <View key={chauffeur.id} className="w-full  md:w-1/2 lg:w-1/3 xl:w-1/4 p-2">
                    <TouchableOpacity 
                      onPress={() => router.push(`/driver-detail/${chauffeur.id}` as any)}
                      className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-64  flex-col"
                      activeOpacity={0.9}
                    >
                      <View className="flex-row mb-6 items-center">
                        <View className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-700 items-center justify-center mr-4 overflow-hidden border border-gray-100 dark:border-gray-600 shadow-sm">
                          {chauffeur.image ? (
                            <Image 
                              source={{ uri: getImageUrl(chauffeur.image) as string }} 
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <Text className="text-2xl font-bold text-gray-400 dark:text-gray-200">{initials}</Text>
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                            {chauffeur.name}
                          </Text>
                          <View className="bg-blue-50 dark:bg-blue-900/20 self-start px-2 py-0.5 rounded-full">
                            <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">Chauffeur</Text>
                          </View>
                        </View>
                        
                        {isManager && (
                          <TouchableOpacity 
                            onPress={(e) => {
                              e.stopPropagation();
                              confirmBlock(chauffeur.id);
                            }}
                            disabled={processingId === chauffeur.id}
                            className="bg-red-50 dark:bg-red-900/10 p-2.5 rounded-xl border border-red-100 dark:border-red-900/30 ml-2"
                          >
                            {processingId === chauffeur.id ? (
                                <ActivityIndicator size="small" color="#ef4444" />
                            ) : (
                                <ShieldAlert size={18} color="#ef4444" />
                            )}
                          </TouchableOpacity>
                        )}
                      </View>

                      <View className="space-y-3 mb-6 flex-1">
                        <View className="flex-row items-center">
                          <Mail size={14} color="#3b82f6" />
                          <Text className="text-gray-500 dark:text-gray-400 text-sm ml-3 font-medium" numberOfLines={1}>{chauffeur.email}</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Phone size={14} color="#3b82f6" />
                          <Text className="text-gray-500 dark:text-gray-400 text-sm ml-3 font-medium">{chauffeur.telephone || "Non renseigné"}</Text>
                        </View>
                      </View>

                      <View className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mt-auto">
                        <Text className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-widest">N° de Permis</Text>
                        <Text className="text-base text-gray-900 dark:text-white font-black tracking-[1px]">{chauffeur.licenseNumber || "N/A"}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {activeChauffeurs.length === 0 && (
              <View className="items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[48px] border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
                <View className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full items-center justify-center mb-6">
                  <UserIcon size={40} color="#d1d5db" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aucun chauffeur actif</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center px-10 max-w-sm leading-6">
                  {isManager 
                    ? "Validez les demandes en attente ou ajoutez un nouveau conducteur." 
                    : "Aucun chauffeur n'est associé à cette organisation."}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {isManager && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg elevation-5"
          onPress={() => router.push("/add-driver" as any)}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
      </SafeAreaView>
    </WebLayout>
  );
}
