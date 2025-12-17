import { ApolloProvider } from '@apollo/client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./contexts/AuthContext";
import { FleetProvider } from "./contexts/FleetContext";
import { client } from "./lib/apollo";

console.log('AuthProvider:', AuthProvider);
console.log('FleetProvider:', FleetProvider);
console.log('client:', client);
console.log('ApolloProvider:', ApolloProvider);
console.log('QueryClient:', QueryClient);
console.log('QueryClientProvider:', QueryClientProvider);
console.log('Stack:', Stack);
console.log('GestureHandlerRootView:', GestureHandlerRootView);
console.log('SafeAreaProvider:', SafeAreaProvider);
