import { AuthProvider } from "@/contexts/AuthContext";
import { FleetProvider } from "@/contexts/FleetContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
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
      <Stack.Screen name="add-driver" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-vehicle" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-report" options={{ presentation: "modal" }} />
      <Stack.Screen name="notifications" options={{ presentation: "modal" }} />
      <Stack.Screen name="search" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="driver-detail/[id]" options={{ title: "Détails Chauffeur" }} />
      <Stack.Screen name="vehicle-detail/[id]" options={{ title: "Détails Véhicule" }} />
      <Stack.Screen name="report-detail/[id]" options={{ title: "Détails Rapport" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

