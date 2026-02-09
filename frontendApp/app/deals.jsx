import { StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import DealsManagerPage from '../src/Views/DealsManagerPage';

// Redux actions
import { setSelectedDeal } from '../src/store/slices/dealsSlice';

export default function Deals() {
  const dispatch = useDispatch();
  
  const { properties } = useSelector(state => state.properties);
  const { customers } = useSelector(state => state.customers);
  const { deals } = useSelector(state => state.deals);

  const handleOpenDeal = (deal) => {
    dispatch(setSelectedDeal(deal));
    router.push('/deal-page');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <DealsManagerPage 
        deals={deals} 
        properties={properties} 
        customers={customers} 
        onOpenDeal={handleOpenDeal}
        onBack={() => router.back()}
      />
    </View>
  );
}