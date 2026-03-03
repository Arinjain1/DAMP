import { Lato_400Regular, Lato_700Bold, useFonts } from '@expo-google-fonts/lato';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleResetPassword = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/forgot-otp');
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* GRADIENT */}
      <LinearGradient
        colors={['#DAD5FB', '#F3F4F6', '#FFFFFF']}
        locations={[0, 0.55, 6]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* BACK */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#333" />
          </TouchableOpacity>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Don&apos;t worry! Enter your email and we&apos;ll send you a verification code</Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            {/* EMAIL */}
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* CONTINUE BUTTON */}
            <TouchableOpacity
              style={[styles.continueBtn, loading && { opacity: 0.75 }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.continueText}>
                {loading ? 'Sending...' : 'Send Reset Code'}
              </Text>
            </TouchableOpacity>

            {/* INFO TEXT */}


            {/* BACK TO LOGIN */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Remember your password?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.signupLink}> Log In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to the{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
import styles from '../src/styles/forgotPasswordStyles';