import * as ImagePicker from 'expo-image-picker';
import { Camera, User } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface ProfileImagePickerProps {
  imageUri?: string | null;
  onImageSelected: (uri: string) => void;
  size?: number;
  editable?: boolean;
}

export default function ProfileImagePicker({
  imageUri,
  onImageSelected,
  size = 128,
  editable = true,
}: ProfileImagePickerProps) {
  const pickImage = async () => {
    if (!editable) return;

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à vos photos.'
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Compress to 50% for better performance
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      // Create data URI for display and upload
      const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      onImageSelected(base64Uri);
    }
  };

  return (
    <View className="items-center">
      <TouchableOpacity
        onPress={pickImage}
        disabled={!editable}
        className="relative"
        activeOpacity={0.7}
      >
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-gray-200 items-center justify-center overflow-hidden border-4 border-white shadow-lg"
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: size, height: size }}
              className="rounded-full"
            />
          ) : (
            <User size={size * 0.5} color="#9ca3af" />
          )}
        </View>
        
        {editable && (
          <View className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 items-center justify-center border-2 border-white shadow-md">
            <Camera size={20} color="white" />
          </View>
        )}
      </TouchableOpacity>
      
      {editable && (
        <Text className="text-sm text-gray-500 mt-2">
          Appuyez pour {imageUri ? 'changer' : 'ajouter'} la photo
        </Text>
      )}
    </View>
  );
}
