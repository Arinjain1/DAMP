import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  LogOut,
  Shield,
  User,
  HelpCircle,
  FileText,
  Lock
} from 'lucide-react-native';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SUBSCRIPTION_PLANS } from '../Constants/Constants';
import { Image } from 'react-native';
import { logout } from '../store/slices/authSlice';
import { clearAuthToken } from '../config/api';

const { width } = Dimensions.get('window');

export default function ProfilePage({ onRenew, onLogout }) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get logged-in user from Redux
  const { user } = useSelector(state => state.auth);

  const name = user?.name || user?.full_name || 'User';
  const email = user?.email || '';
  const subscriptionPrice = SUBSCRIPTION_PLANS?.[0]?.price ? `₹ ${SUBSCRIPTION_PLANS[0].price}` : '₹ 99';
  const expiryDate = 'Expire on 12th July';
  const unreadCount = 2; // Mock notification count

  const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    // Clear token from API config
    clearAuthToken();

    // Dispatch logout action
    dispatch(logout());

    // Navigation will be handled automatically by auth state change
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A78BFA" />

      {/* ================= SCROLLABLE CONTENT ================= */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Purple Header Section */}
        <View style={styles.purpleHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              onPress={() => { }}
              style={styles.notificationButton}
            >
              <Bell size={24} color="#fff" />
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
          onPress={onRenew}
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
            source={require('../../assets/images/image 13.png')}
            style={styles.subscriptionIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* ACCOUNT DETAILS */}
          <Text style={styles.sectionTitle}>Account Details</Text>

          <MenuItem
            icon={<User size={22} color="#6B7280" />}
            title="Profile Information"
            subtitle="Manage account details"
            onPress={() => router.push('/profile-information')}
          />

          <MenuItem
            icon={<Shield size={22} color="#6B7280" />}
            title="Identity Verification"
            badge="(Verified)"
            subtitle="Check your verified status"
          />

          {/* OTHER DETAILS */}
          <Text style={styles.sectionTitle}>Other Details</Text>

          <MenuItem
            icon={<HelpCircle size={22} color="#6B7280" />}
            title="Support Hub"
            subtitle="FAQs and help center"
            onPress={() => router.push('/support-hub')}
          />
          <MenuItem
            icon={<FileText size={22} color="#6B7280" />}
            title="Terms & Conditions"
          />
          <MenuItem
            icon={<Lock size={22} color="#6B7280" />}
            title="Data Privacy"
          />

          {/* LOGOUT (Bottom Spacing included) */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() =>
              Alert.alert('Sign Out', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: handleLogout },
              ])
            }
          >
            <LogOut size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </View>
  );
}

/* --- REUSABLE COMPONENT --- */
const MenuItem = ({ icon, title, subtitle, badge, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
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

    <ChevronRight size={20} color="#9CA3AF" />
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
    paddingBottom: 50,
  },

  // Purple Header Section (Scrollable)
  purpleHeader: {
    backgroundColor: '#A78BFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 50,
    paddingBottom: 60,
    paddingHorizontal: 10,
    height: 200,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0.3,
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
    //paddingBottom: 20,
    paddingHorizontal: 16,

    marginTop: -65,
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
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '700',
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
    bottom: 8,
    alignItems: 'center',
    marginBottom: 13,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Manrope_600SemiBold',
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
  },

  // Subscription Card (Full Width with Border)
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    //paddingVertical: 6,
    marginTop: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    minHeight: 90,
  },
  subscriptionLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 0,
  },
  subscriptionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 0,
    fontWeight: '400',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subscriptionPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    //fontWeight: '700',
    color: '#111827',

  },
  expiryText: {
    fontSize: 12,

    color: '#EF4444',
    fontWeight: '400',
  },
  subscriptionIcon: {
    width: 70,
    height: 70,
  },

  // Content Section
  contentSection: {
    paddingHorizontal: 16,
    paddingTop: 8,

  },

  // Lists
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginVertical: 8,
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
    color: '#111827',
  },
  badgeText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '400',
  },
  menuSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Logout
  logoutBtn: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
};