import { useAuth } from '@/contexts/AuthContext';
import { useFleet } from '@/contexts/FleetContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getImageUrl } from '@/utils/images';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Car, Edit2, Hash, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams();
  const { vehicules, updateVehicule, deleteVehicule, isLoading } = useFleet();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const vehicule = vehicules.find(v => v.id.toString() === id?.toString());
  const isManager = user?.role === "GESTIONNAIRE" || user?.role === "ADMIN";

  const [isEditing, setIsEditing] = useState(false);
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [annee, setAnnee] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [statut, setStatut] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (vehicule) {
      setMarque(vehicule.marque);
      setModele(vehicule.modele);
      setAnnee(vehicule.annee.toString());
      setImmatriculation(vehicule.immatriculation);
      setStatut(vehicule.statut);
    }
  }, [vehicule]);

  if (isLoading || !vehicule) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const handleUpdate = async () => {
    if (!marque || !modele || !immatriculation) {
      Alert.alert("Erreur", "Tous les champs sont requis.");
      return;
    }
    setIsSaving(true);
    try {
      await updateVehicule(vehicule.id, { 
        marque, 
        modele, 
        annee: parseInt(annee), 
        immatriculation, 
        statut 
      });
      setIsEditing(false);
      Alert.alert("Succès", "Informations mises à jour.");
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de mettre à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer le véhicule",
      "Êtes-vous sûr de vouloir supprimer ce véhicule ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteVehicule(vehicule.id);
              router.back();
            } catch (error: any) {
              Alert.alert("Erreur", error.message || "Impossible de supprimer.");
            }
          } 
        },
      ]
    );
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Disponible": return "#22c55e";
      case "En réparation": return "#f59e0b";
      case "Indisponible": return "#ef4444";
      default: return "#9ca3af";
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1 px-4 py-6">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Détails Véhicule
          </Text>
        </View>

        <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
          <View className="items-center mb-6">
            <View className={`w-full h-48 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 items-center justify-center mb-4 overflow-hidden`}>
              {vehicule.image ? (
                <Image 
                  source={{ uri: getImageUrl(vehicule.image) }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Car size={64} color="#3b82f6" />
              )}
            </View>
            {!isEditing ? (
              <>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{vehicule.marque} {vehicule.modele}</Text>
                <View className="mt-2 px-4 py-1.5 rounded-xl" style={{ backgroundColor: getStatusColor(vehicule.statut) + "20" }}>
                  <Text className="text-sm font-bold capitalize" style={{ color: getStatusColor(vehicule.statut) }}>
                    {vehicule.statut}
                  </Text>
                </View>
              </>
            ) : (
              <View className="w-full space-y-3">
                 <TextInput
                  value={marque}
                  onChangeText={setMarque}
                  className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} text-center font-bold`}
                  placeholder="Marque"
                />
                <TextInput
                  value={modele}
                  onChangeText={setModele}
                  className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} text-center font-bold`}
                  placeholder="Modèle"
                />
              </View>
            )}
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Immatriculation</Text>
              {isEditing ? (
                <TextInput
                  value={immatriculation}
                  onChangeText={setImmatriculation}
                  autoCapitalize="characters"
                  className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              ) : (
                <View className="flex-row items-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <Hash size={18} color="#6b7280" />
                  <Text className={`ml-2 text-xl font-bold tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}>{vehicule.immatriculation}</Text>
                </View>
              )}
            </View>

            <View>
              <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Année</Text>
              {isEditing ? (
                <TextInput
                  value={annee}
                  onChangeText={setAnnee}
                  keyboardType="numeric"
                  className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              ) : (
                <Text className={`p-1 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{vehicule.annee}</Text>
              )}
            </View>

            {isEditing && (
              <View>
                <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Statut</Text>
                <View className={`rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <Picker
                    selectedValue={statut}
                    onValueChange={(itemValue) => setStatut(itemValue)}
                    style={{ color: isDark ? 'white' : 'black' }}
                  >
                    <Picker.Item label="Disponible" value="Disponible" />
                    <Picker.Item label="En réparation" value="En réparation" />
                    <Picker.Item label="Indisponible" value="Indisponible" />
                  </Picker>
                </View>
              </View>
            )}

            <View className="mt-4">
              <Text className="text-gray-500 text-xs uppercase font-bold mb-2 ml-1">Carte Grise</Text>
              <View className={`w-full h-48 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600`}>
                {vehicule.registrationCardImage ? (
                  <Image 
                    source={{ uri: getImageUrl(vehicule.registrationCardImage) }} 
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-gray-400">Aucune image disponible</Text>
                )}
              </View>
            </View>
          </View>

          {isManager && (
            <View className="mt-8 space-y-3">
              {isEditing ? (
                <View className="flex-row gap-3">
                  <TouchableOpacity 
                    onPress={() => setIsEditing(false)} 
                    className="flex-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-2xl"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleUpdate} 
                    className="flex-1 bg-blue-600 p-4 rounded-2xl"
                    disabled={isSaving}
                  >
                    {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-center">Enregistrer</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TouchableOpacity 
                    onPress={() => setIsEditing(true)} 
                    className="w-full bg-blue-600 p-4 rounded-2xl flex-row items-center justify-center"
                  >
                    <Edit2 size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Modifier le véhicule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleDelete} 
                    className="w-full bg-red-100 p-4 rounded-2xl flex-row items-center justify-center"
                  >
                    <Trash2 size={20} color="#ef4444" />
                    <Text className="text-red-700 font-bold ml-2">Supprimer le véhicule</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
