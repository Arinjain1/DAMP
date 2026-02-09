import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";

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

export default function Index() {
  const router = useRouter();

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

  useEffect(() => {
    if (fontsLoaded) {
      // Redirect to splash screen after fonts are loaded
      router.replace('/splash');
    }
  }, [fontsLoaded]);

  // ⛔ Show splash screen while fonts load
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#BFB7FD' }} />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#BFB7FD' }} />
  );
}
