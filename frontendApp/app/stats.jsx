import { StatusBar, View } from 'react-native';
import { useSelector } from 'react-redux';
import StatsPage from '../src/Views/StatsPage';

export default function Stats() {
  const { properties } = useSelector(state => state.properties);
  const { customers } = useSelector(state => state.customers);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <StatsPage 
        properties={properties} 
        customers={customers} 
      />
    </View>
  );
}