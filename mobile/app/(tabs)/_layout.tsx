import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { darkTheme, lightTheme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Tabs } from "expo-router";
import { BarChart3, Car, FileText, UserCircle, Users } from "lucide-react-native";
import React from "react";
import { useWindowDimensions, View } from "react-native";
import { Platform } from "react-native";

export default function TabLayout() {
  const auth = useAuth();
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const user = auth?.user;
  const role = user?.role?.trim().toUpperCase();
  const isChauffeur = role === "CHAUFFEUR";

  const isDesktop = width >= 768; // md breakpoint
  const activeColors = isDark ? darkTheme : lightTheme;
  
  return (
    <View className="flex-1 flex-row">
      
      
      <View className="flex-1">
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: activeColors.primary,
            tabBarInactiveTintColor: activeColors.gray[500],
            header: () => Platform.OS !== 'web' ? <Header /> : null,
            headerShown: true,
            tabBarStyle: {
              backgroundColor: activeColors.card,
              borderTopColor: activeColors.border,
              display: isDesktop ? 'none' : 'flex'
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Tableau de bord",
              tabBarLabel: "Accueil",
              tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
            }}
          />
          
          <Tabs.Screen
            name="drivers"
            options={{
              title: "Chauffeurs",
              tabBarLabel: "Chauffeurs",
              tabBarIcon: ({ color }) => <Users size={24} color={color} />,
              href: isChauffeur ? null : undefined,
            }}
          />
          
          <Tabs.Screen
            name="vehicles"
            options={{
              title: "Véhicules",
              tabBarLabel: "Véhicules",
              tabBarIcon: ({ color }) => <Car size={24} color={color} />,
              href: isChauffeur ? null : undefined,
            }}
          />
          
          <Tabs.Screen
            name="rapports"
            options={{
              title: "Rapports",
              tabBarLabel: "Rapports",
              tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
            }}
          />
          
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profil",
              tabBarLabel: "Profil",
              tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

