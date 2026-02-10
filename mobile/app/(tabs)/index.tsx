import WebLayout from '@/components/web/WebLayout';
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { useMutation, useQuery, useSubscription } from "@/lib/graphql-hooks";
import { GET_DASHBOARD_STATS, GET_USER_WITH_ORG, LOGOUT, STATS_UPDATED } from "@/lib/graphql-queries";
import { getImageUrl } from "@/utils/images";
import { Href, Link, useRouter } from "expo-router";
import { BarChart3, Car, FileText, LogOut, User, Users } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/colors";

export default function DashboardScreen() {
  const auth = useAuth();
  const user = auth?.user;
  const token = auth?.token;
  const signOut = auth?.signOut || (() => Promise.resolve());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const isChauffeur = user?.role === "CHAUFFEUR";

  const { data: userData, loading: userLoading } = useQuery(GET_USER_WITH_ORG, {
    variables: { id: user?.id },
    skip: !user?.id,
    onCompleted: (data) => {
      const user = data.user;
      if (user) {
        auth.updateUser({
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

  const { data: statsData, loading: statsLoading, refetch } = useQuery(GET_DASHBOARD_STATS,
    {
      variables: { id: user?.organizationId || null },
      skip: !user?.organizationId || !userData?.user?.organizationAccess
    }
  );

  const [logout, { loading: logoutLoading }] = useMutation(LOGOUT);

  const [refreshing, setRefreshing] = useState(false);

  // Real-time stats subscription
  useSubscription({
    query: STATS_UPDATED,
    enabled: !!user?.organizationId,
    onData: () => {
      console.log('Stats updated on server, refetching dashboard...');
      refetch();
    }
  });

  const { vehicules, changeStatut } = useFleet();
  const assignedVehicule = vehicules.find(v => v.driverId === user?.id || v.driver?.id === user?.id);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    // await logout({ variables: { token } }); // Commented out as likely unintentional in original code or not needed for refresh
    setRefreshing(false);
  }, [refetch]);

  const stats = [
    {
      label: "Chauffeurs",
      route: "/drivers",
      value: statsData?.countChauffeur || 0,
      icon: Users,
      color: Colors.primary,
      hidden: isChauffeur,
    },
    {
      label: "Véhicules",
      route: "/vehicles",
      value: statsData?.countVehicule || 0,
      icon: Car,
      color: Colors.secondary,
      hidden: isChauffeur,
    },
    {
      label: "Indisponibles",
      route: "/vehicles",
      value: statsData?.countIndisponibleVehicule || 0,
      icon: BarChart3,
      color: Colors.danger,
    },
    {
      label: "Rapports",
      route: "/(tabs)/rapports",
      value: statsData?.countRapport || 0,
      icon: FileText,
      color: Colors.warning,
    },
  ].filter(s => !s.hidden);

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
              await logout({ variables: { token } });
               await signOut();
            } catch (error) {
              console.error('Erreur lors de la déconnexion serveur:', error);
            } finally {
              setIsLoggingOut(false);
              router.replace('/onboarding');
            }
          },
        },
      ]
    );
  };

  const recentReports = statsData?.rapports?.slice(0, 5) || [];

  const hasAccess = userData?.user?.organizationAccess;
  const hasOrg = !!userData?.user?.organizationId;

  if (userLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <WebLayout>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        contentContainerClassName="p-4 md:p-8 lg:p-12 pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <View className="max-w-6xl mx-auto w-full">
          {/* Title Section */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Tableau de bord</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-base">Vue d'ensemble de votre flotte</Text>
          </View>

          {/* User Header */}
          <View className="flex-row justify-between items-center bg-blue-600 dark:bg-blue-800 rounded-2xl px-4 py-4 md:px-6 md:py-6 mb-8 shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center overflow-hidden">
                {user?.image ? (
                  <Image 
                    source={{ uri: getImageUrl(user.image) }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <User size={28} color="white" />
                )}
              </View>
              <View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-white text-xl font-bold">{user?.name}</Text>
                  <View className="bg-white/20 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-[10px] font-bold uppercase">{user?.role}</Text>
                  </View>
                </View>
                <Text className="text-blue-100 dark:text-blue-200 text-base">
                  {userData?.user?.organization?.name || "Sans organisation"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} className="p-2 hover:bg-white/10 rounded-full">
              <LogOut size={26} color="white" />
            </TouchableOpacity>
          </View>

          {hasOrg && !hasAccess ? (
            <View className="bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-3xl items-center border border-yellow-200 dark:border-yellow-700">
              <Text className="text-2xl font-bold text-yellow-800 dark:text-yellow-100 mb-2">Accès restreint</Text>
              <Text className="text-yellow-700 dark:text-yellow-200 text-center text-lg mb-6">
                Votre demande d'adhésion à {userData?.user?.organization?.name} est en attente de validation par un administrateur.
              </Text>
              <View className="bg-white dark:bg-yellow-800 px-6 py-3 rounded-xl border border-yellow-100 dark:border-yellow-600">
                <Text className="text-yellow-600 dark:text-yellow-100 font-bold">Statut: En attente</Text>
              </View>
            </View>
          ) : (
            <View className="lg:flex-row lg:gap-8">
              <View className="lg:flex-1">
                {/* Stats Grid */}
                <View className="flex-row flex-wrap gap-4 mb-8">
                  {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <Link
                        key={index}
                        className="flex-1 min-w-[45%] md:min-w-[200px]"
                        href={stat.route as Href}
                        asChild
                      >
                        <TouchableOpacity
                          className="bg-white dark:bg-gray-800 rounded-3xl p-6 items-center shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500/30"
                        >
                          <View
                            className="w-14 h-14 rounded-2xl items-center justify-center mb-4 shadow-inner"
                            style={{ backgroundColor: stat.color + "15" }}
                          >
                            <IconComponent size={28} color={stat.color} />
                          </View>
                          {statsLoading ? (
                            <ActivityIndicator size="small" color={stat.color} />
                          ) : (
                            <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                              {stat.value}
                            </Text>
                          )}
                          <Text className="text-gray-500 dark:text-gray-400 font-medium text-center">{stat.label}</Text>
                        </TouchableOpacity>
                      </Link>
                    );
                  })}
                </View>

                {/* Driver Vehicle Management */}
                {isChauffeur && assignedVehicule && (
                  <View className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <View className="h-48 w-full bg-gray-200 dark:bg-gray-700 relative">
                      {assignedVehicule.image ? (
                        <Image 
                          source={{ uri: getImageUrl(assignedVehicule.image) }} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Car size={64} color="#CBD5E1" />
                        </View>
                      )}
                      <View className="absolute top-4 right-4">
                        <View className={`px-4 py-1.5 rounded-full shadow-lg ${
                          assignedVehicule.statut === 'disponible' ? 'bg-green-500' : 
                          assignedVehicule.statut === 'en_reparation' ? 'bg-orange-500' : 'bg-red-500'
                        }`}>
                          <Text className="text-white text-xs font-black uppercase">
                            {assignedVehicule.statut.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View className="p-6">
                      <View className="flex-row justify-between items-start mb-6">
                        <View>
                          <Text className="text-2xl font-black text-gray-900 dark:text-white">
                            {assignedVehicule.marque} {assignedVehicule.modele}
                          </Text>
                          <Text className="text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase">
                            {assignedVehicule.immatriculation}
                          </Text>
                        </View>
                        <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl">
                          <Car size={24} color={Colors.primary} />
                        </View>
                      </View>

                      <Text className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase mb-4 tracking-tighter">
                        Mettre à jour le statut du véhicule
                      </Text>
                      
                      <View className="flex-row gap-3">
                        {[
                          { id: 'disponible', label: 'Disponible', color: '#10b981' },
                          { id: 'indisponible', label: 'Indisponible', color: '#ef4444' },
                          { id: 'en_reparation', label: 'Réparation', color: '#f59e0b' }
                        ].map((s) => (
                          <TouchableOpacity
                            key={s.id}
                            onPress={() => changeStatut(assignedVehicule.id, s.id)}
                            className={`flex-1 py-4 rounded-2xl items-center justify-center border-2 ${
                              assignedVehicule.statut === s.id 
                                ? 'bg-white dark:bg-gray-800' 
                                : 'bg-gray-50 dark:bg-gray-900/50 border-transparent'
                            }`}
                            style={assignedVehicule.statut === s.id ? { borderColor: s.color } : {}}
                          >
                            <Text className={`text-[10px] font-black uppercase ${
                              assignedVehicule.statut === s.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                            }`}>
                              {s.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>

              <View className="lg:w-[400px]">
                {/* Recent Reports Section */}
                <View className="mb-8">
                  <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">Rapports récents</Text>
                    <Link href="/(tabs)/rapports" className="text-blue-600 dark:text-blue-400 font-semibold">Voir tout</Link>
                  </View>
                  
                  {recentReports.length === 0 ? (
                    <View className="bg-white dark:bg-gray-800 rounded-3xl p-10 items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                      <FileText size={48} color={Colors.gray[300]} />
                      <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center text-lg">Aucun rapport disponible</Text>
                    </View>
                  ) : (
                    recentReports.map((rapport: any) => (
                      <View
                        key={rapport.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm border border-gray-50 dark:border-gray-700 hover:border-blue-500/20"
                      >
                        <View className="flex-row justify-between items-center mb-3">
                          <Text className="text-lg font-bold text-gray-900 dark:text-white">
                            {rapport.user?.name || "Chauffeur inconnu"}
                          </Text>
                          <Text className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                            {new Date(rapport.date).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short' })}
                          </Text>
                        </View>

                        <Text className="text-gray-600 dark:text-gray-300 mb-4 flex-row items-center">
                          <Car size={14} className="mr-2" /> {rapport.vehicule
                            ? `${rapport.vehicule.marque} ${rapport.vehicule.modele}`
                            : "Véhicule inconnu"}
                        </Text>

                        <View className="flex-row justify-between items-center">
                          <View className="bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                            <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                              {rapport.kilometrage?.toLocaleString()} km
                            </Text>
                          </View>
                          {rapport.incidents && (
                            <View className="bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-900/30">
                              <Text className="text-xs text-red-600 dark:text-red-400 font-bold">
                                ⚠️ Incident
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      </View>
    </WebLayout>
  );
}
