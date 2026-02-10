import WebLayout from '@/components/web/WebLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { graphqlClient } from '@/lib/graphql-client';
import { SEARCH_QUERY } from '@/lib/graphql-queries';
import { useRouter } from 'expo-router';
import { ArrowLeft, Car, FileText, Search, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({
    chauffeurs: [],
    vehicules: [],
    rapports: [],
  });

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setSearchResults({ chauffeurs: [], vehicules: [], rapports: [] });
      return;
    }

    setLoading(true);
    try {
      const data = await graphqlClient.query(SEARCH_QUERY, { query: text });
      setSearchResults(data.search);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasResults =
    searchResults.chauffeurs.length > 0 ||
    searchResults.vehicules.length > 0 ||
    searchResults.rapports.length > 0;

  return (
    <WebLayout>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Search Header */}
      <View className="px-6 pb-6 pt-2 bg-white dark:bg-gray-900 shadow-sm rounded-b-[40px]">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800"
          >
            <ArrowLeft size={24} color={isDark ? '#fff' : '#1f2937'} />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-3xl px-4 py-3 border-2 border-transparent focus:border-blue-500/30">
            <Search size={22} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-lg font-medium text-gray-900 dark:text-gray-100"
              placeholder="Rechercher tout..."
              placeholderTextColor="#94a3b8"
              value={query}
              onChangeText={handleSearch}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <View className="bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
                  <X size={16} color={isDark ? '#cbd5e1' : '#64748b'} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Results */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-4 text-gray-500 font-bold">Recherche en cours...</Text>
          </View>
        ) : !hasResults && query.length >= 2 ? (
          <View className="items-center py-20 px-10">
            <View className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full items-center justify-center mb-6">
               <Search size={40} color="#cbd5e1" />
            </View>
            <Text className="text-2xl font-black text-gray-900 dark:text-white text-center mb-2">
              Désolé
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center text-lg leading-6 font-medium">
              Nous n'avons trouvé aucun résultat pour "{query}"
            </Text>
          </View>
        ) : query.length < 2 ? (
            <View className="items-center py-20 px-10">
                <Text className="text-gray-400 font-bold text-lg">Saisissez au moins 2 caractères</Text>
            </View>
        ) : (
          <View className="p-6 pb-20">
            {/* Chauffeurs */}
            {searchResults.chauffeurs.length > 0 && (
              <View className="mb-8">
                <View className="flex-row items-center gap-2 mb-4">
                    <View className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <Text className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    Chauffeurs
                    </Text>
                </View>
                {searchResults.chauffeurs.map((chauffeur: any) => (
                  <TouchableOpacity
                    key={chauffeur.id}
                    activeOpacity={0.8}
                    className="bg-white dark:bg-gray-900 p-5 rounded-3xl mb-3 shadow-sm border border-gray-100 dark:border-gray-800"
                    onPress={() => router.push(`/driver-detail/${chauffeur.id}` as any)}
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 items-center justify-center">
                        <User size={28} color="#2563eb" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                          {chauffeur.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 font-medium">
                          {chauffeur.email || chauffeur.telephone}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Véhicules */}
            {searchResults.vehicules.length > 0 && (
              <View className="mb-8">
                <View className="flex-row items-center gap-2 mb-4">
                    <View className="w-1.5 h-6 bg-green-600 rounded-full" />
                    <Text className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    Véhicules
                    </Text>
                </View>
                {searchResults.vehicules.map((vehicule: any) => (
                  <TouchableOpacity
                    key={vehicule.id}
                    activeOpacity={0.8}
                    className="bg-white dark:bg-gray-900 p-5 rounded-3xl mb-3 shadow-sm border border-gray-100 dark:border-gray-800"
                    onPress={() => router.push(`/vehicle-detail/${vehicule.id}` as any)}
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/40 items-center justify-center">
                        <Car size={28} color="#16a34a" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                          {vehicule.modele}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest text-xs">
                          {vehicule.immatriculation}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Rapports */}
            {searchResults.rapports.length > 0 && (
              <View>
                <View className="flex-row items-center gap-2 mb-4">
                    <View className="w-1.5 h-6 bg-orange-600 rounded-full" />
                    <Text className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    Rapports
                    </Text>
                </View>
                {searchResults.rapports.map((rapport: any) => (
                  <TouchableOpacity
                    key={rapport.id}
                    activeOpacity={0.8}
                    className="bg-white dark:bg-gray-900 p-5 rounded-3xl mb-3 shadow-sm border border-gray-100 dark:border-gray-800"
                    onPress={() => router.push(`/report-detail/${rapport.id}` as any)}
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/40 items-center justify-center">
                        <FileText size={28} color="#ea580c" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                          Rapport #{rapport.id}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 font-medium italic" numberOfLines={1}>
                          {rapport.commentaires || 'Aucun commentaire'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      </SafeAreaView>
    </WebLayout>
  );
}
