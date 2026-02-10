import { darkTheme, lightTheme } from "@/constants/colors";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { Bell, Plus, Search } from "lucide-react-native";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header() {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const { isDark } = useTheme();
  const router = useRouter();

  const activeColors = isDark ? darkTheme : lightTheme;

  return (
    <View 
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-50" 
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-4 py-3 h-[60px]">
        <View className="flex-row items-center gap-3">
            {/* Logo Placeholder */}
            <View className="w-8 h-8 rounded-lg bg-blue-600 items-center justify-center">
                <Text className="text-white font-bold text-lg">F</Text>
            </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">Fleet Manager Pro</Text>
        </View>

        <View className="flex-row items-center gap-4">
          {Platform.OS === 'web' && (
            <View className="flex-row items-center gap-2 mr-4 border-r border-gray-200 dark:border-gray-700 pr-4">
               <TouchableOpacity 
                 onPress={() => router.push("/add-report")}
                 className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center gap-2"
               >
                  <Plus size={16} color="white" />
                  <Text className="text-white font-bold text-sm">Nouveau Rapport</Text>
               </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity className="p-1" onPress={() => router.push("/search")}>
            <Search size={24} color={activeColors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="p-1 relative" 
            onPress={() => router.push("/notifications")}
          >
            <Bell size={24} color={activeColors.text.primary} />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center border-2 border-white dark:border-gray-800">
                <Text className="text-white text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

