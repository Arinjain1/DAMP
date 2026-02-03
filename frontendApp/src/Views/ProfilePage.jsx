import * as ImagePicker from 'expo-image-picker';
import {
  Bell,
  Camera,
  ChevronRight,
  LogOut,
  Shield,
  User
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch } from 'react-redux';
import { INITIAL_PROFILE } from '../MockData/Mockdata';
import { logout } from '../store/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const profile = INITIAL_PROFILE;
  const [profileImage, setProfileImage] = useState(profile.avatar);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'M';
    return name.charAt(0).toUpperCase();
  };

  const handlePhotoPress = () => {
    setPhotoSheetVisible(true);
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    setPhotoSheetVisible(false);
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
    setPhotoSheetVisible(false);
  };

  const openGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
    setPhotoSheetVisible(false);
  }; 

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            console.log('🔥 Profile - User logging out...');
            dispatch(logout());
          },
        },
      ]
    );
  };

  // Helper for text colors to make them lighter than black
  const colors = {
    textPrimary: '#232c38e5', // Softer Dark Gray
    textSecondary: '#6B7280', // Medium Gray
    purpleBg: '#BFB7FD',
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      style={{ flex: 1, backgroundColor: '#ffffff' }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header - Centered Title */}
      <View style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 22 : 44,
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Keeps Bell on right
        backgroundColor: '#ffffff',
        position: 'relative'
      }}>
        {/* Empty View to balance the flex layout if needed, but Absolute positioning is better for centering */}
        <View style={{ width: 20 }} /> 

        {/* Absolutely Centered Title */}
        <Text style={{ 
          fontSize: 20, 
          fontWeight: '700', 
          color: colors.textPrimary,
          position: 'absolute',
          left: 0, 
          right: 0,
          textAlign: 'center',
          bottom: 16,
          fontFamily: 'Poppins_700Bold'
        }}>
          Profile
        </Text>

        <TouchableOpacity>
          <Bell size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={{ alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 }}>
        
        {/* Profile Image */}
        <TouchableOpacity 
          onPress={handlePhotoPress}
          style={{ position: 'relative', marginBottom: 6 }}
        >
          <View style={{
            width: 86,
            height: 86,
            borderRadius: 42,
            backgroundColor: 'white',
            padding: 2,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              overflow: 'hidden',
              backgroundColor: '#f3f4f6'
            }}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <View style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#8B5CF6',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: 'white',
                    fontFamily: 'Montserrat_700Bold'
                  }}>
                    {getInitials(profile.name)}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {/* Camera Icon */}
          <View style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: '#8B5CF6',
            borderRadius: 12,
            padding: 4,
            borderWidth: 2,
            borderColor: 'white'
          }}>
            <Camera size={12} color="white" />
          </View>
        </TouchableOpacity>

        {/* Name and Email */}
        <Text style={{ 
          fontSize: 19, 
          fontWeight: '700', 
          color: '#1f2937f3', 
          marginBottom: 2,
          fontFamily: 'Poppins_700Bold'
        }}>
          {profile.name}
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: '#6B7280', 
          marginBottom: 20,
          fontFamily: 'Manrope_400Regular'
        }}>
          {profile.email}
        </Text>

        {/* Subscription Card */}
        <View style={{
          width: '100%',
          backgroundColor: '#DAD5FB', // Slightly different purple for contrast
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          // If you have LinearGradient, wrap this view in it
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ 
                fontSize: 13, 
                fontWeight: '800', 
                color: colors.textPrimary, 
                marginBottom: 4, 
                letterSpacing: 0.5,
                fontFamily: 'Poppins_700Bold'
              }}>
                SUBSCRIPTION
              </Text>
              <Text style={{ 
                fontSize: 13, 
                color: '#4b5563', 
                fontWeight: '500',
                fontFamily: 'Manrope_500Medium'
              }}>
                SHDSJDJGSJDG
              </Text>
            </View>
            <View style={{
              backgroundColor: '#8b5cf6',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8
            }}>
              <Text style={{ 
                fontSize: 11, 
                fontWeight: '700', 
                color: '#ffffff',
                fontFamily: 'Poppins_700Bold'
              }}>
                FOR SALE
              </Text>
            </View>
          </View>
        </View>

        {/* Account Details Label */}
        <View style={{ width: '100%', marginBottom: 20 }}>
          <Text style={{ 
            fontSize: 15, 
            fontWeight: '700', 
            color: colors.textPrimary, 
            marginBottom: 16, 
            paddingHorizontal: 16,
            fontFamily: 'Poppins_700Bold'
          }}>
            Account Details
          </Text>

          {/* Profile Information Item */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <User size={18} color="#6b7280" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Profile Information</Text>
              <Text style={styles.menuSubtitle}>Manage account details</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          {/* Identity Verification Item */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Shield size={18} color="#6b7280" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={styles.menuTitle}>Identity Verification</Text>
                <View style={{
                  backgroundColor: '#dcfce7',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  marginLeft: 8
                }}>
                  <Text style={{ 
                  fontSize: 10, 
                  fontWeight: '700', 
                  color: '#166534',
                  fontFamily: 'Manrope_700Bold'
                }}>Verified</Text>
                </View>
              </View>
              <Text style={styles.menuSubtitle}>Check your verified status</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          {/* Support Section (The Purple Grid) */}
          <View style={{
            backgroundColor: '#DAD5FB',
            marginTop:6,
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 16,
            overflow: 'hidden' // Ensures image doesn't bleed out
          }}>
            {/* 1. Support Hub */}
            <TouchableOpacity style={styles.purpleItem}>
              <Text style={styles.purpleItemText}>Support Hub</Text>
            </TouchableOpacity>

            {/* Separator Image 1 */}
            <Image 
                source={require('../../assets/images/Line 3.png')} 
                style={{ width: '100%', height: 1, opacity: 0.6 }} 
                resizeMode="cover"
            />

            {/* 2. Terms */}
            <TouchableOpacity style={styles.purpleItem}>
              <Text style={styles.purpleItemText}>Terms & Conditions</Text>
            </TouchableOpacity>

            {/* Separator Image 2 */}
            <Image 
                source={require('../../assets/images/Line 3.png')} 
                style={{ width: '100%', height: 1, opacity: 0.6 }} 
                resizeMode="cover"
            />

            {/* 3. Data Privacy */}
            <TouchableOpacity style={styles.purpleItem}>
              <Text style={styles.purpleItemText}>Data Privacy</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              backgroundColor: '#FEF2F2',
              borderRadius: 12,
              gap: 8
            }}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={{ 
              fontSize: 15, 
              fontWeight: '700', 
              color: '#EF4444',
              fontFamily: 'Poppins_700Bold'
            }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Photo Selection Bottom Sheet */}
      <Modal
        visible={photoSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoSheetVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.sheetOverlay}
          onPress={() => setPhotoSheetVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Profile Photo</Text>
            
            <TouchableOpacity
              style={styles.sheetBtn}
              onPress={openCamera}
            >
              <Text style={styles.sheetBtnText}>📷 Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.sheetBtn}
              onPress={openGallery}
            >
              <Text style={styles.sheetBtnText}>🖼️ Gallery</Text>
            </TouchableOpacity>
            
            {profileImage && (
              <TouchableOpacity
                style={[styles.sheetBtn, styles.removeBtn]}
                onPress={handleRemovePhoto}
              >
                <Text style={[styles.sheetBtnText, styles.removeText]}>🗑️ Remove Photo</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.sheetBtn, styles.cancelBtn]}
              onPress={() => setPhotoSheetVisible(false)}
            >
              <Text style={[styles.sheetBtnText, styles.cancelText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

// Extracted styles for cleaner code and reusability
const styles = {
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eaecf0',
    backgroundColor: '#FFFFFF'
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eaecf0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1F2937',
    fontFamily: 'Manrope_500Medium',
    marginBottom:-1,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Manrope_400Regular',
    marginBottom:2,
  },
  // Purple Section Styles
  purpleItem: {
    paddingVertical: 12, // Increased padding for equal spacing
    justifyContent: 'center',
    paddingHorizontal:10,
  },
  purpleItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937e2',
    fontFamily: 'Poppins_600SemiBold'
  },
  // Photo Selection Bottom Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
    fontFamily: 'Poppins_700Bold'
  },
  sheetBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
    alignItems: 'center',
  },
  sheetBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'Manrope_600SemiBold'
  },
  cancelBtn: {
    backgroundColor: '#fee2e2',
  },
  cancelText: {
    color: '#b91c1c',
  },
  removeBtn: {
    backgroundColor: '#fef3c7',
  },
  removeText: {
    color: '#d97706',
  },
};

export default ProfilePage;