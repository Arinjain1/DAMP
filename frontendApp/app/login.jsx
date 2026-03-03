import { Lato_400Regular, Lato_700Bold, useFonts } from '@expo-google-fonts/lato';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
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
import { useDispatch } from 'react-redux';
import { authAPI, setAuthToken } from '../src/config/api';
import { loginSuccess } from '../src/store/slices/authSlice';
import { showToast } from '../src/utils/toast';

export default function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      showToast.warn('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });

      if (response.data) {
        // Backend returns user data directly (no success flag)
        const { id, full_name, email: userEmail, role, token } = response.data;

        const userData = {
          id,
          name: full_name,
          full_name,
          email: userEmail,
          role,
          token
        };

        // Set auth token for future API calls
        setAuthToken(token);

        dispatch(loginSuccess(userData));
        // Don't navigate - let the auth state change handle the navigation automatically
        // The AppNavigator will switch from Stack to Tabs when isAuthenticated becomes true
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Unable to connect to server. Please check your connection.';
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* GRADIENT */}
      <LinearGradient
        colors={['#DAD5FB', '#F3F4F6', '#FFFFFF']}
        locations={[0, 0.55, 1]}
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
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Login with email & password</Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            {/* EMAIL */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* PASSWORD */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* FORGOT PASSWORD */}
            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* CONTINUE BUTTON */}
            <TouchableOpacity
              style={[styles.continueBtn, loading && { opacity: 0.75 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.continueText}>
                {loading ? 'Processing...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            {/* SIGN UP ROW */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don’t have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.signupLink}> Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By logging in, you agree to the{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
import styles from '../src/styles/loginStyles';
