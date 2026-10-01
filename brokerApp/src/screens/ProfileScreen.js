import React from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation, onRenew }) {
  const dispatch = useDispatch();

  // Get logged-in user from Redux
  const user = useSelector((state) => state.auth.user);

  const name = user?.name || user?.full_name || 'Broker Partner';
  const email = user?.email || user?.mobile || '+91 98765 43210';
  const subscriptionPrice = '₹ 99';
  const expiryDate = 'Expire on 12th July';
  const unreadCount = 2; // Notification count

  const getInitials = (name) => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          navigation.getParent()?.replace('Auth') || navigation.navigate('Auth');
        },
      },
    ]);
  };

  const handleRenewPlan = () => {
    Alert.alert('Subscription', 'Renewal options and plan upgrade details will appear here.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#065239" />

      {/* ================= SCROLLABLE CONTENT ================= */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Green Header Section (Replaced Pink/Purple with #065239) */}
        <View style={styles.greenHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Notifications', 'You have 2 unread notifications.')}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* PROFILE CARD - Name & Email */}
        <View style={styles.profileCard}>
          {/* PROFILE IMAGE (Half in / Half out) */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarTouchable}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {getInitials(name)}
                </Text>
              </View>
              {/* Green Status Dot */}
              <View style={styles.statusDot} />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        {/* Subscription Card - Full Width, No Background */}
        <TouchableOpacity
          style={styles.subscriptionCard}
          onPress={handleRenewPlan}
          activeOpacity={0.7}
        >
          <View style={styles.subscriptionLeft}>
            <Text style={styles.subscriptionLabel}>Subscription</Text>
            <View style={styles.priceRow}>
              <Text style={styles.subscriptionPrice}>{subscriptionPrice}</Text>
              <Text style={styles.expiryText}>({expiryDate})</Text>
            </View>
          </View>
          <Image
            source={require('../../assets/image 13.png')}
            style={styles.subscriptionIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* ACCOUNT DETAILS */}
          <Text style={styles.sectionTitle}>Account Details</Text>

          <MenuItem
            icon={<Ionicons name="person-outline" size={22} color="#6B7280" />}
            title="Profile Information"
            subtitle="Manage account details"
            onPress={() => Alert.alert('Profile Information', `Name: ${name}\nMobile: ${email}\nCity: ${user?.city || 'Gurgaon'}\nRERA: ${user?.reraNumber || 'HRERA-PKL-GGM-1249'}`)}
          />

          <MenuItem
            icon={<Ionicons name="shield-checkmark-outline" size={22} color="#6B7280" />}
            title="Identity Verification"
            badge="(Verified)"
            subtitle="Check your verified status"
            onPress={() => Alert.alert('KYC Status', 'Your RERA Broker identity is fully verified.')}
          />

          {/* OTHER DETAILS */}
          <Text style={styles.sectionTitle}>Other Details</Text>

          <MenuItem
            icon={<Ionicons name="help-circle-outline" size={22} color="#6B7280" />}
            title="Support Hub"
            subtitle="FAQs and help center"
            onPress={() => Alert.alert('Support Hub', 'Support team is available 24/7 at support@brokerapp.com')}
          />
          <MenuItem
            icon={<Ionicons name="document-text-outline" size={22} color="#6B7280" />}
            title="Terms & Conditions"
            onPress={() => Alert.alert('Terms & Conditions', 'Broker Partner Terms of Service v2.4')}
          />
          <MenuItem
            icon={<Ionicons name="lock-closed-outline" size={22} color="#6B7280" />}
            title="Data Privacy"
            onPress={() => Alert.alert('Data Privacy', 'Your customer and deals data is 256-bit encrypted.')}
          />

          {/* LOGOUT */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* --- REUSABLE COMPONENT --- */
const MenuItem = ({ icon, title, subtitle, badge, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuIconCircle}>
      {icon}
    </View>

    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        {badge && (
          <Text style={styles.badgeText}>{badge}</Text>
        )}
      </View>
      {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
    </View>

    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

/* --- STYLES --- */
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: 90,
  },

  // Green Header Section (Replaced Pink/Purple #A78BFA with #065239)
  greenHeader: {
    backgroundColor: '#065239',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 2 : 40,
    paddingBottom: 60,
    paddingHorizontal: 10,
    height: 195,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.3,
    fontFamily: 'Manrope_700Bold',
  },
  notificationButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },

  // Profile Card (Name & Email only)
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    paddingTop: 60,
    paddingHorizontal: 16,
    marginTop: -75,
    
  },

  // Avatar Section
  avatarContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: -45,
    alignSelf: 'center',
  },
  avatarTouchable: {
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 60,
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: '#065239',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 18,
    height: 18,
    backgroundColor: '#10B981',
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#fff',
  },

  // Profile Info
  profileInfo: {
    bottom: 18,
    alignItems: 'center',
    marginBottom: 13,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Manrope_700Bold',
    fontWeight: '600',
    color: '#111827',
    
    textAlign: 'center',
  },
  email: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },

  // Subscription Card (Full Width with Border)
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    minHeight: 85,
    top:-10
  },
  subscriptionLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 0,
  },
  subscriptionLabel: {
    fontSize: 14,
    color: '#6B7280',
    bottom:-9,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  subscriptionPrice: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    color: '#111827',
  },
  expiryText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
  },
  subscriptionIcon: {
    width: 70,
    height: 70,
  },

  // Content Section
  contentSection: {
    paddingHorizontal: 16,
    
  },

  // Lists
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    color: '#111827',
    marginVertical: 12,
    right:-14
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
  },
  badgeText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '400',
    fontFamily: 'Inter_500Medium',
  },
  menuSub: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },

  // Logout
  logoutBtn: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
};
