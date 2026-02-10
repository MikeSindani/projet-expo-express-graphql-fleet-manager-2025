import DocumentImagePicker from "@/components/DocumentImagePicker";
import MultiImagePicker from "@/components/MultiImagePicker";
import { FormInput } from "@/components/ui/form/FormInput";
import WebLayout from '@/components/web/WebLayout';
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useUploadFile } from "@/hooks/useUploadFile";
import { UPLOAD_FILE } from "@/lib/graphql-queries";
import { imageApi } from "@/lib/imageApi";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Car, ChevronDown, Hash, Truck, User, X } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const { isDark } = useTheme();
  const { addVehicule, chauffeurs } = useFleet();
  const { mutate: uploadFile } = useUploadFile(UPLOAD_FILE);
  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // images
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  const [regCardImage, setRegCardImage] = useState<string | null>(null);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);

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
    onSubmit: async ({ value }: { value: any }) => {
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

        const result = await addVehicule({
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
        
        if (result && result.id && vehicleImages.length > 0) {
          try {
            await imageApi.uploadMultiple(vehicleImages, 'vehicule', result.id.toString());
          } catch (uploadError) {
            console.error("Secondary images upload failed:", uploadError);
          }
        }
        
        Alert.alert("Succès", "Le véhicule a été ajouté avec succès");
        router.back();
      } catch (error: any) {
        Alert.alert("Erreur", error.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    },
  } as any);

  if (user?.role === "CHAUFFEUR") {
    return (
      <View className={`flex-1 justify-center items-center p-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Stack.Screen options={{ title: "Accès refusé" }} />
        <View className="bg-white dark:bg-gray-900 p-8 rounded-[40px] items-center shadow-xl border border-gray-100 dark:border-gray-800">
           <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-6">
              <X size={40} color="#ef4444" />
           </View>
           <Text className={`text-xl font-black text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
             Action non autorisée
           </Text>
           <Text className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
             Seuls les administrateurs et gestionnaires peuvent ajouter un véhicule au parc.
           </Text>
           <TouchableOpacity 
             className="bg-blue-600 w-full py-4 rounded-2xl shadow-lg shadow-blue-500/30"
             onPress={() => router.back()}
           >
             <Text className="text-white font-black text-center">RETOURNER</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  }

  const selectedDriver = chauffeurs.find(c => c.id === form.getFieldValue("driverId"));

  return (
    <WebLayout>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Header */}
          <View className="flex-row items-center justify-between mb-8 pt-2">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <ArrowLeft size={20} color={isDark ? '#f3f4f6' : '#111827'} />
            </TouchableOpacity>
            <View className="items-center">
               <Text className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Nouveau Véhicule</Text>
               <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Ajout au Parc</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-500/30">
              <Car size={20} color="white" />
            </View>
          </View>

          {/* Main Card */}
          <View className="bg-white dark:bg-gray-900 rounded-[40px] p-6 lg:p-10 shadow-xl border border-gray-100 dark:border-gray-800 mb-8">
            
            {/* Image Section */}
            <View className="mb-10">
              <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Photo Principale</Text>
              <DocumentImagePicker
                imageUri={vehicleImage}
                onImageSelected={setVehicleImage}
                aspect={[16, 9]}
              />
            </View>

            {/* Form Fields */}
            <View className="gap-y-6">
              <form.Field
                name="registration"
                validators={{ onChange: vehicleSchema.shape.registration as any }}
                children={(field) => (
                  <FormInput
                    field={field}
                    label="Plaque d'Immatriculation"
                    placeholder="AA-123-BB"
                    autoCapitalize="characters"
                    icon={Hash}
                  />
                )}
              />

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <form.Field
                    name="brand"
                    validators={{ onChange: vehicleSchema.shape.brand as any }}
                    children={(field) => (
                      <FormInput
                        field={field}
                        label="Marque"
                        placeholder="ex: Toyota"
                        icon={Truck}
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <form.Field
                    name="model"
                    validators={{ onChange: vehicleSchema.shape.model as any }}
                    children={(field) => (
                      <FormInput
                        field={field}
                        label="Modèle"
                        placeholder="Corolla"
                      />
                    )}
                  />
                </View>
              </View>

              <form.Field
                name="year"
                validators={{ onChange: vehicleSchema.shape.year as any }}
                children={(field) => (
                  <FormInput
                    field={field}
                    label="Année de Fabrication"
                    placeholder="2024"
                    keyboardType="number-pad"
                    icon={Calendar}
                  />
                )}
              />

              <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />

              {/* Status Picker */}
              <View>
                <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Statut Opérationnel</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between p-4 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  onPress={() => setShowStatusPicker(!showStatusPicker)}
                >
                  <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-3 ${
                      form.getFieldValue("status") === "Disponible" ? "bg-green-500" : 
                      form.getFieldValue("status") === "En réparation" ? "bg-orange-500" : "bg-red-500"
                    }`} />
                    <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {form.getFieldValue("status")}
                    </Text>
                  </View>
                  <ChevronDown size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                {showStatusPicker && (
                  <View className={`mt-2 rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-lg'}`}>
                    {["Disponible", "En réparation", "Indisponible"].map((status) => (
                      <TouchableOpacity
                        key={status}
                        className={`p-4 flex-row items-center border-b ${isDark ? 'border-gray-700' : 'border-gray-50'}`}
                        onPress={() => {
                          form.setFieldValue("status", status);
                          setShowStatusPicker(false);
                        }}
                      >
                        <View className={`w-2 h-2 rounded-full mr-3 ${
                          status === "Disponible" ? "bg-green-500" : 
                          status === "En réparation" ? "bg-orange-500" : "bg-red-500"
                        }`} />
                        <Text className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'} ${form.getFieldValue("status") === status ? 'font-black text-blue-600' : ''}`}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Driver Picker */}
              <View>
                <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Chauffeur Assigné</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between p-4 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  onPress={() => setShowDriverPicker(!showDriverPicker)}
                >
                  <View className="flex-row items-center">
                    <User size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className={`ml-3 text-sm ${!form.getFieldValue("driverId") ? 'text-gray-400 font-medium' : (isDark ? 'text-white font-bold' : 'text-gray-900 font-bold')}`}>
                      {selectedDriver ? selectedDriver.name : "Sélectionner un chauffeur"}
                    </Text>
                  </View>
                  <ChevronDown size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                {showDriverPicker && (
                  <View className={`mt-2 rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-lg'}`}>
                    <TouchableOpacity
                      className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-50'}`}
                      onPress={() => {
                        form.setFieldValue("driverId", "");
                        setShowDriverPicker(false);
                      }}
                    >
                      <Text className="text-gray-400 italic text-sm">Aucun chauffeur assigné</Text>
                    </TouchableOpacity>
                    {chauffeurs.map((chauffeur) => (
                      <TouchableOpacity
                        key={chauffeur.id}
                        className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-50'}`}
                        onPress={() => {
                          form.setFieldValue("driverId", chauffeur.id);
                          setShowDriverPicker(false);
                        }}
                      >
                        <Text className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'} ${form.getFieldValue("driverId") === chauffeur.id ? 'font-black text-blue-600' : ''}`}>
                          {chauffeur.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />

              {/* Gallery */}
              <View>
                <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Galerie Photos</Text>
                <MultiImagePicker
                  images={vehicleImages}
                  onImagesChange={setVehicleImages}
                  label="Ajouter des vues du véhicule"
                />
              </View>

              {/* Registration Card */}
              <View className="mt-4">
                <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Carte Grise / Rose</Text>
                <DocumentImagePicker
                  imageUri={regCardImage}
                  onImageSelected={setRegCardImage}
                  label="Scan de la carte grise"
                />
              </View>

              {/* Submit Button */}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
                  <TouchableOpacity
                    className={`bg-blue-600 rounded-3xl p-5 items-center mt-10 shadow-xl shadow-blue-500/40 ${(!canSubmit || isSubmitting || loading) ? 'opacity-70' : 'active:scale-[0.98]'}`}
                    onPress={() => form.handleSubmit()}
                    disabled={!canSubmit || isSubmitting || loading}
                  >
                    {isSubmitting || loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-lg font-black tracking-tight">Enregistrer le Véhicule</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
          
          <View className="pb-10 items-center">
            <Text className="text-gray-400 text-xs font-medium">© 2026 Fleet Manager • Inventaire Digital</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </WebLayout>
  );
}
