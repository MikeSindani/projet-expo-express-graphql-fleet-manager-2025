import Header from "@/components/Header";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs } from "expo-router";
import { BarChart3, Car, FileText, UserCircle, Users } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  const auth = useAuth();
  const user = auth?.user;
  const isChauffeur = user?.role === "CHAUFFEUR";
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[500],
        header: () => <Header />,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tableau de bord",
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
          tabBarLabel: "Accueil",
        }}
      />
      
      {/* Hide drivers tab for chauffeurs */}
      <Tabs.Screen
        name="drivers"
        options={{
          title: "Chauffeurs",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          href: isChauffeur ? null : undefined, // Hide for chauffeurs
        }}
      />
      
      <Tabs.Screen
        name="vehicles"
        options={{
          title: "Véhicules",
          tabBarIcon: ({ color }) => <Car size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="rapports"
        options={{
          title: "Rapports",
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      
      {/* Profile tab last */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
