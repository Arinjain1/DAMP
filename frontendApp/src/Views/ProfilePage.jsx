import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  Camera,
  ChevronRight,
  CreditCard,
  LogOut,
  Settings,
  ShieldCheck,
  Zap
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

const ProfilePage = ({ subscription, onRenew }) => {
  const dispatch = useDispatch();
  const profile = INITIAL_PROFILE;
  const [profileImage, setProfileImage] = useState(profile.avatar);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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

  const handlePhotoPress = () => {
    setPhotoSheetVisible(true);
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
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
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* 🌈 COMPACT GRADIENT HEADER */}
      <LinearGradient
        colors={['#BFB7FD', '#E5E1FF', '#f9fafb']}
        locations={[0, 0.65, 1]}
        style={{
          paddingTop: Platform.OS === 'android'
            ? StatusBar.currentHeight + 16
            : 52,
          paddingBottom: 56,
          alignItems: 'center',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        {/* Profile Image */}
        <TouchableOpacity
          onPress={handlePhotoPress}
          style={{
            height: 92,
            width: 92,
            borderRadius: 46,
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: 4,
            marginBottom: 8,
          }}
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={{ height: '100%', width: '100%', borderRadius: 46 }}
            />
          ) : (
            <View
              style={{
                height: '100%',
                width: '100%',
                borderRadius: 46,
                backgroundColor: '#8B5CF6',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '900',
                  color: 'white',
                }}
              >
                {getInitials(profile.name)}
              </Text>
            </View>
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#8B5CF6',
              borderRadius: 12,
              padding: 4,
              borderWidth: 2,
              borderColor: 'white',
            }}
          >
            <Camera size={12} color="white" />
          </View>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: '900', color: '#111827' }}>
          {profile.name}
        </Text>
        <Text style={{ fontSize: 12, color: '#4b5563', fontWeight: '600' }}>
          {profile.designation}
        </Text>

        {/* Badges */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {profile.badges.map((badge, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: badge.bgColor,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
              }}
            >
              <Award size={10} color={badge.color} />
              <Text style={{ fontSize: 10, fontWeight: '800', color: badge.color }}>
                {badge.label}
              </Text>
            </View>
          ))}

          <View
            style={{
              backgroundColor: 'white',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#374151' }}>
              ID: {profile.brokerId}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* CONTENT */}
      <View style={{ paddingHorizontal: 16, marginTop: -32, gap: 14 }}>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Deals', value: profile.stats.deals.toString() },
            { label: 'Clients', value: profile.stats.clients.toString() },
            { label: 'Properties', value: profile.stats.activeListings.toString() }
          ].map((s, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 16,
                paddingVertical: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#6b7280' }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Subscription */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <CreditCard size={16} color="#4f46e5" />
              <Text style={{ fontSize: 14, fontWeight: '800' }}>
                Subscription
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
                backgroundColor: subscription.active ? '#dcfce7' : '#fee2e2',
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '800',
                  color: subscription.active ? '#166534' : '#991b1b',
                }}
              >
                {subscription.active ? 'ACTIVE' : 'EXPIRED'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onRenew}
            style={{
              marginTop: 8,
              backgroundColor: '#3E3E3E',
              paddingVertical: 10,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Zap size={14} color="white" />
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
              {subscription.active ? 'Manage Plan' : 'Upgrade to Pro'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        {[
          { icon: Settings, label: 'App Settings' },
          { icon: ShieldCheck, label: 'Privacy & Security' }
        ].map((a, i) => (
          <TouchableOpacity
            key={i}
            style={{
              backgroundColor: 'white',
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <a.icon size={16} color="#374151" />
              <Text style={{ fontWeight: '700', color: '#374151', fontSize: 13 }}>
                {a.label}
              </Text>
            </View>
            <ChevronRight size={16} color="#9ca3af" />
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#fee2e2',
            padding: 14,
            borderRadius: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <LogOut size={16} color="#dc2626" />
          <Text style={{ color: '#dc2626', fontWeight: '800', fontSize: 13 }}>
            Sign Out
          </Text>
        </TouchableOpacity>

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
              onPress={() => {
                setPhotoSheetVisible(false);
                openCamera();
              }}
            >
              <Text style={styles.sheetBtnText}>📷 Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.sheetBtn}
              onPress={() => {
                setPhotoSheetVisible(false);
                openGallery();
              }}
            >
              <Text style={styles.sheetBtnText}>🖼️ Gallery</Text>
            </TouchableOpacity>
            
            {profileImage && (
              <TouchableOpacity
                style={[styles.sheetBtn, styles.removeBtn]}
                onPress={() => {
                  setPhotoSheetVisible(false);
                  handleRemovePhoto();
                }}
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

const styles = {
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
