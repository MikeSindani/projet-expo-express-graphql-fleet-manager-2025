import DocumentImagePicker from "@/components/DocumentImagePicker";
import ProfileImagePicker from "@/components/ProfileImagePicker";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormPasswordInput } from "@/components/ui/form/FormPasswordInput";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { useUploadFile } from "@/hooks/useUploadFile";
import { UPLOAD_FILE } from "@/lib/graphql-queries";
import generatePassword from "@/utils/password_generator";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Stack, useRouter } from "expo-router";
import { RefreshCw, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { z } from "zod";

const driverSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
  confirmPassword: z.string(),
  licenseNumber: z.string().min(1, "Le numéro de permis est requis"),
  licenseExpiryDate: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
}).refine((data) => data.email || data.phone, {
  message: "Veuillez fournir au moins un email ou un numéro de téléphone",
  path: ["email"],
});

export default function AddDriverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addChauffeur, refreshFleetData } = useFleet();
  const { mutate: uploadFile, isLoading: isUploading } = useUploadFile(UPLOAD_FILE);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // images state (keep outside useForm for simplicity with current pickers)
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'GESTIONNAIRE') {
      Alert.alert("Accès refusé", "Vous n'avez pas les droits pour ajouter un chauffeur");
      router.back();
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFleetData();
    setRefreshing(false);
  }, [refreshFleetData]);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      licenseNumber: "",
      licenseExpiryDate: "",
    },
    validatorAdapter: zodValidator() as any,
    onSubmit: async ({ value }: { value: any }) => {
      setLoading(true);
      try {
        let uploadedProfileImageUrl = profileImage;
        let uploadedLicenseImageUrl = licenseImage;

        // Upload Profile Image if it's a local file
        if (profileImage && profileImage.startsWith('file://')) {
          uploadedProfileImageUrl = await uploadFile({ file: profileImage, folder: 'profil' });
        }

        // Upload License Image if it's a local file
        if (licenseImage && licenseImage.startsWith('file://')) {
          uploadedLicenseImageUrl = await uploadFile({ file: licenseImage, folder: 'permis' });
        }

        await addChauffeur({
          name: `${value.firstName} ${value.lastName}`,
          email: value.email || undefined,
          password: value.password,
          role: "CHAUFFEUR",
          telephone: value.phone || undefined,
          licenseNumber: value.licenseNumber,
          licenseExpiryDate: value.licenseExpiryDate || undefined,
          licenseImage: uploadedLicenseImageUrl || undefined,
          image: uploadedProfileImageUrl || undefined,
          organizationId: user?.organizationId,
        });
        Alert.alert("Succès", `Chauffeur ajouté avec succès.\nMot de passe: ${value.password}`);
        router.back();
      } catch (error: any) {
        console.error(error);
        Alert.alert("Erreur", error.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    },
  } as any);

  const handleGeneratePassword = () => {
    const newPass: string = generatePassword();
    form.setFieldValue("password", newPass);
    form.setFieldValue("confirmPassword", newPass);
  };

  const RefreshControlComponent = RefreshControl as any;

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
          title: "Nouveau chauffeur",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white dark:bg-gray-900"
      >
        <ScrollView 
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControlComponent refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Photos Section */}
          <View className="items-center mb-6 pt-4">
             <Text className="text-xs font-bold text-gray-500 mb-2 uppercase">Photo Profil</Text>
             <ProfileImagePicker
               imageUri={profileImage}
               onImageSelected={setProfileImage}
               size={120}
               editable={true}
             />
          </View>

          <form.Field
            name="firstName"
            validators={{ onChange: driverSchema.shape.firstName as any }}
            children={(field) => (
              <FormInput
                label="Prénom *"
                placeholder="Jean"
                field={field}
              />
            )}
          />

          <form.Field
            name="lastName"
            validators={{ onChange: driverSchema.shape.lastName as any }}
            children={(field) => (
              <FormInput
                label="Nom *"
                placeholder="Dupont"
                field={field}
              />
            )}
          />

          <form.Field
            name="email"
            validators={{ onChange: driverSchema.shape.email as any }}
            children={(field) => (
              <FormInput
                label="Email (optionnel)"
                placeholder="jean.dupont@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                field={field}
              />
            )}
          />

          <form.Field
            name="phone"
            validators={{ onChange: driverSchema.shape.phone as any }}
            children={(field) => (
              <FormInput
                label="Téléphone (optionnel)"
                placeholder="+33 6 12 34 56 78"
                keyboardType="phone-pad"
                field={field}
              />
            )}
          />
          
          <View className="h-[1] bg-gray-200 dark:bg-gray-700 my-6" />
          
          <View className="flex-row justify-between items-center mb-4">
             <Text className="text-base font-bold text-gray-900 dark:text-white">Sécurité</Text>
             <TouchableOpacity 
               className="flex-row items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg" 
               onPress={handleGeneratePassword}
              >
                <RefreshCw size={14} color="#3b82f6" />
                <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">Générer mot de passe</Text>
             </TouchableOpacity>
          </View>

          <form.Field
            name="password"
            validators={{ onChange: driverSchema.shape.password as any }}
            children={(field) => (
              <FormPasswordInput
                label="Mot de passe *"
                placeholder="******"
                field={field}
              />
            )}
          />

          <form.Field
            name="confirmPassword"
            children={(field) => (
              <FormPasswordInput
                label="Confirmer mot de passe *"
                placeholder="******"
                field={field}
              />
            )}
          />

          <View className="h-[1] bg-gray-200 dark:bg-gray-700 my-6" />

          <form.Field
            name="licenseNumber"
            validators={{ onChange: driverSchema.shape.licenseNumber as any }}
            children={(field) => (
              <FormInput
                label="Numéro de permis *"
                placeholder="123456789"
                field={field}
              />
            )}
          />

          <form.Field
            name="licenseExpiryDate"
            validators={{ onChange: driverSchema.shape.licenseExpiryDate as any }}
            children={(field) => (
              <FormInput
                label="Date d'expiration du permis"
                placeholder="YYYY-MM-DD"
                field={field}
              />
            )}
          />

          <View className="mb-8">
             <DocumentImagePicker
               label="Photo du Permis (Recto)"
               imageUri={licenseImage}
               onImageSelected={setLicenseImage}
               editable={true}
             />
          </View>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <TouchableOpacity 
                className={`bg-blue-600 rounded-xl p-4 items-center mt-4 shadow-lg shadow-blue-500/50 ${(loading || !canSubmit || isSubmitting) ? 'opacity-70' : ''}`}
                onPress={() => form.handleSubmit()}
                disabled={loading || !canSubmit || isSubmitting}
              >
                {loading || isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-base font-bold">Ajouter le chauffeur</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

