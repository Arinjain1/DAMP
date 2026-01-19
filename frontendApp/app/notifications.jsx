import { StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import NotificationsPage from '../src/Views/NotificationsPage';

// Redux actions
import { markAllAsRead } from '../src/store/slices/notificationsSlice';
import { useRouter } from 'expo-router';

export default function Notifications() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { notifications } = useSelector(state => state.notifications);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      console.warn('Navigation error:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <NotificationsPage 
        notifications={notifications} 
        onMarkAllRead={handleMarkAllRead} 
        onBack={handleBack} 
      />
    </View>
  );
}