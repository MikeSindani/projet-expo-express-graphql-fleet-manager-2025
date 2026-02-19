import { AuthProvider } from "@/contexts/AuthContext";
import { FleetProvider } from "@/contexts/FleetContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();

  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Retour",
        headerStyle: {
          backgroundColor: isDark ? '#111827' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#111827',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      <Stack.Screen name="auth/phone-login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/phone-register" options={{ headerShown: false }} />
      <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="auth/forgot-password-phone" options={{ headerShown: false }} />
      <Stack.Screen name="org/create" options={{ headerShown: false }} />
      <Stack.Screen name="org/join" options={{ headerShown: false }} />
      <Stack.Screen name="org/waiting" options={{ headerShown: false }} />
      <Stack.Screen name="add-driver" options={{ presentation: "modal", title: "Nouveau chauffeur" }} />
      <Stack.Screen name="add-vehicle" options={{ presentation: "modal", title: "Nouveau véhicule" }} />
      <Stack.Screen name="add-report" options={{ presentation: "modal", title: "Nouveau rapport" }} />
      <Stack.Screen name="notifications" options={{ presentation: "modal", title: "Notifications" }} />
      <Stack.Screen name="search" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="driver-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="vehicle-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="report-detail/[id]" options={{ headerShown: false }} /> 
      {/* Forced update */} 
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
      <ThemeProvider>
        <AuthProvider>
          <FleetProvider>
            <NotificationProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                  <RootLayoutNav />
                </SafeAreaProvider>
              </GestureHandlerRootView>
            </NotificationProvider>
          </FleetProvider>
        </AuthProvider>
      </ThemeProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

