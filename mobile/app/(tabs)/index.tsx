import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery } from "@/lib/graphql-hooks";
import { GET_DASHBOARD_STATS, GET_USER_WITH_ORG, LOGOUT } from "@/lib/graphql-queries";
import { Link, useRouter } from "expo-router";
import { BarChart3, Car, FileText, LogOut, User, Users } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from "react-native";

export default function DashboardScreen() {
  const {updateUser} = useAuth();
  const auth = useAuth();
  const user = auth?.user;
  const token = auth?.token;
  const signOut = auth?.signOut || (() => Promise.resolve());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const { data: userData, loading: userLoading } = useQuery(GET_USER_WITH_ORG, {
    variables: { id: user?.id },
    skip: !user?.id,
    onCompleted: (data) => {
      const user = data.user;
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

  const { data: statsData, loading: statsLoading, refetch } = useQuery(GET_DASHBOARD_STATS,
    {
      variables: { id: user?.organizationId || null },
      skip: !user?.organizationId || !userData?.user?.organizationAccess
    }
  );

  const [logout, { loading: logoutLoading }] = useMutation(LOGOUT);

  const [refreshing, setRefreshing] = useState(false);

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
    },
    {
      label: "Véhicules",
      route: "/vehicles",
      value: statsData?.countVehicule || 0,
      icon: Car,
      color: Colors.secondary,
    },
    {
      label: "Actifs",
      route: "/vehicles",
      value: statsData?.countActiveVehicule || 0,
      icon: BarChart3,
      color: Colors.success,
    },
    {
      label: "Rapports",
      route: "/reports",
      value: statsData?.countRapport || 0,
      icon: FileText,
      color: Colors.warning,
    },
  ];

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
              await logout({ variables: { token } });
              await signOut();
              setIsLoggingOut(false);
              if (logoutLoading) return;
              router.replace('/onboarding');
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
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView 
        contentContainerClassName="p-4 pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
       
        {/* Title Section */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Tableau de bord</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-base">Vue d'ensemble de votre flotte</Text>
        </View>

         {/* User Header */}
        <View className="flex-row justify-between items-center bg-blue-600 dark:bg-blue-800 rounded-2xl px-4 py-3 mb-6 shadow-sm">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <User size={20} color="white" />
            </View>
            <View>
              <Text className="text-white text-lg font-bold">{user?.name}</Text>
              <Text className="text-blue-100 dark:text-blue-200 text-sm">
                {userData?.user?.organization?.name || "Sans organisation"}
              </Text>
            </View>
          </View>
          <LogOut size={24} color="white" onPress={handleLogout} />
        </View>

        {hasOrg && !hasAccess ? (
            <View className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl items-center border border-yellow-200 dark:border-yellow-700">
                <Text className="text-xl font-bold text-yellow-800 dark:text-yellow-100 mb-2">Accès restreint</Text>
                <Text className="text-yellow-700 dark:text-yellow-200 text-center mb-4">
                    Votre demande d'adhésion à {userData?.user?.organization?.name} est en attente de validation par un administrateur.
                </Text>
                <View className="bg-white dark:bg-yellow-800 px-4 py-2 rounded-lg border border-yellow-100 dark:border-yellow-600">
                    <Text className="text-yellow-600 dark:text-yellow-100 font-medium">Statut: En attente</Text>
                </View>
            </View>
        ) : (
            <>
                {/* Stats Grid */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                    <Link 
                        key={index} 
                        className="flex-1 min-w-[45%] bg-white dark:bg-gray-800 rounded-2xl p-4 items-center shadow-sm"
                        href={stat.route}
                        asChild
                    >
                         <View 
                            className="bg-white dark:bg-gray-800 rounded-2xl p-4 items-center shadow-sm flex-1 min-w-[45%]"
                            // Link asChild requires a single child, so we wrap in View
                        >
                            <View 
                            className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                            style={{ backgroundColor: stat.color + "15" }}
                            >
                            <IconComponent size={24} color={stat.color} />
                            </View>
                            {statsLoading ? (
                            <ActivityIndicator size="small" color={stat.color} />
                            ) : (
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {stat.value}
                            </Text>
                            )}
                            <Text className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</Text>
                        </View>
                    </Link>
                    );
                })}
                </View>

                {/* Recent Reports Section */}
                <View className="mb-6">
                <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rapports récents</Text>
                {recentReports.length === 0 ? (
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center justify-center shadow-sm">
                    <FileText size={32} color={Colors.gray[400]} />
                    <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">Aucun rapport disponible</Text>
                    </View>
                ) : (
                    recentReports.map((rapport: any) => (
                    <View 
                        key={rapport.id} 
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm"
                    >
                        <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">
                            {rapport.user?.name || "Chauffeur inconnu"}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(rapport.date).toLocaleDateString("fr-FR")}
                        </Text>
                        </View>
                        
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {rapport.vehicule 
                            ? `${rapport.vehicule.marque} ${rapport.vehicule.modele} • ${rapport.vehicule.immatriculation}`
                            : "Véhicule inconnu"}
                        </Text>

                        <View className="flex-row gap-3">
                        <View className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md">
                            <Text className="text-xs text-gray-600 dark:text-gray-300">
                            {rapport.kilometrage} km
                            </Text>
                        </View>
                        {rapport.incidents && (
                            <View className="bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-md">
                            <Text className="text-xs text-orange-600 dark:text-orange-300 font-medium">
                                ⚠️ Incident
                            </Text>
                            </View>
                        )}
                        </View>
                    </View>
                    ))
                )}
                </View>
            </>
        )}
      </ScrollView>
    </View>
  );
}
