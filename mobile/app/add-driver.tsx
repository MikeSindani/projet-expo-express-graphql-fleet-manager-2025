import ProfileImagePicker from "@/components/ProfileImagePicker";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useFleet } from "@/contexts/FleetContext";
import { Stack, useRouter } from "expo-router";
import { Eye, EyeOff, RefreshCw, X } from "lucide-react-native";
import { useEffect, useState } from "react";
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

export default function AddDriverScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { user } = useAuth();
  const { addChauffeur } = useFleet();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'GESTIONNAIRE') {
      Alert.alert("Accès refusé", "Vous n'avez pas les droits pour ajouter un chauffeur");
      router.back();
    }
  }, [user]);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    setShowPassword(true);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !licenseNumber) {
        Alert.alert("Erreur", "Veuillez remplir le nom, prénom et numéro de permis.");
        return;
    }

    if (!email && !phone) {
        Alert.alert("Erreur", "Veuillez fournir au moins un email ou un numéro de téléphone.");
        return;
    }

    if (!password) {
        Alert.alert("Erreur", "Veuillez définir un mot de passe pour le compte du chauffeur.");
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
        return;
    }

    setLoading(true);
    try {
      await addChauffeur({
        name: `${firstName} ${lastName}`,
        email: email || undefined,
        password,
        role: "CHAUFFEUR",
        telephone: phone || undefined,
        licenseNumber,
        image: profileImage || undefined,
        organizationId: user?.organizationId,
      });
      Alert.alert("Succès", `Chauffeur ajouté avec succès.\nMot de passe: ${password}`);
      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

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
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Image Picker */}
          <View style={styles.imageSection}>
            <ProfileImagePicker
              imageUri={profileImage}
              onImageSelected={setProfileImage}
              size={120}
              editable={true}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jean"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Dupont"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (optionnel si téléphone fourni)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="jean.dupont@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone (optionnel si email fourni)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+33 6 12 34 56 78"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.passwordSectionHeader}>
             <Text style={styles.sectionTitle}>Sécurité</Text>
             <TouchableOpacity style={styles.generateButton} onPress={generatePassword}>
                <RefreshCw size={14} color={Colors.primary} />
                <Text style={styles.generateButtonText}>Générer mot de passe</Text>
             </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="******"
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.gray[400]}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                     {showPassword ? <EyeOff size={20} color={Colors.text.secondary} /> : <Eye size={20} color={Colors.text.secondary} />}
                </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer mot de passe *</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="******"
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.gray[400]}
                />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro de permis *</Text>
            <TextInput
              style={styles.input}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="123456789"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date d&apos;expiration du permis</Text>
            <TextInput
              style={styles.input}
              value={licenseExpiryDate}
              onChangeText={setLicenseExpiryDate}
              placeholder="YYYY-MM-DD"
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
              <Text style={styles.submitButtonText}>Ajouter le chauffeur</Text>
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
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  passwordSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 10,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: Colors.text.primary,
  },
  eyeIcon: {
    padding: 14,
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
