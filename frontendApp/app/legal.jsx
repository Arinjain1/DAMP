import { StatusBar, View } from 'react-native';
import LegalPage from '../src/Views/LegalPage';

export default function Legal() {
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <LegalPage />
    </View>
  );
}