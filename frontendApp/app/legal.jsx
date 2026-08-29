import { StatusBar, View } from 'react-native';
import { useRouter } from 'expo-router';
import LegalPage from '../src/Views/LegalPage';

export default function Legal() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <LegalPage onBack={() => router.back()} />
    </View>
  );
}