import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
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

const { height } = Dimensions.get('window');

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
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    if (formData.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long!');
      return;
    }

    console.log('🔥 New Password - Resetting password...');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('🔥 New Password - Password reset successful, auto-logging in...');
      Alert.alert(
        'Success!', 
        'Your password has been reset successfully. You will be logged in automatically.',
        [
          {
            text: 'OK',
            onPress: () => {
              const userData = {
                id: 1,
                name: 'Rajesh Sharma',
                email: 'rajesh@example.com',
                phone: '+91 98765 43210'
              };
              console.log('🔥 New Password - Dispatching loginSuccess, user will be logged in');
              dispatch(loginSuccess(userData));
            }
          }
        ]
      );
    }, 1500);
  };

  const handleBack = () => {
    router.back();
  };

  const isFormValid = formData.newPassword && formData.confirmPassword;
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
              onPress={handleBack} 
              style={styles.backButton}
            >
              <ArrowLeft size={20} color="#111827" />
            </TouchableOpacity>

            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Lock size={48} color="#111827" />
              </View>
              <Text style={styles.title}>New Password</Text>
              <Text style={styles.subtitle}>
                Create a strong password for your account
              </Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>
              
              {/* NEW PASSWORD */}
              <View style={styles.inputBox}>
                <Lock size={18} color={iconColor} />
                <TextInput
                  value={formData.newPassword}
                  onChangeText={(value) => handleChange('newPassword', value)}
                  placeholder="New Password"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? (
                    <EyeOff size={18} color={iconColor} />
                  ) : (
                    <Eye size={18} color={iconColor} />
                  )}
                </TouchableOpacity>
              </View>

              {/* CONFIRM PASSWORD */}
              <View style={styles.inputBox}>
                <Lock size={18} color={iconColor} />
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleChange('confirmPassword', value)}
                  placeholder="Confirm Password"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={iconColor} />
                  ) : (
                    <Eye size={18} color={iconColor} />
                  )}
                </TouchableOpacity>
              </View>

              {/* PASSWORD REQUIREMENTS */}
              <View style={styles.requirementsBox}>
                <Text style={styles.requirementsTitle}>Password Requirements</Text>
                
                <View style={styles.requirementRow}>
                  <CheckCircle 
                    size={16} 
                    color={formData.newPassword.length >= 8 ? '#10b981' : '#d1d5db'} 
                  />
                  <Text style={[
                    styles.requirementText,
                    { color: formData.newPassword.length >= 8 ? '#10b981' : '#6b7280' }
                  ]}>
                    At least 8 characters
                  </Text>
                </View>

                <View style={styles.requirementRow}>
                  <CheckCircle 
                    size={16} 
                    color={/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? '#10b981' : '#d1d5db'} 
                  />
                  <Text style={[
                    styles.requirementText,
                    { color: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? '#10b981' : '#6b7280' }
                  ]}>
                    Uppercase & lowercase
                  </Text>
                </View>

                <View style={styles.requirementRow}>
                  <CheckCircle 
                    size={16} 
                    color={/\d/.test(formData.newPassword) ? '#10b981' : '#d1d5db'} 
                  />
                  <Text style={[
                    styles.requirementText,
                    { color: /\d/.test(formData.newPassword) ? '#10b981' : '#6b7280' }
                  ]}>
                    Contains number
                  </Text>
                </View>
                
                {/* PASSWORD MATCH */}
                {formData.confirmPassword && (
                  <View style={styles.requirementRow}>
                    <CheckCircle 
                      size={16} 
                      color={formData.newPassword === formData.confirmPassword ? '#10b981' : '#ef4444'} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: formData.newPassword === formData.confirmPassword ? '#10b981' : '#ef4444' }
                    ]}>
                      Passwords match
                    </Text>
                  </View>
                )}
              </View>

              {/* SUBMIT BUTTON */}
              <TouchableOpacity 
                onPress={handleResetPassword}
                style={[
                  styles.submitButton, 
                  (!isFormValid || loading) && { opacity: 0.5 }
                ]}
                disabled={!isFormValid || loading}
                activeOpacity={0.85}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Updating...' : 'Reset Password'}
                </Text>
              </TouchableOpacity>

              {/* BACK TO LOGIN */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Remember password?</Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.footerLink}>Sign In</Text>
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
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 40,
  },

  /* BACK BUTTON */
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: '#D6D3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  /* HEADER */
  header: {
    alignItems: 'center',
    marginTop: height * 0.02,
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
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
  },

  /* FORM */
  form: {
    gap: 14,
  },
  
  /* INPUT BOX */
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

  /* REQUIREMENTS BOX */
  requirementsBox: {
    backgroundColor: 'rgba(191,183,253,0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D6D3FF',
    marginTop: 4,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },

  /* SUBMIT BUTTON */
  submitButton: {
    marginTop: 8,
    backgroundColor: '#bfb7fd',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 12,
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