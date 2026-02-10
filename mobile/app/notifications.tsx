import WebLayout from '@/components/web/WebLayout';
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { Bell, BellOff, CheckCheck, Clock, FileText, X } from 'lucide-react-native';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const { isDark } = useTheme();

  return (
    <WebLayout>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Notifications",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              className="ml-2 p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              <X size={20} color={isDark ? '#f3f4f6' : '#111827'} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            unreadCount > 0 && (
              <TouchableOpacity 
                onPress={markAllAsRead}
                className="mr-2 flex-row items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
              >
                <CheckCheck size={16} color={isDark ? '#60a5fa' : '#2563eb'} />
                <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">Tout lire</Text>
              </TouchableOpacity>
            )
          ),
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            color: isDark ? '#ffffff' : '#111827',
            fontWeight: 'bold',
          }
        }}
      />
      
      <View className="flex-1 px-4">
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-10">
            <View className="w-32 h-32 bg-gray-100 dark:bg-gray-900 rounded-full items-center justify-center mb-8 shadow-inner">
               <BellOff size={64} color="#94a3b8" />
            </View>
            <Text className="text-3xl font-black text-gray-900 dark:text-white mb-3 text-center">
              C'est calme ici
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center text-lg leading-6 font-medium">
              Nous vous préviendrons dès qu'il y aura du nouveau concernant votre flotte.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerClassName="py-4"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                className={`mb-4 p-5 rounded-[28px] border-2 shadow-sm ${
                  item.read 
                    ? 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800' 
                    : 'bg-white border-blue-500/20 dark:bg-gray-900 dark:border-blue-500/30 shadow-lg shadow-blue-500/10'
                }`}
                onPress={() => markAsRead(item.id)}
              >
                <View className="flex-row items-start gap-4">
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center shadow-inner ${
                    item.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-600'
                  }`}>
                    {item.message.toLowerCase().includes('rapport') ? (
                      <FileText size={28} color={item.read ? "#64748b" : "white"} />
                    ) : (
                      <Bell size={28} color={item.read ? "#64748b" : "white"} />
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text 
                        numberOfLines={3}
                        className={`text-lg leading-6 ${
                          item.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white font-extrabold'
                        }`}
                      >
                        {item.message}
                      </Text>
                      {!item.read && (
                        <View className="w-3 h-3 rounded-full bg-blue-600 ml-2 mt-1 shadow-lg shadow-blue-500" />
                      )}
                    </View>
                    
                    <View className="flex-row items-center gap-2 mt-2">
                       <Clock size={14} color="#94a3b8" />
                       <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-tight">
                        {new Date(item.timestamp).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      </SafeAreaView>
    </WebLayout>
  );
}
