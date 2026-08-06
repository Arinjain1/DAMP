import { ArrowLeft, Camera as CameraIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { userAPI } from '../src/config/api';
import { showToast } from '../src/utils/toast';

export default function ProfileInformation() {
  const router = useRouter();
  const { user } = useSelector(state => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();

      if (response?.data?.success) {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.log('Profile fetch error:', error);
      setProfileData(user);
    } finally {
      setLoading(false);
    }
  };

  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);

  const openCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      handleUpdateAvatar(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!mediaPermission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      handleUpdateAvatar(result.assets[0].uri);
    }
  };

  const handleUpdateAvatar = async (newUri) => {
    try {
      const updated = { ...displayData, avatar: newUri };
      setProfileData(updated);
      await userAPI.updateProfile({ avatar: newUri });
      showToast.success('Profile photo updated successfully!');
    } catch (error) {
      console.log('Update avatar error:', error);
      showToast.error('Could not save profile photo.');
    }
  };

  const displayData = profileData || user;

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Not provided'}</Text>
    </View>
  );

  const SkeletonLoader = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A78BFA" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section Skeleton */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarPlaceholder, styles.skeleton]} />
          <View style={styles.nameContainer}>
            <View style={[styles.skeletonText, { width: '70%', height: 22 }]} />
            <View style={[styles.skeletonText, { width: '50%', height: 14, marginTop: 8 }]} />
          </View>
        </View>

        {/* Info Card Skeleton */}
        <View style={styles.card}>
          <View style={[styles.skeletonText, { width: '60%', height: 16, marginBottom: 16 }]} />
          
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <View key={item} style={styles.infoRow}>
              <View style={[styles.skeletonText, { width: '40%', height: 12, marginBottom: 4 }]} />
              <View style={[styles.skeletonText, { width: '80%', height: 15 }]} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A78BFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            onPress={() => setPhotoSheetVisible(true)} 
            style={styles.avatarPlaceholder}
            activeOpacity={0.85}
          >
            {displayData?.avatar ? (
              <Image source={{ uri: displayData.avatar }} style={{ width: '100%', height: '100%', borderRadius: 45 }} />
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.avatarInitial}>
                  {displayData?.full_name?.charAt(0)?.toUpperCase() ||
                    displayData?.name?.charAt(0)?.toUpperCase() ||
                    'U'}
                </Text>
                <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#7c3aed', padding: 4, borderRadius: 10, borderWidth: 1.5, borderColor: '#fff' }}>
                  <CameraIcon size={10} color="#fff" />
                </View>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>
              {displayData?.full_name ||
                displayData?.name ||
                'User'}
            </Text>

            <Text style={styles.profileRole}>
              Real Estate Broker
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          <InfoRow label="Full Name" value={displayData?.full_name || displayData?.name} />
          <InfoRow label="Email Address" value={displayData?.email} />
          <InfoRow label="Contact Number" value={displayData?.phone_number} />
          <InfoRow label="Age" value={displayData?.age} />
          <InfoRow label="City" value={displayData?.city} />
          <InfoRow label="Role" value={displayData?.role} />
          <InfoRow label="User ID" value={displayData?.id} />
          <InfoRow
            label="Member Since"
            value={
              displayData?.created_at
                ? new Date(displayData.created_at).toLocaleDateString(
                    'en-IN',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )
                : 'N/A'
            }
          />
        </View>
      </ScrollView>

      {/* Photo Selection Sheet */}
      <Modal visible={photoSheetVisible} transparent animationType="slide">
        <TouchableOpacity 
          activeOpacity={1} 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} 
          onPress={() => setPhotoSheetVisible(false)}
        >
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>Select Profile Photo</Text>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }} 
              onPress={() => { setPhotoSheetVisible(false); openCamera(); }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#374151' }}>📷 Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }} 
              onPress={() => { setPhotoSheetVisible(false); openGallery(); }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#374151' }}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }} 
              onPress={() => setPhotoSheetVisible(false)}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#ef4444' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    backgroundColor: '#A78BFA',
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight + 12
        : 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },

  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E9D5FF',
  },

  avatarInitial: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '700',
  },

  nameContainer: {
    marginLeft: 16,
    flex: 1,
  },

  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  profileRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  infoRow: {
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },

  skeleton: {
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },

  skeletonText: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
});
