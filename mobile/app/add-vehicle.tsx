import DocumentImagePicker from "@/components/DocumentImagePicker";
import { FormInput } from "@/components/ui/form/FormInput";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { useUploadFile } from "@/hooks/useUploadFile";
import { UPLOAD_FILE } from "@/lib/graphql-queries";
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
    View,
} from "react-native";
import { z } from "zod";

const vehicleSchema = z.object({
  registration: z.string().min(1, "L'immatriculation est requise"),
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  year: z.string().regex(/^\d{4}$/, "Année invalide").transform(Number),
  driverId: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
});

export default function AddVehicleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addVehicule, chauffeurs, refreshFleetData } = useFleet();
  const { mutate: uploadFile, isLoading: isUploading } = useUploadFile(UPLOAD_FILE);
  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // images
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  const [regCardImage, setRegCardImage] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFleetData();
    setRefreshing(false);
  }, [refreshFleetData]);

  const form = useForm({
    defaultValues: {
      registration: "",
      brand: "",
      model: "",
      year: new Date().getFullYear().toString(),
      driverId: "",
      status: "Disponible",
    },
    validatorAdapter: zodValidator() as any,
    onSubmit: async ({ value }) => {
      setLoading(true);
      try {
        let uploadedVehicleImage = "";
        let uploadedRegCardImage = "";

        if (vehicleImage && !vehicleImage.startsWith("http")) {
          uploadedVehicleImage = await uploadFile({ file: vehicleImage, folder: 'vehicule' });
        } else if (vehicleImage) {
          uploadedVehicleImage = vehicleImage;
        }

        if (regCardImage && !regCardImage.startsWith("http")) {
          uploadedRegCardImage = await uploadFile({ file: regCardImage, folder: 'vehicule' });
        } else if (regCardImage) {
          uploadedRegCardImage = regCardImage;
        }

        await addVehicule({
          immatriculation: value.registration.toUpperCase(),
          marque: value.brand,
          modele: value.model,
          annee: parseInt(value.year as any),
          userId: user?.id || "",
          driverId: value.driverId || null,
          image: uploadedVehicleImage,
          registrationCardImage: uploadedRegCardImage,
          statut: value.status,
        });
        
        Alert.alert("Succès", "Véhicule ajouté avec succès");
        router.back();
      } catch (error: any) {
        Alert.alert("Erreur", error.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    },
  });

  if (user?.role === "CHAUFFEUR") {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Stack.Screen options={{ title: "Accès refusé" }} />
        <Text style={{ fontSize: 18, textAlign: 'center', color: Colors.text.primary, marginBottom: 20 }}>
          Seuls les administrateurs et gestionnaires peuvent ajouter un véhicule.
        </Text>
        <TouchableOpacity style={styles.submitButton} onPress={() => router.back()}>
          <Text style={styles.submitButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedDriver = chauffeurs.find(c => c.id === form.getFieldValue("driverId"));
  const RefreshControlComponent = RefreshControl as any;

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
          title: "Nouveau véhicule",
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
          <form.Field
            name="registration"
            validators={{
              onChange: vehicleSchema.shape.registration,
            }}
            children={(field) => (
              <FormInput
                field={field}
                label="Immatriculation *"
                placeholder="ex: AA-123-BB"
                autoCapitalize="characters"
              />
            )}
          />

          <form.Field
            name="brand"
            validators={{
              onChange: vehicleSchema.shape.brand,
            }}
            children={(field) => (
              <FormInput
                field={field}
                label="Marque *"
                placeholder="ex: Toyota"
              />
            )}
          />

          <form.Field
            name="model"
            validators={{
              onChange: vehicleSchema.shape.model,
            }}
            children={(field) => (
              <FormInput
                field={field}
                label="Modèle *"
                placeholder="ex: Corolla"
              />
            )}
          />

          <form.Field
            name="year"
            validators={{
              onChange: vehicleSchema.shape.year,
            }}
            children={(field) => (
              <FormInput
                field={field}
                label="Année *"
                placeholder="ex: 2024"
                keyboardType="number-pad"
              />
            )}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chauffeur assigné (optionnel)</Text>
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
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    form.setFieldValue("driverId", "");
                    setShowDriverPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, { color: Colors.gray[400] }]}>
                    Aucun chauffeur
                  </Text>
                </TouchableOpacity>
                {chauffeurs.map((chauffeur) => (
                  <TouchableOpacity
                    key={chauffeur.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      form.setFieldValue("driverId", chauffeur.id);
                      setShowDriverPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{chauffeur.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Statut du véhicule *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
            >
              <Text style={styles.pickerText}>
                {form.getFieldValue("status")}
              </Text>
              <ChevronDown size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
            {showStatusPicker && (
              <View style={styles.pickerList}>
                {["Disponible", "En réparation", "Indisponible"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.pickerItem}
                    onPress={() => {
                      form.setFieldValue("status", status);
                      setShowStatusPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo du véhicule</Text>
            <DocumentImagePicker
              imageUri={vehicleImage}
              onImageSelected={setVehicleImage}
              label="Sélectionner une photo"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Carte rose (Carte grise)</Text>
            <DocumentImagePicker
              imageUri={regCardImage}
              onImageSelected={setRegCardImage}
              label="Sélectionner la carte rose"
            />
          </View>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!canSubmit || isSubmitting || loading) && { opacity: 0.7 },
                ]}
                onPress={() => form.handleSubmit()}
                disabled={!canSubmit || isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Ajouter le véhicule</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
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
    marginTop: 4,
    overflow: "hidden",
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemText: {
    fontSize: 15,
    color: Colors.text.primary,
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
    fontWeight: "600",
  },
});



