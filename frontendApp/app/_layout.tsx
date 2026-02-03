import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';

import { Stack, Tabs } from 'expo-router';
import { Briefcase, Calendar, Home, User, Users } from 'lucide-react-native';
import "../global.css";
import { store } from '../src/store/store';

SplashScreen.preventAutoHideAsync();

// Reanimated/Babel warnings ko ignore karein downgrade ke baad
LogBox.ignoreLogs([
  '@babel/plugin-proposal-class-properties', 
  'Reanimated',
  'SafeAreaView has been deprecated'
]);

function AppNavigator() {
  const { isAuthenticated } = useSelector(state => state.auth);

  console.log('AppNavigator: isAuthenticated =', isAuthenticated);

  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="forgot-otp" />
        <Stack.Screen name="new-password" />
        <Stack.Screen name="reset-otp" />
      </Stack>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: 10,
          paddingTop: 8,
          height: 65,
          elevation: 5,
        },
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <Briefcase size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="followups"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen name="deals" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="legal" options={{ href: null }} />
      
      {/* Hide auth screens from tabs */}
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="register" options={{ href: null }} />
      <Tabs.Screen name="otp" options={{ href: null }} />
      <Tabs.Screen name="forgot-password" options={{ href: null }} />
      <Tabs.Screen name="forgot-otp" options={{ href: null }} />
      <Tabs.Screen name="new-password" options={{ href: null }} />
      <Tabs.Screen name="reset-otp" options={{ href: null }} />
    </Tabs>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}