import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import { LogBox, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

// Path check karein: Agar global.css root mein hai toh ../global.css sahi hai
import { Tabs } from 'expo-router';
import { Briefcase, Calendar, Home, User, Users } from 'lucide-react-native';
import "../global.css";
import { store } from '../src/store/store';

SplashScreen.preventAutoHideAsync();

// Reanimated/Babel warnings ko ignore karein downgrade ke baad
LogBox.ignoreLogs(['@babel/plugin-proposal-class-properties', 'Reanimated']);

function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Headers ko hide kar diya
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
          height: 65 + Math.max(insets.bottom, 0),
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

      {/* Hidden Screens - ye tab bar mein nahi dikhenge */}
      <Tabs.Screen name="deals" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="legal" options={{ href: null }} />
    </Tabs>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Splash screen ko 1 second baad hide karein aur app ready kar dein
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
      setIsReady(true);
    }, 1500); // Thoda zyada time diya navigation context ke liye
    
    return () => clearTimeout(timer);
  }, []);

  // Agar app ready nahi hai toh loading screen dikhao
  if (!isReady) {
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>Loading...</Text>
          </View>
        </SafeAreaProvider>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        {/* Tab navigation context yahan se start hota hai */}
        <TabsLayout />
      </SafeAreaProvider>
    </Provider>
  );
}