import { StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SubscriptionSheet from '../src/Modal and Sheets/SubscriptionSheet';
import ProfilePage from '../src/Views/ProfilePage';

// Redux actions
import { activateSubscription, setShowPaywall } from '../src/store/slices/subscriptionSlice';

export default function Profile() {
  const dispatch = useDispatch();
  
  const { subscription, showPaywall } = useSelector(state => state.subscription);

  const handleRenew = () => {
    dispatch(setShowPaywall(true));
  };

  const handleSubscribe = (plan) => {
    dispatch(activateSubscription({ plan }));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <ProfilePage 
        subscription={subscription} 
        onRenew={handleRenew} 
      />

      <SubscriptionSheet 
        isOpen={showPaywall} 
        onSubscribe={handleSubscribe} 
        onClose={() => dispatch(setShowPaywall(false))} 
      />
    </View>
  );
}