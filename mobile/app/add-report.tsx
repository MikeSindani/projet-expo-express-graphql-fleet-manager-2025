import Colors from "@/constants/colors";
import { useFleet } from "@/contexts/FleetContext";
import { Stack, useRouter } from "expo-router";
import { ChevronDown, X } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
export default function AddReportScreen() {
  const router = useRouter();
  const { chauffeurs, vehicules, addRapport } = useFleet();
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [incidents, setIncidents] = useState("");
  const [comments, setComments] = useState("");
  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDriver || !selectedVehicle || !date || !startKm || !endKm) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    const startKmNum = parseFloat(startKm);
    const endKmNum = parseFloat(endKm);

    if (isNaN(startKmNum) || isNaN(endKmNum)) {
      Alert.alert("Erreur", "Kilométrage invalide");
      return;
    }

    if (endKmNum < startKmNum) {
      Alert.alert("Erreur", "Le kilométrage de fin doit être supérieur au kilométrage de départ");
      return;
    }

    setLoading(true);
    try {
      await addRapport({
        date,
        kilometrage: endKmNum - startKmNum, // Assuming kilometrage is distance driven
        incidents,
        commentaires: comments,
        chauffeurId: selectedDriver,
        vehiculeId: parseInt(selectedVehicle)
      });
      Alert.alert("Succès", "Rapport ajouté avec succès");
      router.back();
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const selectedDriverData = chauffeurs.find((c: any) => c.id === selectedDriver);
  const selectedVehicleData = vehicules.find((v: any) => v.id === selectedVehicle || v.id === parseInt(selectedVehicle));

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
          title: "Nouveau rapport",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chauffeur *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowDriverPicker(!showDriverPicker)}
            >
              <Text
                style={[
                  styles.pickerText,
                  !selectedDriver && styles.placeholderText,
                ]}
              >
                {selectedDriverData
                  ? selectedDriverData.name
                  : "Sélectionner un chauffeur"}
              </Text>
              <ChevronDown size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
            {showDriverPicker && (
              <View style={styles.pickerList}>
                {chauffeurs.map((chauffeur: any) => (
                  <TouchableOpacity
                    key={chauffeur.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setSelectedDriver(chauffeur.id);
                      setShowDriverPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>
                      {chauffeur.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Véhicule *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowVehiclePicker(!showVehiclePicker)}
            >
              <Text
                style={[
                  styles.pickerText,
                  !selectedVehicle && styles.placeholderText,
                ]}
              >
                {selectedVehicleData
                  ? `${selectedVehicleData.marque} ${selectedVehicleData.modele} (${selectedVehicleData.immatriculation})`
                  : "Sélectionner un véhicule"}
              </Text>
              <ChevronDown size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
            {showVehiclePicker && (
              <View style={styles.pickerList}>
                {vehicules.map((vehicule: any) => (
                  <TouchableOpacity
                    key={vehicule.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setSelectedVehicle(vehicule.id.toString());
                      setShowVehiclePicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>
                      {vehicule.marque} {vehicule.modele} ({vehicule.immatriculation})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Km départ *</Text>
              <TextInput
                style={styles.input}
                value={startKm}
                onChangeText={setStartKm}
                placeholder="10000"
                keyboardType="numeric"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Km arrivée *</Text>
              <TextInput
                style={styles.input}
                value={endKm}
                onChangeText={setEndKm}
                placeholder="10250"
                keyboardType="numeric"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Incidents</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={incidents}
              onChangeText={setIncidents}
              placeholder="Décrire les incidents éventuels..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Commentaires</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={comments}
              onChangeText={setComments}
              placeholder="Ajouter des commentaires..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Créer le rapport</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 80,
  },
  picker: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  placeholderText: {
    color: Colors.gray[400],
  },
  pickerList: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
