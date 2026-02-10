import { useTheme } from '@/contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { Plus, X } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MultiImagePickerProps {
  images: string[];
  onImagesChange: (uris: string[]) => void;
  label?: string;
  maxImages?: number;
}

export default function MultiImagePicker({
  images,
  onImagesChange,
  label,
  maxImages = 10,
}: MultiImagePickerProps) {
  const { isDark } = useTheme();

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès aux photos nécessaire.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
      quality: 0.6,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      onImagesChange([...images, ...newUris]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    onImagesChange(updated);
  };

  return (
    <View className="w-full mb-6">
      {label && (
        <Text className={`text-sm font-bold mb-2 ml-1 ${isDark ? 'text-gray-400' : 'text-gray-900'}`}>
          {label} ({images.length}/{maxImages})
        </Text>
      )}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {images.map((uri, index) => (
          <View key={index} className="mr-3 relative py-2">
            <Image
              source={{ uri }}
              className="w-24 h-24 rounded-xl border border-gray-200 dark:border-gray-700"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => removeImage(index)}
              className="absolute top-0 right-0 bg-red-500 rounded-full p-1 border-2 border-white dark:border-gray-950 shadow-sm"
            >
              <X size={14} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        
        {images.length < maxImages && (
          <TouchableOpacity
            onPress={pickImages}
            className={`w-24 h-24 mt-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 items-center justify-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
          >
            <Plus size={32} color={isDark ? '#4b5563' : '#9ca3af'} />
            <Text className="text-[10px] text-gray-400 mt-1">Ajouter</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
