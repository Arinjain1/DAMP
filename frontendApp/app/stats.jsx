import { StatusBar, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import StatsPage from '../src/Views/StatsPage';

export default function Stats() {
  const router = useRouter();
  const { properties } = useSelector(state => state.properties);
  const { customers } = useSelector(state => state.customers);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <StatsPage 
        properties={properties} 
        customers={customers} 
        onBack={() => router.back()}
      />
    </View>
  );
}