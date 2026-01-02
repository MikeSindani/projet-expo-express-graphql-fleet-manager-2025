import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface DocumentImagePickerProps {
  imageUri?: string | null;
  onImageSelected: (uri: string) => void;
  width?: number;
  height?: number;
  editable?: boolean;
  label?: string;
}

export default function DocumentImagePicker({
  imageUri,
  onImageSelected,
  width = 250,
  height = 160,
  editable = true,
  label
}: DocumentImagePickerProps) {
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
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View className="items-center w-full">
      {label && (
        <Text className="text-xs font-bold text-gray-500 mb-2 uppercase self-center">{label}</Text>
      )}
      <TouchableOpacity
        onPress={pickImage}
        disabled={!editable}
        className="relative"
        activeOpacity={0.7}
      >
        <View
          style={{ width, height }}
          className="bg-gray-100 dark:bg-gray-800 items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl"
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width, height }}
              className="rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center p-4">
              <Upload size={32} color="#9ca3af" className="mb-2" />
              <Text className="text-center text-gray-400 text-xs">
                Appuyez pour ajouter une photo du document
              </Text>
            </View>
          )}
        </View>
        
        {editable && imageUri && (
          <View className="absolute bottom-[-10px] right-[-10px] w-10 h-10 rounded-full bg-blue-600 items-center justify-center border-2 border-white shadow-md">
            <Camera size={20} color="white" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
