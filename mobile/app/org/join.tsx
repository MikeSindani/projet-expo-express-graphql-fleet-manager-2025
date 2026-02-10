import WebLayout from '@/components/web/WebLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@/hooks';
import { ADD_USER_TO_ORG } from '@/lib/graphql-queries';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { QrCode, Users, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JoinOrganizationScreen() {
  const [organizationId, setOrganizationId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const [joinOrg, { loading }] = useMutation(ADD_USER_TO_ORG, {
    onCompleted: (data) => {
      const updatedUser = data.addUserToOrganization;
      if (user) {
        updateUser({
          ...user,
          organizationId: organizationId,
        });
      }
      Alert.alert('Succès', 'Votre demande d\'adhésion a été envoyée. Attendez la confirmation.');
      router.replace('/(tabs)');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    }
  });

  const handleJoinOrg = () => {
    if (!organizationId) {
      Alert.alert('Erreur', 'Veuillez entrer un ID d\'organisation');
      return;
    }
    if (!user?.email) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }
    joinOrg({ 
      email: user.email,
      telephone : user.telephone,
      organizationId: organizationId 
    });
  };

  const startScanning = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission refusée', 'Nous avons besoin de la caméra pour scanner le QR code');
        return;
      }
    }
    setShowScanner(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setShowScanner(false);
    setOrganizationId(data);
    Alert.alert('QR Code scanné', `ID Organisation: ${data}`);
  };

  return (
    <WebLayout>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 px-6 justify-center">
      <View className="w-full max-w-sm mx-auto">
        <View className="items-center mb-8">
          <View className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
            <Users size={48} color="#2563eb" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Rejoindre une Organisation
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            Entrez l'ID de l'organisation ou scannez le QR Code
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID de l'Organisation
            </Text>
            <View className="flex-row items-center space-x-2">
              <TextInput
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white focus:border-blue-500"
                placeholder="ex: 12345"
                placeholderTextColor="#9ca3af"
                value={organizationId}
                onChangeText={setOrganizationId}
              />
              <TouchableOpacity
                onPress={startScanning}
                className="bg-gray-100 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <QrCode size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleJoinOrg}
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-xl items-center mt-6"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                Envoyer la demande
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="w-full py-4 rounded-xl items-center"
          >
            <Text className="text-gray-600 font-medium">Retour</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View className="flex-1 bg-black">
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          <SafeAreaView className="flex-1">
            <TouchableOpacity
              onPress={() => setShowScanner(false)}
              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full"
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1 justify-center items-center">
              <View className="border-2 border-white w-64 h-64 rounded-xl bg-transparent" />
              <Text className="text-white mt-4 font-medium bg-black/50 px-4 py-2 rounded-full">
                Placez le QR Code dans le cadre
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
      </SafeAreaView>
    </WebLayout>
  );
}
