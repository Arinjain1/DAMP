import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from "react";
import { LogBox, View, Platform, Pressable } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';

import { Stack, Tabs, useRouter } from 'expo-router';
import { Briefcase, Calendar, Home, User, Users } from 'lucide-react-native';
import "../global.css";
import { store } from '../src/store/store';
import { loginSuccess, logout } from '../src/store/slices/authSlice';
import { deactivateSubscription } from '../src/store/slices/subscriptionSlice';
import { loadPersistedData } from '../src/store/middleware/persistenceMiddleware';
import { setAuthToken, setNavigationRef, setUnauthorizedCallback, setSubscriptionErrorCallback } from '../src/config/api';

import { showToast } from '../src/utils/toast';

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
  const hasValidSession = isAuthenticated && !!user?.token;
  const insets = useSafeAreaInsets();

  const router = useRouter();

  // Set navigation ref & token when user is authenticated (for app rehydration)
  useEffect(() => {
    setNavigationRef(router);
    if (user?.token) {
      setAuthToken(user.token);
    }
  }, [user?.token, router]);

  if (!hasValidSession) {
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

  const isIOS = Platform.OS === 'ios';
  const bottomInset = insets.bottom;
  const tabHeight = isIOS
    ? (bottomInset > 0 ? 84 : 64)
    : (bottomInset > 0 ? 64 + bottomInset : 64);
  const tabPaddingBottom = isIOS
    ? (bottomInset > 0 ? 24 : 8)
    : (bottomInset > 0 ? bottomInset + 4 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: true,
        tabBarButton: (props) => (
          <Pressable
            {...props}
            android_ripple={null}
            style={({ pressed }) => [
              props.style,
              {
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 0,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          />
        ),
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: tabPaddingBottom,
          paddingTop: 8,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 6,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 2,
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Montserrat_600SemiBold',
          lineHeight: 14,
          letterSpacing: -0.1,
          includeFontPadding: false,
          marginTop: 0,
          marginBottom: 0,
          textAlign: 'center',
        },
        tabBarIconStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 3,
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Home size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="followups"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <User size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
            </View>
          ),
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen name="profile-information" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="support-hub" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="deals" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="customer-detail" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="find-properties" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="find-clients" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="deal-page" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="property-detail" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="collab-page" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="match-opportunities" options={{ href: null, tabBarStyle: { display: 'none' } }} />
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

  // 🔒 Handle 401/403 session expiration & subscription errors
  useEffect(() => {
    setUnauthorizedCallback(() => {
      const state = store.getState();
      if (state.auth.isAuthenticated) {
        store.dispatch(logout());
        showToast.error('Session expired. Please log in again.');
      }
    });

    setSubscriptionErrorCallback(() => {
      store.dispatch(deactivateSubscription());
    });
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
