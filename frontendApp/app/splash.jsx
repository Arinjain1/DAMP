import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // 1 second splash screen
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Skip onboarding and go directly to login
        router.replace('/login');
      } catch (error) {
        console.error('Error checking onboarding:', error);
        router.replace('/login');
      }
    };

    checkOnboarding();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#BFB7FD' }} />
  );
}
