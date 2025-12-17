import Colors from "@/constants/colors";
import { useNotifications } from "@/contexts/NotificationContext";
import { Stack, useRouter } from "expo-router";
import { Bell, X } from "lucide-react-native";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationPress = (id: string) => {
    markAsRead(id);
  };

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
          title: "Notifications",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text className="text-blue-600 font-semibold" >Tout marquer lu</Text>
              </TouchableOpacity>
            )
          ),
        }}
      />
      
      <View className="flex-1 bg-gray-50">
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Bell size={64} color={Colors.gray[300]} />
            <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              Aucune notification
            </Text>
            <Text className="text-base text-gray-600 text-center px-10">
              Vous recevrez des notifications ici lorsque de nouveaux rapports seront créés
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerClassName="p-4"
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`mb-3 p-4 rounded-xl border ${
                  item.read 
                    ? 'bg-white border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
                onPress={() => handleNotificationPress(item.id)}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className={`text-base ${item.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                      {item.message}
                    </Text>
                    {item.timestamp && (
                      <Text className="text-sm text-gray-500 mt-1">
                        {new Date(item.timestamp).toLocaleString('fr-FR')}
                      </Text>
                    )}
                  </View>
                  {!item.read && (
                    <View className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </>
  );
}
