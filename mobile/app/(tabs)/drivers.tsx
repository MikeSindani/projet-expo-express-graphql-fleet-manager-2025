import { useAuth } from '@/contexts/AuthContext';
import { useFleet } from '@/contexts/FleetContext';
import { getImageUrl } from '@/utils/images';
import { useRouter } from 'expo-router';
import { Check, Mail, Phone, Plus, ShieldAlert, User as UserIcon, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DriversScreen() {
  const { chauffeurs, manageAccess, isLoading } = useFleet();
  const auth = useAuth();
  const user = auth?.user;
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isManager = user?.role === "GESTIONNAIRE" || user?.role === "ADMIN";

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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* En-tête de la page */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Chauffeurs</Text>
          <Text className="text-gray-500 dark:text-gray-400">Gérez votre flotte de chauffeurs</Text>
        </View>

        {/* SECTION: EN ATTENTE (Managers Only) */}
        {isManager && pendingChauffeurs.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <ShieldAlert size={20} color="#f59e0b" />
              <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">En attente de validation</Text>
              <View className="ml-2 bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded-full">
                <Text className="text-yellow-800 dark:text-yellow-100 text-xs font-bold">{pendingChauffeurs.length}</Text>
              </View>
            </View>

            {pendingChauffeurs.map((chauffeur) => {
              // Generate initials safely
              const initials = chauffeur.name
                ? chauffeur.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                : '??';

              return (
                <View key={chauffeur.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border-l-4 border-yellow-500 shadow-sm">
                  <View className="flex-row mb-4">
                    <View className="w-14 h-14 rounded-full bg-blue-600 items-center justify-center mr-3 overflow-hidden">
                      {chauffeur.image ? (
                        <Image 
                          source={{ uri: getImageUrl(chauffeur.image) as string }} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-xl font-bold text-white">{initials}</Text>
                      )}
                    </View>
                    <View className="flex-1 justify-center">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {chauffeur.name}
                      </Text>
                      <View className="flex-row items-center mb-1">
                        <Mail size={14} color="#6b7280" />
                        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">{chauffeur.email}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Phone size={14} color="#6b7280" />
                        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">{chauffeur.telephone || "N/A"}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center bg-red-100 dark:bg-red-900/30 p-3 rounded-lg"
                      onPress={() => confirmBlock(chauffeur.id)}
                      disabled={processingId === chauffeur.id}
                    >
                      {processingId === chauffeur.id ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <>
                          <X size={16} color="#ef4444" />
                          <Text className="text-red-700 dark:text-red-300 font-semibold ml-2">Refuser</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center bg-green-100 dark:bg-green-900/30 p-3 rounded-lg"
                      onPress={() => handleAccess(chauffeur.id, true)}
                      disabled={processingId === chauffeur.id}
                    >
                      {processingId === chauffeur.id ? (
                        <ActivityIndicator size="small" color="#22c55e" />
                      ) : (
                        <>
                          <Check size={16} color="#22c55e" />
                          <Text className="text-green-700 dark:text-green-300 font-semibold ml-2">Approuver</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View>
          {activeChauffeurs.map((chauffeur) => {
              const initials = chauffeur.name
                ? chauffeur.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                : '??';

              return (
                <TouchableOpacity 
                  key={chauffeur.id} 
                  onPress={() => router.push(`/driver-detail/${chauffeur.id}` as any)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm"
                >
                  <View className="flex-row mb-4">
                    <View className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mr-3 overflow-hidden">
                      {chauffeur.image ? (
                        <Image 
                          source={{ uri: getImageUrl(chauffeur.image) as string }} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-xl font-bold text-gray-600 dark:text-white">{initials}</Text>
                      )}
                    </View>
                    <View className="flex-1 justify-center">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {chauffeur.name}
                      </Text>
                      <View className="flex-row items-center mb-1">
                        <Mail size={14} color="#6b7280" />
                        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">{chauffeur.email}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Phone size={14} color="#6b7280" />
                        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">{chauffeur.telephone || "N/A"}</Text>
                      </View>
                    </View>
                    
                    {/* Block Button for Managers */}
                    {isManager && (
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          confirmBlock(chauffeur.id);
                        }}
                        disabled={processingId === chauffeur.id}
                        className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg justify-center items-center"
                      >
                         {processingId === chauffeur.id ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                         ) : (
                            <ShieldAlert size={20} color="#ef4444" />
                         )}
                      </TouchableOpacity>
                    )}
                  </View>
                  <View className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex-row items-center">
                    <Text className="text-gray-500 dark:text-gray-400 font-semibold mr-2">Permis:</Text>
                    <Text className="text-gray-900 dark:text-white font-bold flex-1">{chauffeur.licenseNumber || "N/A"}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          }
           {/* Empty State */}
           {activeChauffeurs.length === 0 && (
             <View className="items-center justify-center py-10">
               <UserIcon size={64} color="#d1d5db" />
               <Text className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">Aucun chauffeur actif</Text>
               <Text className="text-gray-500 dark:text-gray-400 text-center px-10">
                 Validez les demandes en attente pour voir les chauffeurs ici.
               </Text>
             </View>
           )}
        </View>

      </ScrollView>

      {isManager && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg elevation-5"
          onPress={() => router.push("/add-driver")}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
