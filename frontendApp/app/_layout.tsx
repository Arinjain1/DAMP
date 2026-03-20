import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from "react";
import { LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';

import { Stack, Tabs } from 'expo-router'; // Removed unused 'router'
import { Briefcase, Calendar, Home, User, Users } from 'lucide-react-native';
import "../global.css";
import { store } from '../src/store/store';
import { loginSuccess } from '../src/store/slices/authSlice';
import { loadPersistedData } from '../src/store/middleware/persistenceMiddleware';
import { setAuthToken } from '../src/config/api';
import { useInitializeData } from '../src/hooks/useInitializeData';
import { setNavigationRef } from '../src/config/api';

// 🔤 FONT LOADING
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useFonts } from "expo-font";

import {
  Lato_400Regular,
  Lato_700Bold,
} from "@expo-google-fonts/lato";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";

SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  '@babel/plugin-proposal-class-properties',
  'Reanimated',
  'SafeAreaView has been deprecated'
]);

function AppNavigator() {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  // Set token when user is authenticated (for app rehydration)
  useEffect(() => {
    if (user?.token) {
      setAuthToken(user.token);
    }
  }, [user?.token]);

  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
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
          
          height: 75,
          elevation: 5,
          paddingHorizontal: 10,
          paddingVertical: 8,
        },
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9ca3af',
         
      }}
    >
      <Tabs.Screen
        name="dashboard"
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
      <Tabs.Screen name="profile-information" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="support-hub" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="deals" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="deal-page" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="stats" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="legal" options={{ href: null, tabBarStyle: { display: 'none' } }} />

      {/* Hide auth and onboarding screens from tabs */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="splash" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
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
  const [isAuthLoaded, setIsAuthLoaded] = useState(false); // FIX: New state for Auth Loading

  // 🔤 LOAD FONTS
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Lato_400Regular,
    Lato_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // 🔄 REHYDRATE AUTH from AsyncStorage on startup
  useEffect(() => {
    // FIX: Function properly scoped inside useEffect
    const rehydrate = async () => {
      try {
        const saved = await loadPersistedData();
        if (saved?.auth?.isAuthenticated && saved?.auth?.user?.token) {
          setAuthToken(saved.auth.user.token);
          store.dispatch(loginSuccess(saved.auth.user));
        }
      } catch (e) {
        console.warn('Auth rehydration failed:', e);
      } finally {
        setIsAuthLoaded(true); // Redux update complete
      }
    };

    rehydrate();
  }, []);

  // FIX: Wait for BOTH fonts and auth to finish loading before hiding splash screen
  useEffect(() => {
    if (fontsLoaded && isAuthLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthLoaded]);

  // Show loading screen while fonts OR auth is loading
  if (!fontsLoaded || !isAuthLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#BFB7FD' }} />
    );
  }

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#10B981', backgroundColor: '#F0FDF4' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ fontSize: 16, fontWeight: '600', color: '#065F46' }}
        text2Style={{ fontSize: 14, color: '#047857' }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: '#EF4444', backgroundColor: '#FEF2F2' }}
        text1Style={{ fontSize: 16, fontWeight: '600', color: '#991B1B' }}
        text2Style={{ fontSize: 14, color: '#B91C1C' }}
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#3B82F6', backgroundColor: '#EFF6FF' }}
        text1Style={{ fontSize: 16, fontWeight: '600', color: '#1E40AF' }}
        text2Style={{ fontSize: 14, color: '#1D4ED8' }}
      />
    ),
  };

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}