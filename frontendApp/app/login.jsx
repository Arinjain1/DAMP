import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    Mail,
} from 'lucide-react-native';
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
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../src/store/slices/authSlice';

const { height } = Dimensions.get('window');

export default function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dispatch(
        loginSuccess({
          id: 1,
          name: 'Rajesh Sharma',
          email,
          phone: '+91 98765 43210',
        })
      );
    }, 1200);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <LinearGradient
        colors={['#BFB7FD', '#E5E1FF', '#ffffff']}
        locations={[0, 0.25, 1]}
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
            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.brokerText}>BROKER</Text>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>99</Text>
                </View>
              </View>

              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>
              {/* EMAIL */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputBox}>
                  <Mail size={16} color="#BFB7FD" strokeWidth={2.5} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View style={styles.inputGroup}>
                <View style={styles.passwordRow}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                    <Text style={styles.forgot}>Forgot?</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputBox}>
                  <Lock size={16} color="#BFB7FD" strokeWidth={2.5} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#6b7280" strokeWidth={2.5} />
                    ) : (
                      <Eye size={16} color="#6b7280" strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* LOGIN BUTTON */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
                style={[
                  styles.loginBtn,
                  loading && { opacity: 0.7 }
                ]}
              >
                <LinearGradient
                  colors={['#BFB7FD', '#A89EF8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.loginText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                  {!loading && <ArrowRight size={18} color="#111827" strokeWidth={2.5} />}
                </LinearGradient>
              </TouchableOpacity>

              {/* REGISTER */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.footerLink}>Create Account</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  /* HEADER */
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: height * 0.06,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  brokerText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.8,
  },
  numberBadge: {
    backgroundColor: '#BFB7FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  numberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 5,
    fontWeight: '500',
  },

  /* FORM */
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(191, 183, 253, 0.3)',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  forgot: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9F95F5',
  },

  /* BUTTON */
  loginBtn: {
    marginTop: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBtn: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* FOOTER */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9F95F5',
  },
});