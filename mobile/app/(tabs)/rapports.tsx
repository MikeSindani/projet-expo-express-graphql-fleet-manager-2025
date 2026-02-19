import { ImageGallery } from "@/components/ui/ImageGallery";
import WebLayout from '@/components/web/WebLayout';
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { useTheme } from "@/contexts/ThemeContext";
import * as FileSystem from 'expo-file-system';
import { useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import { AlertCircle, Download, FileText, Plus } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportsScreen() {
  const { rapports, chauffeurs, vehicules, refreshFleetData } = useFleet();
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  console.log('[ReportsScreen] Rendering for role:', user?.role);

  const exportToExcel = async () => {
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté pour exporter les rapports.");
      return;
    }

    setIsExporting(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.217:4001';
      
      if (Platform.OS === 'web') {
        const response = await fetch(`${apiUrl}/api/reports/export`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rapports-flotte.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const fileUri = `${FileSystem.cacheDirectory}rapports-flotte-${Date.now()}.xlsx`;

        const downloadRes = await FileSystem.downloadAsync(
          `${apiUrl}/api/reports/export`,
          fileUri,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (downloadRes.status !== 200) {
          throw new Error("Erreur lors du téléchargement du fichier (Status: " + downloadRes.status + ")");
        }

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Exporter les rapports Excel',
            UTI: 'com.microsoft.excel.xlsx',
          });
        } else {
          Alert.alert("Succès", "Le fichier a été téléchargé : " + downloadRes.uri);
        }
      }
    } catch (error: any) {
      console.error("Export error:", error);
      Alert.alert("Erreur", "Impossible d'exporter les rapports : " + error.message);
    } finally {
      setIsExporting(false);
    }

  };


  const [refreshing, setRefreshing] = useState(false);
  
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await refreshFleetData();
      // await logout({ variables: { token } }); // Commented out as likely unintentional in original code or not needed for refresh
      setRefreshing(false);
    }, [refreshFleetData]);
  

  // Filter reports based on user role
  const filteredReports = useMemo(() => {
    if (!user) return [];
    const role = user.role?.trim().toUpperCase();

    // Chauffeurs only see their own reports
    if (role === "CHAUFFEUR") {
      return rapports.filter((r) => (r.chauffeurId === user.id || (r as any).userId === user.id));
    }

    // Admins and Managers see all reports
    return rapports;
  }, [rapports, user]);

  const sortedReports = [...filteredReports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );


  return (
    <WebLayout>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <View className="p-4 md:p-8 lg:p-12 w-full max-w-7xl mx-auto">
          <View className="mb-10 flex-row justify-between items-end">
            <View className="flex-1">
              <Text className="text-4xl font-black text-gray-900 dark:text-white mb-2">Rapports</Text>
              <View className="w-20 h-1.5 bg-blue-600 rounded-full mb-3" />
              <Text className="text-gray-500 dark:text-gray-400 text-lg font-medium">Historique des activités</Text>
            </View>
            
            {(user?.role === "ADMIN" || user?.role === "GESTIONNAIRE") && (
              <TouchableOpacity
                onPress={exportToExcel}
                disabled={isExporting}
                className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl flex-row items-center gap-2"
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#16a34a" />
                ) : (
                  <>
                    <Download size={20} color="#16a34a" />
                    <Text className="text-green-700 dark:text-green-400 font-bold hidden md:flex">Excel</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {sortedReports.length === 0 ? (
            <View className="items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[48px] border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
              <View className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full items-center justify-center mb-6">
                <FileText size={48} color={isDark ? '#4b5563' : Colors.gray[300]} />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Aucun rapport</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center px-10 max-w-sm leading-6">
                Créez votre premier rapport d&apos;activité pour commencer à suivre votre flotte.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap">
              {sortedReports.map((rapport) => {
                const chauffeur = chauffeurs.find((c) => String(c.id) === String(rapport.chauffeurId));
                const vehicule = vehicules.find((v) => String(v.id) === String(rapport.vehiculeId));
                const distance = rapport.kilometrage;

                return (
                  <View key={rapport.id} className="w-full md:w-1/2 lg:w-1/3 p-2">
                    <TouchableOpacity
                      onPress={() => {
                        console.log("Navigating to report detail:", rapport.id);
                        router.push(`/report-detail/${rapport.id}` as any);
                      }}
                      className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700 web:h-full flex-col"
                      activeOpacity={0.9}
                    >
                      <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1">
                          <View className="flex-row justify-between items-center mb-2">
                             <View className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                              <Text className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[1px]">
                                {new Date(rapport.date).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Text>
                            </View>
                            <View className={`px-2 py-0.5 rounded-md ${
                              rapport.type === 'MAINTENANCE' ? 'bg-green-50 dark:bg-green-900/20' :
                              rapport.type === 'REPARATION' ? 'bg-orange-50 dark:bg-orange-900/20' :
                              'bg-blue-50 dark:bg-blue-900/20'
                            }`}>
                              <Text className={`text-[8px] font-black uppercase ${
                                rapport.type === 'MAINTENANCE' ? 'text-green-600' :
                                rapport.type === 'REPARATION' ? 'text-orange-600' :
                                'text-blue-600'
                              }`}>
                                {rapport.type || 'INCIDENT'}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-2xl font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                            {chauffeur ? chauffeur.name : "Chauffeur inconnu"}
                          </Text>
                        </View>
                      </View>

                      <View className="mb-6 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex-1">
                        <Text className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                          Véhicule & Performance
                        </Text>
                        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3" numberOfLines={2}>
                          {vehicule
                            ? `${vehicule.marque} ${vehicule.modele} • ${vehicule.immatriculation}`
                            : "Véhicule inconnu"}
                        </Text>
                        <View className="flex-row items-end">
                          <Text className="text-3xl font-black text-blue-600 dark:text-blue-400">
                            {distance}
                          </Text>
                          <Text className="text-sm font-bold text-blue-400 dark:text-blue-500 mb-1.5 ml-1">km</Text>
                        </View>
                      </View>

                      {rapport.incidents && (
                        <View className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-4 border border-red-100 dark:border-red-900/30">
                          <View className="flex-row items-center gap-2 mb-2">
                            <AlertCircle size={14} color="#EF4444" />
                            <Text className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
                              Incident signalé
                            </Text>
                          </View>
                          <Text className="text-sm text-gray-700 dark:text-gray-300 leading-5 italic" numberOfLines={2}>
                            "{rapport.incidents}"
                          </Text>
                        </View>
                      )}

                      <View className="mb-4">
                        <ImageGallery images={rapport.images || []} />
                      </View>
                      
                      <View className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700 flex-row justify-between items-center">
                        <Text className="text-xs font-bold text-gray-400 dark:text-gray-500">
                          {new Date(rapport.date).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider">Détails</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute right-5 bottom-5 w-15 h-15 rounded-full bg-blue-600 items-center justify-center shadow-lg"
        style={{ width: 60, height: 60, borderRadius: 30 }}
        onPress={() => router.push("/add-report")}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>
      </SafeAreaView>
    </WebLayout>
  );
}
