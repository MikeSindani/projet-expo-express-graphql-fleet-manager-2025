import Colors from "@/constants/colors";
import { useFleet } from "@/contexts/FleetContext";
import { useRouter } from "expo-router";
import { Car, Hash, Plus } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function VehiclesScreen() {
  const { vehicules } = useFleet();
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
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {vehicules.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Car size={64} color={Colors.gray[300]} />
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">Aucun véhicule</Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 text-center px-10">
              Commencez par ajouter un véhicule à votre flotte
            </Text>
          </View>
        ) : (
          vehicules.map((vehicule) => (
            <View 
                key={vehicule.id} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-14 h-14 rounded-full bg-blue-600/10 dark:bg-blue-600/20 items-center justify-center mr-3">
                  <Car size={28} color={Colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {vehicule.marque} {vehicule.modele}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">{vehicule.annee}</Text>
                </View>
                <View
                  className="px-3 py-1.5 rounded-xl"
                  style={{ backgroundColor: getStatusColor(vehicule.statut) + "15" }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: getStatusColor(vehicule.statut) }}
                  >
                    {getStatusLabel(vehicule.statut)}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 gap-2">
                <Hash size={16} color={Colors.text.secondary} />
                <Text className="text-base font-bold text-gray-900 dark:text-white tracking-widest">{vehicule.immatriculation}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        className="absolute right-5 bottom-5 w-15 h-15 rounded-full bg-blue-600 items-center justify-center shadow-lg"
        style={{ width: 60, height: 60, borderRadius: 30 }}
        onPress={() => router.push("/(tabs)/../add-vehicle" as any)}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
