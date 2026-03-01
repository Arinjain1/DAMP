import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';


export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // 1 second splash screen
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TEMPORARY: Force show onboarding for testing
        // Comment out these lines after testing
        router.replace('/onboarding');

        // Uncomment below code after testing
        // const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        // if (hasSeenOnboarding === 'true') {
        //   router.replace('/login');
        // } else {
        //   router.replace('/onboarding');
        // }
      } catch (error) {
        console.error('Error checking onboarding:', error);
        router.replace('/onboarding');
      }
    };

    checkOnboarding();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#BFB7FD' }} />
  );
}
