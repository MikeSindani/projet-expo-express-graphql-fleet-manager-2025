import MultiImagePicker from "@/components/MultiImagePicker";
import { FormInput } from "@/components/ui/form/FormInput";
import WebLayout from '@/components/web/WebLayout';
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { imageApi } from "@/lib/imageApi";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Calendar, ChevronDown, Clipboard, FileText, Gauge, MapPin, MessageSquare, Truck, User } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const reportSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  startKm: z.string().min(1, "Le kilométrage de départ est requis"),
  endKm: z.string().min(1, "Le kilométrage de fin est requis"),
  incidents: z.string().optional(),
  comments: z.string().optional(),
  driverId: z.string().min(1, "Le chauffeur est requis"),
  vehicleId: z.string().min(1, "Le véhicule est requis"),
  type: z.string().min(1, "Le type de rapport est requis"),
});

export default function AddReportScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { chauffeurs, vehicules, addRapport } = useFleet();
  
  const isChauffeur = user?.role === "CHAUFFEUR";
  
  const assignedVehicle = isChauffeur 
    ? vehicules.find(v => v.driver?.id === user?.id || v.driverId === user?.id)
    : null;

  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [incidentImages, setIncidentImages] = useState<string[]>([]);

  const reportTypes = [
    { label: "Incident", value: "INCIDENT", color: "#ef4444" },
    { label: "Réparation", value: "REPARATION", color: "#f59e0b" },
    { label: "Maintenance", value: "MAINTENANCE", color: "#3b82f6" },
  ];

  const form = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      startKm: "",
      endKm: "",
      incidents: "",
      comments: "",
      driverId: isChauffeur ? user?.id || "" : "",
      vehicleId: assignedVehicle ? assignedVehicle.id.toString() : "",
      type: "INCIDENT",
    },
    validatorAdapter: zodValidator() as any,
    onSubmit: async ({ value }: { value: any }) => {
      const startKmNum = parseFloat(value.startKm);
      const endKmNum = parseFloat(value.endKm);

      if (isNaN(startKmNum) || isNaN(endKmNum)) {
        Alert.alert("Erreur", "Kilométrage invalide");
        return;
      }

      if (endKmNum < startKmNum) {
        Alert.alert("Erreur", "Kilométrage final doit être ≥ au départ");
        return;
      }

      setLoading(true);
      try {
        const result = await addRapport({
          date: value.date,
          kilometrage: endKmNum - startKmNum,
          incidents: value.incidents,
          commentaires: value.comments,
          chauffeurId: value.driverId,
          vehiculeId: parseInt(value.vehicleId),
          type: value.type
        });

        if (result && result.id && incidentImages.length > 0) {
          try {
            await imageApi.uploadMultiple(incidentImages, 'rapport', result.id.toString());
          } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
          }
        }

        Alert.alert("Succès", "Rapport enregistré avec succès");
        router.back();
      } catch (error: any) {
        Alert.alert("Erreur", error.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    },
  } as any);

  const selectedDriver = chauffeurs.find(c => c.id === form.getFieldValue("driverId"));
  const selectedVehicle = vehicules.find(v => v.id.toString() === form.getFieldValue("vehicleId"));
  const selectedType = reportTypes.find(t => t.value === form.getFieldValue("type"));

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
               <Text className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Nouveau Rapport</Text>
               <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Suivi Opérationnel</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-500/30">
              <Clipboard size={20} color="white" />
            </View>
          </View>

          {/* Main Card */}
          <View className="bg-white dark:bg-gray-900 rounded-[40px] p-6 lg:p-10 shadow-xl border border-gray-100 dark:border-gray-800 mb-8">
            
            {/* Form Fields */}
            <View className="gap-y-6">
              
              {/* Report Type Selector */}
              <View>
                <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Type de Rapport</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between p-5 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  onPress={() => setShowTypePicker(!showTypePicker)}
                >
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: selectedType?.color }} />
                    <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedType?.label}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                {showTypePicker && (
                  <View className={`mt-2 rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-lg'}`}>
                    {reportTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        className={`p-5 flex-row items-center border-b ${isDark ? 'border-gray-700' : 'border-gray-50'}`}
                        onPress={() => {
                          form.setFieldValue("type", type.value);
                          setShowTypePicker(false);
                        }}
                      >
                        <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: type.color }} />
                        <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-700'} ${form.getFieldValue("type") === type.value ? 'font-black text-blue-600' : ''}`}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-2" />

              {/* Chauffeur Context */}
              <View>
                <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Acteur de la Mission</Text>
                {isChauffeur ? (
                   <View className={`flex-row items-center p-5 rounded-2xl border ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
                     <User size={20} color={isDark ? '#4b5563' : '#9ca3af'} />
                     <Text className={`ml-4 text-base font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                       {user?.name} (Moi)
                     </Text>
                   </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className={`flex-row items-center justify-between p-5 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                    onPress={() => setShowDriverPicker(!showDriverPicker)}
                  >
                    <View className="flex-row items-center">
                      <User size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                      <Text className={`ml-4 text-base ${!form.getFieldValue("driverId") ? 'text-gray-400 font-medium' : (isDark ? 'text-white font-bold' : 'text-gray-900 font-bold')}`}>
                        {selectedDriver ? selectedDriver.name : "Sélectionner un chauffeur"}
                      </Text>
                    </View>
                    <ChevronDown size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                  </TouchableOpacity>
                )}
                {!isChauffeur && showDriverPicker && (
                  <View className={`mt-2 rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-lg'}`}>
                    {chauffeurs.map((chauffeur) => (
                      <TouchableOpacity
                        key={chauffeur.id}
                        className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-50'}`}
                        onPress={() => {
                          form.setFieldValue("driverId", chauffeur.id);
                          setShowDriverPicker(false);
                          const assignedV = vehicules.find(v => v.driver?.id === chauffeur.id || v.driverId === chauffeur.id);
                          if (assignedV) form.setFieldValue("vehicleId", assignedV.id.toString());
                        }}
                      >
                        <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-700'} ${form.getFieldValue("driverId") === chauffeur.id ? 'font-black text-blue-600' : ''}`}>
                          {chauffeur.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Vehicle Context */}
              <View>
                <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Véhicule Utilisé</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between p-5 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  onPress={() => setShowVehiclePicker(!showVehiclePicker)}
                >
                  <View className="flex-row items-center">
                    <Truck size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className={`ml-4 text-base ${!form.getFieldValue("vehicleId") ? 'text-gray-400 font-medium' : (isDark ? 'text-white font-bold' : 'text-gray-900 font-bold')}`}>
                      {selectedVehicle
                        ? `${selectedVehicle.marque} ${selectedVehicle.modele}`
                        : "Sélectionner un véhicule"}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                {showVehiclePicker && (
                  <View className={`mt-2 rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-lg'}`}>
                    {vehicules.map((vehicule) => (
                      <TouchableOpacity
                        key={vehicule.id}
                        className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-50'}`}
                        onPress={() => {
                          form.setFieldValue("vehicleId", vehicule.id.toString());
                          setShowVehiclePicker(false);
                        }}
                      >
                        <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-700'} ${form.getFieldValue("vehicleId") === vehicule.id.toString() ? 'font-black text-blue-600' : ''}`}>
                          {vehicule.marque} {vehicule.modele} ({vehicule.immatriculation})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <form.Field
                name="date"
                validators={{ onChange: reportSchema.shape.date as any }}
                children={(field) => (
                  <FormInput
                    label="Date de la Mission"
                    placeholder="AAAA-MM-JJ"
                    icon={Calendar}
                    field={field}
                  />
                )}
              />

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <form.Field
                    name="startKm"
                    validators={{ onChange: reportSchema.shape.startKm as any }}
                    children={(field) => (
                      <FormInput
                        label="Km Départ"
                        placeholder="0"
                        keyboardType="numeric"
                        icon={Gauge}
                        field={field}
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <form.Field
                    name="endKm"
                    validators={{ onChange: reportSchema.shape.endKm as any }}
                    children={(field) => (
                      <FormInput
                        label="Km Arrivée"
                        placeholder="0"
                        keyboardType="numeric"
                        field={field}
                      />
                    )}
                  />
                </View>
              </View>

              <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />

              <form.Field
                name="incidents"
                children={(field) => (
                  <FormInput
                    label="Incidents & Anomalies"
                    placeholder="Signalez ici tout problème rencontré..."
                    multiline
                    numberOfLines={4}
                    icon={MapPin}
                    field={field}
                    className="min-h-[100] text-start pt-4"
                  />
                )}
              />

              <View className="mt-4">
                <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Preuves Visuelles des Incidents</Text>
                <MultiImagePicker
                  images={incidentImages}
                  onImagesChange={setIncidentImages}
                  label="Ajouter des photos"
                />
              </View>

              <form.Field
                 name="comments"
                 children={(field) => (
                   <FormInput
                     label="Notes & Commentaires"
                     placeholder="Informations complémentaires..."
                     multiline
                     numberOfLines={3}
                     icon={MessageSquare}
                     field={field}
                     className="min-h-[80] pt-4"
                   />
                 )}
               />

              {/* Submit Button */}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
                  <TouchableOpacity
                    className={`bg-blue-600 rounded-3xl p-5 items-center mt-10 shadow-xl shadow-blue-500/40 ${(loading || !canSubmit || isSubmitting) ? 'opacity-70' : 'active:scale-[0.98]'}`}
                    onPress={() => form.handleSubmit()}
                    disabled={loading || !canSubmit || isSubmitting}
                  >
                    {loading || isSubmitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <View className="flex-row items-center">
                        <FileText size={20} color="white" className="mr-2" />
                        <Text className="text-white text-lg font-black tracking-tight ml-2">Transmettre le Rapport</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
          
          <View className="pb-10 items-center">
            <Text className="text-gray-400 text-xs font-medium">© 2026 Fleet Manager • Rapport de Mission</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </WebLayout>
  );
}
