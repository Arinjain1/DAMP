import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, KeyRound, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = () => {
    console.log('🔥 Forgot Password - Sending reset code for:', email);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('🔥 Forgot Password - Navigating to /forgot-otp');
      router.push('/forgot-otp'); // Navigate to forgot password OTP verification
    }, 1200);
  };

  const iconColor = "#BFB7FD"; 
  const placeholderColor = "#9CA3AF";

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <LinearGradient
        colors={['#BFB7FD', '#E5E1FF', '#ffffff']}
        locations={[0, 0.55, 1]}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* BACK BUTTON */}
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <ArrowLeft size={20} color="#111827" />
            </TouchableOpacity>

            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <KeyRound size={48} color="#111827" />
              </View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Don't worry! Enter your email and we'll send you a verification code
              </Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>
              
              {/* EMAIL */}
              <View style={styles.inputBox}>
                <Mail size={18} color={iconColor} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email address"
                  placeholderTextColor={placeholderColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              {/* SUBMIT BUTTON */}
              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.85}
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Text>
                {!loading && <ArrowRight size={18} color="white" />}
              </TouchableOpacity>

              {/* INFO TEXT */}
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  We'll send a verification code to your email. Please check your inbox and spam folder.
                </Text>
              </View>

              {/* BACK TO LOGIN */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Remember your password?</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.footerLink}>Log In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },

  /* BACK BUTTON */
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: '#D6D3FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  /* HEADER */
  header: {
    alignItems: 'center',
    marginBottom: 32, 
    marginTop: height * 0.1, 
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  /* FORM */
  form: {
    gap: 16, 
  },
  
  // Input Box
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)', 
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50, 
    borderWidth: 1,
    borderColor: '#D6D3FF',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14, 
    fontWeight: '600',
    color: '#111827',
    height: '100%',
    backgroundColor: 'transparent',
  },

  /* INFO BOX */
  infoBox: {
    backgroundColor: 'rgba(191,183,253,0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D6D3FF',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* BUTTON */
  submitBtn: {
    marginTop: 8,
    backgroundColor: '#bfb7fd',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* FOOTER */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4f46e5',
  },
});