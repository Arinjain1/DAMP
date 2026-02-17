import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ProfileView = () => {
  const router = useRouter();

  const profileData = {
    name: 'Manas Gangrade',
    email: 'manasgangrade@gmail.com',
    avatar: 'https://via.placeholder.com/150',
    subscription: {
      price: '₹ 99',
      expiry: 'Expire on 12th July',
    },
    isVerified: true,
  };

  const MenuItem = ({ icon, title, subtitle, onPress, showBadge }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={24} color="#666" />
      </View>

      <View style={styles.menuTextContainer}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle}>{title}</Text>
          {showBadge && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>(Verified)</Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profileData.avatar }}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>

          <Text style={styles.profileName}>
            {profileData.name}
          </Text>
          <Text style={styles.profileEmail}>
            {profileData.email}
          </Text>
        </View>

        {/* Subscription Card */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionLeft}>
            <Text style={styles.subscriptionLabel}>
              Subscription
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.subscriptionPrice}>
                {profileData.subscription.price}
              </Text>
              <Text style={styles.subscriptionExpiry}>
                ({profileData.subscription.expiry})
              </Text>
            </View>
          </View>

          <Image
            source={{ uri: 'https://via.placeholder.com/80' }}
            style={styles.subscriptionIcon}
          />
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account Details
          </Text>

          <MenuItem
            icon="person-outline"
            title="Profile Information"
            subtitle="Manage account details"
            onPress={() =>
              router.push('/profile-information')
            }
          />

          <MenuItem
            icon="card-outline"
            title="Identify Verification"
            subtitle="Check your verified status"
            onPress={() =>
              router.push('/identity-verification')
            }
            showBadge={profileData.isVerified}
          />
        </View>

        {/* Other Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Other Details
          </Text>

          <MenuItem
            icon="help-circle-outline"
            title="Support Hub"
            onPress={() => router.push('/support')}
          />

          <MenuItem
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={() =>
              router.push('/terms-and-conditions')
            }
          />

          <MenuItem
            icon="shield-checkmark-outline"
            title="Data Privacy"
            onPress={() => router.push('/privacy')}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8B7FD9',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  notificationButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginTop: -30,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subscriptionLeft: {
    flex: 1,
  },
  subscriptionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  subscriptionExpiry: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  subscriptionIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  menuIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#666',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 3,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default ProfileView;
