import { GRAPHQL_URL } from '@/config/graphql-url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = GRAPHQL_URL.replace('/graphql', '');

export const imageApi = {
  uploadMultiple: async (images: string[], type: 'vehicule' | 'rapport' | 'chauffeur', id: string) => {
    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();
    
    images.forEach((uri, index) => {
      const filename = uri.split('/').pop() || `upload-${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('files', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: fileType,
      } as any);
    });
    
    formData.append('type', type);
    if (id) formData.append('id', id);

    const response = await fetch(`${API_BASE_URL}/api/images/upload-multiple`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error details:', errorText);
        throw new Error(`Upload failed with status ${response.status}`);
    }

    return await response.json();
  },

  getImages: async (type: 'vehicule' | 'rapport', id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/images/${type}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch images with status ${response.status}`);
    }
    return await response.json();
  }
};
