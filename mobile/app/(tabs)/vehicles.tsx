import { ImageGallery } from "@/components/ui/ImageGallery";
import WebLayout from '@/components/web/WebLayout';
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getImageUrl } from "@/utils/images";
import { useRouter } from "expo-router";
import { Car, Hash, Plus } from "lucide-react-native";
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VehiclesScreen() {
  const { vehicules, isLoading } = useFleet();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return Colors.success;
      case "maintenance":
        return Colors.warning;
      case "inactive":
        return Colors.gray[400];
      default:
        return Colors.gray[400];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "maintenance":
        return "Maintenance";
      case "inactive":
        return "Inactif";
      default:
        return status;
    }
  };

  return (
    <WebLayout>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="p-4 md:p-8 lg:p-12 w-full max-w-7xl mx-auto">
          <View className="mb-10">
            <Text className="text-4xl font-black text-gray-900 dark:text-white mb-2">Véhicules</Text>
            <View className="w-20 h-1.5 bg-blue-600 rounded-full mb-3" />
            <Text className="text-gray-500 dark:text-gray-400 text-lg font-medium">Gestion de votre parc automobile</Text>
          </View>

          {vehicules.length === 0 ? (
            <View className="items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[48px] border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
              <View className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full items-center justify-center mb-6">
                <Car size={48} color={isDark ? '#4b5563' : Colors.gray[300]} />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Aucun véhicule</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center px-10 max-w-sm leading-6">
                Votre flotte est vide. Ajoutez votre premier véhicule pour commencer le suivi.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap">
              {vehicules.map((vehicule) => (
                <View key={vehicule.id} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-2">
                  <TouchableOpacity 
                    onPress={() => router.push(`/vehicle-detail/${vehicule.id}` as any)}
                    className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 web:h-full flex-col"
                    activeOpacity={0.9}
                  >
                    <View className="aspect-[16/10] w-full bg-gray-100 dark:bg-gray-700 relative">
                      {vehicule.image ? (
                        <Image 
                          source={{ uri: getImageUrl(vehicule.image) }} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Car size={56} color={isDark ? '#4b5563' : Colors.gray[200]} />
                        </View>
                      )}
                      
                      <View className="absolute top-4 left-4">
                        <View 
                          className="px-3 py-1.5 rounded-full shadow-sm"
                          style={{ backgroundColor: getStatusColor(vehicule.statut) + "EE" }}
                        >
                          <Text className="text-[10px] font-bold text-white uppercase tracking-widest text-center">
                            {getStatusLabel(vehicule.statut)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="p-6 flex-1 flex-col">
                      <View className="mb-4 flex-1">
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                          {vehicule.marque}
                        </Text>
                        <Text className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                          {vehicule.modele} • {vehicule.annee}
                        </Text>
                        
                        <View className="flex-row items-center bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl px-4 py-3 border border-blue-100/50 dark:border-blue-900/30 self-start">
                          <Hash size={14} color={isDark ? '#60a5fa' : '#3b82f6'} />
                          <Text className="text-base font-black text-blue-700 dark:text-blue-400 tracking-[1px] ml-2">
                            {vehicule.immatriculation}
                          </Text>
                        </View>
                      </View>

                      <View className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <ImageGallery images={vehicule.images || []} />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {user?.role !== "CHAUFFEUR" && (
        <TouchableOpacity
          className="absolute right-5 bottom-5 w-15 h-15 rounded-full bg-blue-600 items-center justify-center shadow-lg"
          style={{ width: 60, height: 60, borderRadius: 30 }}
          onPress={() => router.push("/(tabs)/../add-vehicle" as any)}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
      </SafeAreaView>
    </WebLayout>
  );
}
