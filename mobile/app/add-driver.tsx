import DocumentImagePicker from "@/components/DocumentImagePicker";
import ProfileImagePicker from "@/components/ProfileImagePicker";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormPasswordInput } from "@/components/ui/form/FormPasswordInput";
import WebLayout from '@/components/web/WebLayout';
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useUploadFile } from "@/hooks/useUploadFile";
import { UPLOAD_FILE } from "@/lib/graphql-queries";
import { generatePassword } from "@/utils/password_generator";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Mail, Phone, RefreshCw, ShieldAlert, Truck, User } from "lucide-react-native";
import { useEffect, useState } from "react";
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
  const { addChauffeur } = useFleet();
  const { mutate: uploadFile } = useUploadFile(UPLOAD_FILE);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'GESTIONNAIRE') {
      Alert.alert("Accès refusé", "Droit d'accès insuffisant");
      router.back();
    }
  }, [user]);

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

        if (profileImage && profileImage.startsWith('file://')) {
          uploadedProfileImageUrl = await uploadFile({ file: profileImage, folder: 'profil' });
        }

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
        Alert.alert("Succès", `Le chauffeur a été ajouté avec succès.`);
        router.back();
      } catch (error: any) {
        Alert.alert("Erreur", error.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    },
  } as any);

  const handleGeneratePassword = () => {
    const newPass = generatePassword();
    form.setFieldValue("password", newPass);
    form.setFieldValue("confirmPassword", newPass);
  };

  return (
    <WebLayout>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
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
               <Text className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Nouveau Chauffeur</Text>
               <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Enregistrement</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-500/30">
              <User size={20} color="white" />
            </View>
          </View>

          {/* Main Card */}
          <View className="bg-white dark:bg-gray-900 rounded-[40px] p-6 lg:p-10 shadow-xl border border-gray-100 dark:border-gray-800 mb-8">
            
            {/* Profile Section */}
            <View className="items-center mb-10">
              <View className="relative">
                <ProfileImagePicker
                  imageUri={profileImage}
                  onImageSelected={setProfileImage}
                  size={120}
                  editable={true}
                />
                <View className="absolute -bottom-2 -right-2 bg-blue-600 w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 items-center justify-center">
                  <Truck size={16} color="white" />
                </View>
              </View>
              <Text className="mt-4 text-gray-400 font-bold text-xs uppercase tracking-widest text-center">Photo de Profil</Text>
            </View>

            {/* Form Fields */}
            <View className="gap-y-6">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <form.Field
                    name="firstName"
                    validators={{ onChange: driverSchema.shape.firstName as any }}
                    children={(field) => (
                      <FormInput
                        label="Prénom"
                        placeholder="John"
                        icon={User}
                        field={field}
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <form.Field
                    name="lastName"
                    validators={{ onChange: driverSchema.shape.lastName as any }}
                    children={(field) => (
                      <FormInput
                        label="Nom"
                        placeholder="Doe"
                        field={field}
                      />
                    )}
                  />
                </View>
              </View>

              <form.Field
                name="email"
                validators={{ onChange: driverSchema.shape.email as any }}
                children={(field) => (
                  <FormInput
                    label="Email Professionnel"
                    placeholder="john.doe@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon={Mail}
                    field={field}
                  />
                )}
              />

              <form.Field
                name="phone"
                validators={{ onChange: driverSchema.shape.phone as any }}
                children={(field) => (
                  <FormInput
                    label="Numéro de Téléphone"
                    placeholder="08xxxxxxxx"
                    keyboardType="phone-pad"
                    icon={Phone}
                    field={field}
                  />
                )}
              />

              <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sécurité & Accès</Text>
                <TouchableOpacity 
                  onPress={handleGeneratePassword}
                  className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full"
                >
                  <RefreshCw size={12} color={isDark ? '#60a5fa' : '#2563eb'} />
                  <Text className="text-[11px] font-black text-blue-600 dark:text-blue-400 ml-1.5 uppercase">Générer</Text>
                </TouchableOpacity>
              </View>

              <form.Field
                name="password"
                validators={{ onChange: driverSchema.shape.password as any }}
                children={(field) => (
                  <FormPasswordInput
                    label="Mot de passe"
                    placeholder="••••••••"
                    field={field}
                  />
                )}
              />

              <form.Field
                name="confirmPassword"
                children={(field) => (
                  <FormPasswordInput
                    label="Confirmer le mot de passe"
                    placeholder="••••••••"
                    field={field}
                  />
                )}
              />

              <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />

              <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Informations Légales</Text>

              <form.Field
                name="licenseNumber"
                validators={{ onChange: driverSchema.shape.licenseNumber as any }}
                children={(field) => (
                  <FormInput
                    label="Numéro de Permis"
                    placeholder="ABC-12345678"
                    icon={ShieldAlert}
                    field={field}
                  />
                )}
              />

              <form.Field
                name="licenseExpiryDate"
                validators={{ onChange: driverSchema.shape.licenseExpiryDate as any }}
                children={(field) => (
                  <FormInput
                    label="Date d'Expiration"
                    placeholder="AAAA-MM-JJ"
                    icon={Calendar}
                    field={field}
                  />
                )}
              />

              <View className="mt-4">
                <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Scan du Permis (Recto)</Text>
                <View className="items-center">
                  <DocumentImagePicker
                    imageUri={licenseImage}
                    onImageSelected={setLicenseImage}
                    editable={true}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <TouchableOpacity 
                    className={`bg-blue-600 rounded-3xl p-5 items-center mt-10 shadow-xl shadow-blue-500/40 ${(loading || !canSubmit || isSubmitting) ? 'opacity-70' : 'active:scale-[0.98]'}`}
                    onPress={() => form.handleSubmit()}
                    disabled={loading || !canSubmit || isSubmitting}
                  >
                    {loading || isSubmitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-lg font-black tracking-tight">Enregistrer le Chauffeur</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
          
          <View className="pb-10 items-center">
            <Text className="text-gray-400 text-xs font-medium">© 2026 Fleet Manager • Gestion Sécurisée</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </WebLayout>
  );
}

