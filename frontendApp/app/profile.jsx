import React from 'react';
import { View, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ProfilePage from '../src/Views/ProfilePage';
import SubscriptionSheet from '../src/Modal and Sheets/SubscriptionSheet';

// Redux actions
import { logout } from '../src/store/slices/authSlice';
import { activateSubscription, setShowPaywall } from '../src/store/slices/subscriptionSlice';
import { showToast } from '../src/utils/toast';

export default function Profile() {
  const dispatch = useDispatch();

  const { subscription, showPaywall } = useSelector(state => state.subscription);

  const handleRenew = () => {
    dispatch(setShowPaywall(true));
  };

  const handleLogout = () => {
    showToast.success('Logged out successfully!');
    dispatch(logout());
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
        onLogout={handleLogout}
      />

      <SubscriptionSheet
        isOpen={showPaywall}
        onSubscribe={handleSubscribe}
        onClose={() => dispatch(setShowPaywall(false))}
      />
    </View>
  );
}