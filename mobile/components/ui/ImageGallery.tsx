import { getImageUrl } from '@/utils/images';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, TouchableOpacity, View } from 'react-native';

interface ImageGalleryProps {
  images: { id: string | number; url: string }[];
  height?: number;
  width?: number;
}

export function ImageGallery({ images, height = 80, width = 80 }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        {images.map((img, index) => (
          <TouchableOpacity 
            key={img.id || index} 
            className="mr-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
            style={{ height, width }}
            onPress={() => setSelectedImage(img.url)}
          >
            <Image
              source={{ uri: getImageUrl(img.url) }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity 
            className="absolute top-12 right-6 p-2 bg-gray-800/50 rounded-full z-10"
            onPress={() => setSelectedImage(null)}
          >
            <X size={24} color="white" />
          </TouchableOpacity>
          
          {selectedImage && (
            <Image
              source={{ uri: getImageUrl(selectedImage) }}
              className="w-full h-3/4"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
}
