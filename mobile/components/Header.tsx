import Colors from "@/constants/colors";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "expo-router";
import { Bell, Search } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header() {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  return (
    <View 
      className="bg-white border-b border-gray-200 shadow-sm z-50" 
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-4 py-3 h-[60px]">
        <View className="flex-row items-center gap-3">
            {/* Logo Placeholder */}
            <View className="w-8 h-8 rounded-lg bg-blue-600 items-center justify-center">
                <Text className="text-white font-bold text-lg">F</Text>
            </View>
          <Text className="text-lg font-bold text-gray-900">Fleet Manager Pro</Text>
        </View>

        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="p-1" onPress={() => router.push("/search")}>
            <Search size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="p-1 relative" 
            onPress={() => router.push("/notifications")}
          >
            <Bell size={24} color={Colors.text.primary} />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center border-2 border-white">
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
