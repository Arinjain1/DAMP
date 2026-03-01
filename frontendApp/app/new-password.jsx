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
import { loginSuccess } from '../src/store/slices/authSlice';
import { showToast } from '../src/utils/toast';

export default function NewPassword() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) return;

    if (formData.newPassword !== formData.confirmPassword) {
      showToast.error('Passwords do not match!');
      return;
    }

    if (formData.newPassword.length < 8) {
      showToast.error('Password must be at least 8 characters long!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast.success('Password reset successfully!');

      const userData = {
        id: 1,
        name: 'Rajesh Sharma',
        email: 'rajesh@example.com',
        phone: '+91 98765 43210'
      };
      dispatch(loginSuccess(userData));
    }, 1500);
  };

  const isFormValid = formData.newPassword && formData.confirmPassword;

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
            <Text style={styles.title}>New{'\n'}Password</Text>
            <Text style={styles.subtitle}>
              Create a strong password for your account
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            {/* NEW PASSWORD */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.newPassword}
                onChangeText={(value) => handleChange('newPassword', value)}
                placeholder="New Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              onPress={handleResetPassword}
              style={[
                styles.continueBtn,
                (!isFormValid || loading) && { opacity: 0.5 }
              ]}
              disabled={!isFormValid || loading}
            >
              <Text style={styles.continueText}>
                {loading ? 'Updating...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>

            {/* BACK TO LOGIN */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Remember password?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.signupLink}> Sign In</Text>
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

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 33,
    paddingTop: 60,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#15151520',
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 42,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 60,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1A1D1B',
  },

  form: {
    gap: 18,
  },

  passwordContainer: {
    position: 'relative',
  },

  passwordInput: {
    height: 60,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingRight: 60,
    fontSize: 16,
    fontWeight: '400',
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    color: '#111827',
    backgroundColor: 'transparent',
  },

  eyeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueBtn: {
    backgroundColor: '#C4B5FD',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 66,
  },

  continueText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  signupText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },

  signupLink: {
    fontSize: 14,
    color: '#AFA0F8',
    fontWeight: '600',
  },

  footer: {
    marginTop: 'auto',
    marginBottom: 28,
    paddingHorizontal: 10,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
    lineHeight: 18,
  },

  link: {
    textDecorationLine: 'underline',
    fontWeight: '700',
    color: '#374151',
  },
});