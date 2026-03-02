import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from '../styles/profileStyles';

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

export default ProfileView;
