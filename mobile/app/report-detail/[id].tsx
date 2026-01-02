import { useAuth } from '@/contexts/AuthContext';
import { useFleet } from '@/contexts/FleetContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { AlertCircle, ArrowLeft, Edit2, FileText, Printer, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const { rapports, chauffeurs, vehicules, updateRapport, deleteRapport, isLoading } = useFleet();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const rapport = rapports.find(r => r.id === id);
  const chauffeur = chauffeurs.find(c => c.id === rapport?.chauffeurId);
  const vehicule = vehicules.find(v => v.id === rapport?.vehiculeId?.toString());

  const [isEditing, setIsEditing] = useState(false);
  const [kilometrage, setKilometrage] = useState('');
  const [incidents, setIncidents] = useState('');
  const [commentaires, setCommentaires] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rapport) {
      setKilometrage(rapport.kilometrage.toString());
      setIncidents(rapport.incidents || '');
      setCommentaires(rapport.commentaires || '');
    }
  }, [rapport]);

  if (isLoading || !rapport) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const handleUpdate = async () => {
    if (!kilometrage) {
      Alert.alert("Erreur", "Le kilométrage est requis.");
      return;
    }
    setIsSaving(true);
    try {
      await updateRapport(rapport.id, { 
        kilometrage: parseInt(kilometrage), 
        incidents, 
        commentaires 
      });
      setIsEditing(false);
      Alert.alert("Succès", "Rapport mis à jour.");
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de mettre à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer le rapport",
      "Êtes-vous sûr de vouloir supprimer ce rapport ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteRapport(rapport.id);
              router.back();
            } catch (error: any) {
              Alert.alert("Erreur", error.message || "Impossible de supprimer.");
            }
          } 
        },
      ]
    );
  };

  const printReport = async () => {
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica'; padding: 20px; color: #333; }
            h1 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; margin-top: 5px; }
            .grid { display: flex; flex-wrap: wrap; }
            .col { flex: 1; min-width: 200px; margin-bottom: 15px; }
            .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Rapport d'Activité FleetManager</h1>
          <div class="section">
            <div class="label">Date du rapport</div>
            <div class="value">${new Date(rapport.date).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div class="grid">
            <div class="col">
              <div class="label">Chauffeur</div>
              <div class="value">${chauffeur?.name || 'Inconnu'}</div>
            </div>
            <div class="col">
              <div class="label">Véhicule</div>
              <div class="value">${vehicule ? `${vehicule.marque} ${vehicule.modele} (${vehicule.immatriculation})` : 'Inconnu'}</div>
            </div>
          </div>
          <div class="section">
            <div class="label">Distance parcourue</div>
            <div class="value">${rapport.kilometrage} km</div>
          </div>
          <div class="section">
            <div class="label">Incidents</div>
            <div class="value">${rapport.incidents || 'Aucun incident signalé'}</div>
          </div>
          <div class="section">
            <div class="label">Commentaires</div>
            <div class="value">${rapport.commentaires || 'Aucun commentaire'}</div>
          </div>
          <div class="footer">
            Généré par FleetManager App le ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de générer le PDF.");
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1 px-4 py-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Détails Rapport
            </Text>
          </View>
          <TouchableOpacity onPress={printReport} className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
            <Printer size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
          <View className="flex-row items-center mb-6">
            <View className={`w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 items-center justify-center mr-4`}>
              <FileText size={32} color="#3b82f6" />
            </View>
            <View>
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Date(rapport.date).toLocaleDateString("fr-FR", { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              <Text className="text-gray-500 text-sm">{chauffeur?.name || 'Chauffeur inconnu'}</Text>
            </View>
          </View>

          <View className="space-y-6">
            <View className="flex-row gap-4">
               <View className="flex-1">
                <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Véhicule</Text>
                <View className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {vehicule ? `${vehicule.marque} ${vehicule.modele}` : 'Inconnu'}
                  </Text>
                  <Text className="text-gray-500 text-xs">{vehicule?.immatriculation || '---'}</Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Kilométrage</Text>
                {isEditing ? (
                  <TextInput
                    value={kilometrage}
                    onChangeText={setKilometrage}
                    keyboardType="numeric"
                    className={`p-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} font-bold`}
                  />
                ) : (
                  <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                    <Text className="text-blue-600 dark:text-blue-400 font-bold text-lg">{rapport.kilometrage} km</Text>
                  </View>
                )}
              </View>
            </View>

            <View>
              <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Incidents</Text>
              {isEditing ? (
                <TextInput
                  value={incidents}
                  onChangeText={setIncidents}
                  multiline
                  placeholder="Signaler un incident..."
                  className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} min-h-[80px]`}
                />
              ) : (
                <View className={`p-4 rounded-xl ${rapport.incidents ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  {rapport.incidents ? (
                    <View className="flex-row gap-2">
                      <AlertCircle size={16} color="#f97316" />
                      <Text className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{rapport.incidents}</Text>
                    </View>
                  ) : (
                    <Text className="text-gray-400 italic">Aucun incident</Text>
                  )}
                </View>
              )}
            </View>

            <View>
              <Text className="text-gray-500 text-xs uppercase font-bold mb-1 ml-1">Commentaires</Text>
              {isEditing ? (
                <TextInput
                  value={commentaires}
                  onChangeText={setCommentaires}
                  multiline
                  placeholder="Vos commentaires..."
                  className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} min-h-[100px]`}
                />
              ) : (
                <View className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {rapport.commentaires || 'Aucun commentaire'}
                  </Text>
                </View>
              )}
            </View>
          </View>

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
                  <Text className="text-white font-bold ml-2">Modifier le rapport</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleDelete} 
                  className="w-full bg-red-100 p-4 rounded-2xl flex-row items-center justify-center"
                >
                  <Trash2 size={20} color="#ef4444" />
                  <Text className="text-red-700 font-bold ml-2">Supprimer le rapport</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
