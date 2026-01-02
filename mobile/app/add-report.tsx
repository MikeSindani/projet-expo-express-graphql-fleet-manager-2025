import { FormInput } from "@/components/ui/form/FormInput";
import Colors from "@/constants/colors";
import { useFleet } from "@/contexts/FleetContext";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Stack, useRouter } from "expo-router";
import { ChevronDown, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { z } from "zod";

const reportSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  startKm: z.string().min(1, "Le kilométrage de départ est requis"),
  endKm: z.string().min(1, "Le kilométrage de fin est requis"),
  incidents: z.string().optional(),
  comments: z.string().optional(),
  driverId: z.string().min(1, "Le chauffeur est requis"),
  vehicleId: z.string().min(1, "Le véhicule est requis"),
});

export default function AddReportScreen() {
  const router = useRouter();
  const { chauffeurs, vehicules, addRapport, refreshFleetData } = useFleet();
  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFleetData();
    setRefreshing(false);
  }, [refreshFleetData]);

  const form = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      startKm: "",
      endKm: "",
      incidents: "",
      comments: "",
      driverId: "",
      vehicleId: "",
    },
    validatorAdapter: zodValidator() as any,
    onSubmit: async ({ value }) => {
      const startKmNum = parseFloat(value.startKm);
      const endKmNum = parseFloat(value.endKm);

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
          date: value.date,
          kilometrage: endKmNum - startKmNum,
          incidents: value.incidents,
          commentaires: value.comments,
          chauffeurId: value.driverId,
          vehiculeId: parseInt(value.vehicleId)
        });
        Alert.alert("Succès", "Rapport ajouté avec succès");
        router.back();
      } catch (error: any) {
        Alert.alert("Erreur", error.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    },
  });

  const selectedDriver = chauffeurs.find(c => c.id === form.getFieldValue("driverId"));
  const selectedVehicle = vehicules.find(v => v.id.toString() === form.getFieldValue("vehicleId"));
  const RefreshControlComponent = RefreshControl as any;

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
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControlComponent refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chauffeur *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowDriverPicker(!showDriverPicker)}
            >
              <Text
                style={[
                  styles.pickerText,
                  !form.getFieldValue("driverId") && styles.placeholderText,
                ]}
              >
                {selectedDriver ? selectedDriver.name : "Sélectionner un chauffeur"}
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
                      form.setFieldValue("driverId", chauffeur.id);
                      setShowDriverPicker(false);
                      // Auto-select assigned vehicle
                      const assignedVehicle = vehicules.find(v => v.driver?.id === chauffeur.id || v.driverId === chauffeur.id);
                      if (assignedVehicle) {
                        form.setFieldValue("vehicleId", assignedVehicle.id.toString());
                      }
                    }}
                  >
                    <Text style={styles.pickerItemText}>{chauffeur.name}</Text>
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
                  !form.getFieldValue("vehicleId") && styles.placeholderText,
                ]}
              >
                {selectedVehicle
                  ? `${selectedVehicle.marque} ${selectedVehicle.modele} (${selectedVehicle.immatriculation})`
                  : "Sélectionner un véhicule"}
              </Text>
              <ChevronDown size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
            {showVehiclePicker && (
              <View style={styles.pickerList}>
                {vehicules
                  .map((vehicule: any) => (
                    <TouchableOpacity
                      key={vehicule.id}
                      style={styles.pickerItem}
                      onPress={() => {
                        form.setFieldValue("vehicleId", vehicule.id.toString());
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

          <form.Field
            name="date"
            validators={{ onChange: reportSchema.shape.date }}
            children={(field) => (
              <FormInput
                label="Date *"
                placeholder="YYYY-MM-DD"
                field={field}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <form.Field
                name="startKm"
                validators={{ onChange: reportSchema.shape.startKm }}
                children={(field) => (
                  <FormInput
                    label="Km départ *"
                    placeholder="10000"
                    keyboardType="numeric"
                    field={field}
                  />
                )}
              />
            </View>

            <View style={styles.halfWidth}>
              <form.Field
                name="endKm"
                validators={{ onChange: reportSchema.shape.endKm }}
                children={(field) => (
                  <FormInput
                    label="Km arrivée *"
                    placeholder="10250"
                    keyboardType="numeric"
                    field={field}
                  />
                )}
              />
            </View>
          </View>

          <form.Field
            name="incidents"
            children={(field) => (
              <FormInput
                label="Incidents"
                placeholder="Décrire les incidents éventuels..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                field={field}
                className="min-h-[80]"
              />
            )}
          />

          <form.Field
            name="comments"
            children={(field) => (
              <FormInput
                label="Commentaires"
                placeholder="Ajouter des commentaires..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                field={field}
                className="min-h-[80]"
              />
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <TouchableOpacity
                style={[styles.submitButton, (loading || !canSubmit || isSubmitting) && { opacity: 0.7 }]}
                onPress={() => form.handleSubmit()}
                disabled={loading || !canSubmit || isSubmitting}
              >
                {loading || isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Créer le rapport</Text>
                )}
              </TouchableOpacity>
            )}
          />
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
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
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
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
