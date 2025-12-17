import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@/hooks';
import { SEARCH_QUERY } from '@/lib/graphql-queries';
import { useRouter } from 'expo-router';
import { Car, ChevronRight, FileText, Search, User, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SearchResultType {
  chauffeurs: any[];
  vehicules: any[];
  rapports: any[];
}

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  const debounceTimeout = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setDebouncedQuery(value);
        }, 500);
      };
    })(),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debounceTimeout(text);
  };

  // GraphQL search query
  const { data, loading, error } = useQuery<{ search: SearchResultType }>(
    SEARCH_QUERY,
    {
      variables: {
        query: debouncedQuery,
        organizationId: user?.organizationId,
      },
      skip: !debouncedQuery || debouncedQuery.trim().length === 0,
      fetchPolicy: 'network-only',
    }
  );

  const searchResults = data?.search;
  const hasResults =
    searchResults &&
    (searchResults.chauffeurs.length > 0 ||
      searchResults.vehicules.length > 0 ||
      searchResults.rapports.length > 0);

  return (
    <View className="flex-1 bg-gray-50 ">
      {/* Header */}
      <View className="bg-white  px-4 pt-12 pb-4 border-b border-gray-200 ">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
          >
            <X size={24} className="text-gray-700 dark:text-gray-300" />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <Search size={20} className="text-gray-400 mr-2" />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Rechercher chauffeurs, véhicules, rapports..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-gray-900 dark:text-white text-base"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <X size={18} className="text-gray-400" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Results */}
      <ScrollView className="flex-1">
        {loading && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 dark:text-gray-400 mt-4">
              Recherche en cours...
            </Text>
          </View>
        )}

        {error && (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-red-500 text-center px-4">
              Erreur lors de la recherche
            </Text>
          </View>
        )}

        {!loading && !error && debouncedQuery && !hasResults && (
          <View className="flex-1 items-center justify-center py-20">
            <Search size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <Text className="text-gray-500 dark:text-gray-400 text-center px-4">
              Aucun résultat pour "{debouncedQuery}"
            </Text>
          </View>
        )}

        {!loading && !debouncedQuery && (
          <View className="flex-1 items-center justify-center py-20">
            <Search size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <Text className="text-gray-500 dark:text-gray-400 text-center px-4">
              Commencez à taper pour rechercher
            </Text>
          </View>
        )}

        {!loading && hasResults && searchResults && (
          <View className="py-4">
            {/* Chauffeurs */}
            {searchResults.chauffeurs.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 mb-2">
                  Chauffeurs ({searchResults.chauffeurs.length})
                </Text>
                {searchResults.chauffeurs.map((chauffeur: any) => (
                  <TouchableOpacity
                    key={chauffeur.id}
                    className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700"
                    onPress={() => {
                      // Navigate to driver details
                      router.back();
                    }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
                        <User size={20} className="text-blue-600 dark:text-blue-400" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white font-semibold">
                          {chauffeur.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                          {chauffeur.email}
                        </Text>
                        {chauffeur.telephone && (
                          <Text className="text-gray-500 dark:text-gray-400 text-sm">
                            {chauffeur.telephone}
                          </Text>
                        )}
                      </View>
                      <ChevronRight size={20} className="text-gray-400" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Véhicules */}
            {searchResults.vehicules.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 mb-2">
                  Véhicules ({searchResults.vehicules.length})
                </Text>
                {searchResults.vehicules.map((vehicule: any) => (
                  <TouchableOpacity
                    key={vehicule.id}
                    className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700"
                    onPress={() => {
                      // Navigate to vehicle details
                      router.back();
                    }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mr-3">
                        <Car size={20} className="text-green-600 dark:text-green-400" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white font-semibold">
                          {vehicule.immatriculation}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                          {vehicule.marque} {vehicule.modele} ({vehicule.annee})
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                          Statut: {vehicule.statut}
                        </Text>
                      </View>
                      <ChevronRight size={20} className="text-gray-400" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Rapports */}
            {searchResults.rapports.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 mb-2">
                  Rapports ({searchResults.rapports.length})
                </Text>
                {searchResults.rapports.map((rapport: any) => (
                  <TouchableOpacity
                    key={rapport.id}
                    className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700"
                    onPress={() => {
                      // Navigate to report details
                      router.back();
                    }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 items-center justify-center mr-3">
                        <FileText size={20} className="text-orange-600 dark:text-orange-400" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white font-semibold">
                          Rapport #{rapport.id}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                          {rapport.user?.name} • {rapport.vehicule?.immatriculation}
                        </Text>
                        {rapport.incidents && (
                          <Text className="text-gray-500 dark:text-gray-400 text-sm" numberOfLines={1}>
                            {rapport.incidents}
                          </Text>
                        )}
                      </View>
                      <ChevronRight size={20} className="text-gray-400" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
