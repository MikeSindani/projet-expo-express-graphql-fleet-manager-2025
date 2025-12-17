import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
  console.log('Registering for push notifications...');
  console.log('Execution Environment:', Constants.executionEnvironment);

  // Check if running in Expo Go
  if (Constants.executionEnvironment === 'storeClient') {
    console.log('Push notifications are not supported in Expo Go');
    return false;
  }

  let token;

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (e) {
      console.log('Error setting notification channel:', e);
    }
  }

  console.log('Requesting permissions...');
  let existingStatus;
  try {
    const settings = await Notifications.getPermissionsAsync();
    console.log('Permissions settings:', settings);
    existingStatus = settings.status;
  } catch (e) {
    console.error('Error getting permissions:', e);
    return false;
  }
  
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permissions');
    return;
  }

  return finalStatus === 'granted';
}

export async function scheduleLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Show immediately
  });
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
