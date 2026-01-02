import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { useRouter } from "expo-router";
import { AlertCircle, FileText, Plus } from "lucide-react-native";
import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ReportsScreen() {
  const { rapports, chauffeurs, vehicules } = useFleet();
  const { user } = useAuth();
  const router = useRouter();

  // Filter reports based on user role
  const filteredReports = useMemo(() => {
    if (!user) return [];
    
    // Chauffeurs only see their own reports
    if (user.role === "CHAUFFEUR") {
      return rapports.filter((r) => r.chauffeurId === user.id);
    }
    
    // Admins and Managers see all reports
    return rapports;
  }, [rapports, user]);

  const sortedReports = [...filteredReports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );


  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView contentContainerClassName="p-4 pb-24">
        {sortedReports.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <FileText size={64} color={Colors.gray[300]} />
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
              Aucun rapport
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400 text-center px-10">
              Créez votre premier rapport d&apos;activité
            </Text>
          </View>
        ) : (
          sortedReports.map((rapport) => {
            const chauffeur = chauffeurs.find((c) => c.id === rapport.chauffeurId);
            const vehicule = vehicules.find((v) => v.id === rapport.vehiculeId.toString());
            const distance = rapport.kilometrage;

            return (
              <TouchableOpacity 
                key={rapport.id} 
                onPress={() => router.push(`/report-detail/${rapport.id}` as any)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm"
              >
                <View className="flex-row justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                      {new Date(rapport.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      {chauffeur
                        ? chauffeur.name
                        : "Chauffeur inconnu"}
                    </Text>
                  </View>
                </View>

                <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    Véhicule
                  </Text>
                  <Text className="text-base text-gray-900 dark:text-white font-medium">
                    {vehicule
                      ? `${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation})`
                      : "Véhicule inconnu"}
                  </Text>
                </View>

                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 items-center">
                    <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase">
                      Distance
                    </Text>
                    <Text className="text-base font-bold text-blue-600 dark:text-blue-400">
                      {distance} km
                    </Text>
                  </View>
                </View>

                {rapport.incidents && (
                  <View className="flex-row bg-orange-50 dark:bg-orange-900/30 rounded-xl p-3 mb-3 gap-2">
                    <AlertCircle size={16} color={Colors.warning} />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-orange-600 dark:text-orange-300 mb-1">
                        Incidents signalés
                      </Text>
                      <Text className="text-sm text-gray-900 dark:text-gray-100 leading-5">
                        {rapport.incidents}
                      </Text>
                    </View>
                  </View>
                )}

                {rapport.commentaires && (
                  <View className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                      Commentaires
                    </Text>
                    <Text className="text-sm text-gray-900 dark:text-gray-100 leading-5">
                      {rapport.commentaires}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        className="absolute right-5 bottom-5 w-15 h-15 rounded-full bg-blue-600 items-center justify-center shadow-lg"
        style={{ width: 60, height: 60, borderRadius: 30 }}
        onPress={() => router.push("/(tabs)/../add-report" as any)}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
