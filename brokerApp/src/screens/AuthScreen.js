import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';
import CardLayout from '../components/CardLayout';

const AuthScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  // Steps: 'mobile' -> 'details' -> 'otp'
  const [step, setStep] = useState('mobile');

  // Form states
  const [mobile, setMobile] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');

  // 4-digit OTP state
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const [loading, setLoading] = useState(false);

  // --- Handlers ---
  const handleMobileSubmit = () => {
    if (!mobile.trim() || mobile.trim().length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid mobile number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('details');
    }, 400);
  };

  const handleDetailsSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) < 18) {
      Alert.alert('Invalid Age', 'Please enter a valid age (18+).');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Required Field', 'Please enter your city.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 400);
  };

  const handleOtpChange = (val, index) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpSubmit = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the complete 4-digit OTP.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dispatch(
        loginSuccess({
          mobile: mobile.trim(),
          name: name.trim() || 'Broker Partner',
          age: age.trim() || '28',
          city: city.trim() || 'Gurgaon',
        })
      );
      navigation?.replace('MainTabs');
    }, 500);
  };

  // --- Step 1: Mobile Number View (Matches Reference Image Exactly) ---
  const renderMobileStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.fieldLabel}>Mobile Number</Text>
      <TextInput
        style={styles.inputBox}
        placeholder="Enter Mobile No."
        placeholderTextColor="#94A3B8"
        keyboardType="phone-pad"
        value={mobile}
        onChangeText={setMobile}
      />

      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.rememberMeContainer}
          activeOpacity={0.7}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Text style={styles.checkboxCheckmark}>✓</Text>}
          </View>
          <Text style={styles.rememberMeText}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Alert.alert('Forgot Password', 'Password reset instructions have been sent.')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.85}
        onPress={handleMobileSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Log In</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // --- Step 2: Details View (Name, Age, City) ---
  const renderDetailsStep = () => (
    <View style={styles.stepContainer}>
     

      <Text style={styles.fieldLabel}>Full Name</Text>
      <TextInput
        style={styles.inputBox}
        placeholder="Enter your name"
        placeholderTextColor="#94A3B8"
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Age</Text>
      <TextInput
        style={styles.inputBox}
        placeholder="Enter your age"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        maxLength={3}
        value={age}
        onChangeText={setAge}
      />

      <Text style={[styles.fieldLabel, { marginTop: 14 }]}>City</Text>
      <TextInput
        style={styles.inputBox}
        placeholder="Enter your city"
        placeholderTextColor="#94A3B8"
        value={city}
        onChangeText={setCity}
      />

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.85}
        onPress={handleDetailsSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryLink}
        onPress={() => setStep('mobile')}
      >
        <Text style={styles.secondaryLinkText}>← Change Mobile Number</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Step 3: OTP Verification View ---
  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>OTP Verification</Text>
      <Text style={styles.stepSubtitle}>
        Enter the 4-digit code sent to{' '}
        <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#1E293B' }}>{mobile}</Text>
      </Text>

      <View style={styles.otpBoxesRow}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={otpRefs[idx]}
            style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(val) => handleOtpChange(val, idx)}
            onKeyPress={(e) => handleOtpKeyPress(e, idx)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.85}
        onPress={handleOtpSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Verify & Proceed</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendRow}>
        <Text style={styles.resendPrompt}>Didn't receive code? </Text>
        <TouchableOpacity
          onPress={() => {
            setOtp(['', '', '', '']);
            Alert.alert('OTP Resent', 'A new 4-digit OTP has been sent to your phone.');
          }}
        >
          <Text style={styles.resendLink}>Resend OTP</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.secondaryLink}
        onPress={() => setStep('details')}
      >
        <Text style={styles.secondaryLinkText}>← Edit Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <CardLayout>
      {step === 'mobile' && renderMobileStep()}
      {step === 'details' && renderDetailsStep()}
      {step === 'otp' && renderOtpStep()}
    </CardLayout>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    marginTop:10,
    width: '100%',
  },
  stepTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 18,
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#6C7278',
    marginBottom: 8,
  },
  inputBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#EDF1F3',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1A1C1E',
    backgroundColor: '#FFFFFF',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -1,
  },
  rememberMeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  forgotPasswordText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#3B82F6',
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#111827',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
    
  },
  primaryButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  secondaryLink: {
    alignSelf: 'center',
    marginTop: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  secondaryLinkText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  // OTP input specific styles
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    textAlign: 'center',
    fontFamily: 'Manrope_700Bold',
    fontSize: 22,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  otpBoxFilled: {
    borderColor: '#2C5849',
    backgroundColor: '#FFFFFF',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendPrompt: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  resendLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#2C5849',
  },
});

export default AuthScreen;
