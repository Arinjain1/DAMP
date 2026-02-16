import {
    ArrowRight,
    Briefcase,
    Clock,
    Handshake,
    Plus,
    UserPlus
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { dashboardAPI } from '../config/api';
import {
    INITIAL_CUSTOMERS,
    INITIAL_DEALS,
    INITIAL_FOLLOWUPS,
    INITIAL_PROFILE,
    INITIAL_PROPERTIES,
} from '../MockData/Mockdata';

// Currency formatter
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const Dashboard = ({ onOpenCollab, onOpenDeal, onNavigate, onOpenModal }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get logged-in user from Redux
  const { user } = useSelector(state => state.auth);

  // Fallback to mock data
  const properties = INITIAL_PROPERTIES;
  const customers = INITIAL_CUSTOMERS;
  const followUps = INITIAL_FOLLOWUPS;
  const activeDeals = dashboardData?.active_deals || INITIAL_DEALS;
  const unreadCount = 2;

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getOverview();
        
        if (response.data.success) {
          setDashboardData(response.data.data);
          setError(null);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        // Continue with mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Use API data if available, otherwise use mock data
  const stats = dashboardData?.stats || {
    total_visitor: customers.length,
    total_sale: INITIAL_DEALS.filter(d => d.stage === 'Completed').length,
    pending: INITIAL_DEALS.filter(d => d.stage !== 'Completed').length,
    rejected: 0,
  };

  const todaysTasks = dashboardData?.todays_focus || followUps.filter(f => f.status === 'Pending').slice(0, 3);

  // Memoize expensive calculations
  const getStageBadgeStyle = useMemo(() => (stage) => {
    const colors = {
      Meeting: { bg: '#F3F1FF', text: '#5B4DFF' },
      'Site Visit': { bg: '#F0ECFF', text: '#5B21B6' },
      Negotiation: { bg: '#FDF2F8', text: '#9D174D' },
      Agreement: { bg: '#E0F2FE', text: '#075985' },
      Token: { bg: '#DCFCE7', text: '#047857' },
    };
    return colors[stage] || { bg: '#F3F4F6', text: '#374151' };
  }, []);

  // Memoize filtered data
  const pendingFollowUps = useMemo(() => 
    todaysTasks,
    [todaysTasks]
  );

  const NavItem = ({ icon: Icon, label, onPress }) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <View style={styles.navIconContainer}>
        <Icon size={24} color="#1F2937" strokeWidth={1.5} />
      </View>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const StatBlock = ({ label, count }) => (
    <View style={styles.statInnerBox}>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Show error banner if API failed but continue with mock data */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Using offline data. {error}</Text>
        </View>
      )}

      {loading ? (
        // Skeleton Loader
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/Group 1.png')}
              style={styles.headerDecoration}
            />
            
            <View style={styles.profileRow}>
              <View style={styles.profileLeft}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonNameContainer}>
                  <View style={styles.skeletonName} />
                </View>
              </View>
              <View style={styles.skeletonBell} />
            </View>

            {/* Stats Skeleton */}
            <View style={styles.statsOuterBox}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.statInnerBox}>
                  <View style={styles.skeletonStatCount} />
                  <View style={styles.skeletonStatLabel} />
                </View>
              ))}
            </View>
          </View>

          {/* Body Skeleton */}
          <View style={styles.body}>
            <View style={styles.skeletonSectionTitle} />
            
            {/* Quick Actions Skeleton */}
            <View style={styles.billPaymentsWrapper}>
              <View style={styles.iconsGroup}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.skeletonNavItem}>
                    <View style={styles.skeletonNavIcon} />
                    <View style={styles.skeletonNavLabel} />
                  </View>
                ))}
              </View>
              <View style={styles.brokerBlock}>
                <View style={styles.skeletonBrokerText} />
                <View style={styles.skeletonBrokerNumber} />
              </View>
            </View>

            {/* Active Deals Skeleton */}
            <View style={{ marginTop: 24 }}>
              <View style={styles.skeletonSectionTitle} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.skeletonDealCard}>
                    <View style={styles.skeletonDealTop}>
                      <View style={styles.skeletonDealImage} />
                      <View style={{ flex: 1, gap: 8 }}>
                        <View style={styles.skeletonDealTitle} />
                        <View style={styles.skeletonDealSubtitle} />
                      </View>
                    </View>
                    <View style={styles.skeletonDealBottom}>
                      <View style={styles.skeletonDealBadge} />
                      <View style={styles.skeletonDealPrice} />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Today's Focus Skeleton */}
            <View style={{ marginTop: 24 }}>
              <View style={styles.skeletonSectionTitle} />
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonTaskCard}>
                  <View style={styles.skeletonDateBox} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <View style={styles.skeletonTaskTitle} />
                    <View style={styles.skeletonTaskNote} />
                    <View style={styles.skeletonTaskTime} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/Group 1.png')}
            style={styles.headerDecoration}
          />

          <View style={styles.profileRow}>
            <View style={styles.profileLeft}>
              <Image source={{ uri: INITIAL_PROFILE.avatar }} style={styles.avatar} />
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Image 
                  source={require('../../assets/images/pajamas_partner-verified.png')} 
                  style={styles.verificationBadge}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.bellButton}>
              <Image 
                source={require('../../assets/images/famicons_notifications.png')} 
                style={styles.notificationIcon}
              />
              {unreadCount > 0 && <View style={styles.dot} />}
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsOuterBox}>
            <StatBlock label="Total Visitor" count={stats.total_visitor} />
            <StatBlock label="Total Sale" count={stats.total_sale} />
            <StatBlock label="Pending" count={stats.pending} />
            <StatBlock label="Rejected" count={stats.rejected} />
          </View>
        </View>

        {/* ================= BODY ================= */}
        <View style={styles.body}>
          
          <Text style={styles.sectionTitle} className=''>Quick Actions</Text>
          
          {/* --- MODIFIED BILL PAYMENTS CONTAINER --- */}
          <View style={styles.billPaymentsWrapper}>
            
            {/* Left Side: The 4 Icons */}
            <View style={styles.iconsGroup}>
              <NavItem icon={UserPlus} label="New Lead" onPress={() => onOpenModal?.('Customer')} />
              <NavItem icon={Plus} label="Add Prop" onPress={() => onOpenModal?.('Property')} />
              <NavItem icon={Briefcase} label="Deal" onPress={() => onNavigate?.('/deals')} />
              <NavItem icon={Handshake} label="Collab" onPress={onOpenCollab} />
            </View>

            {/* Right Side: Broker Card (Touches Edge) */}
            <TouchableOpacity style={styles.brokerBlock}>
              <Text style={styles.brokerLabel}>Broker</Text>
              <Text style={styles.brokerNumber}>99</Text>
            </TouchableOpacity>

          </View>
          {/* -------------------------------------- */}

          {/* Active Deals */}
          {activeDeals.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Active Deals</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {activeDeals.map((deal) => {
                  const property = properties.find(p => p.id === deal.propertyId);
                  const customer = customers.find(c => c.id === deal.customerId);
                  const stage = getStageBadgeStyle(deal.stage);

                  return (
                    <TouchableOpacity
                      key={deal.id}
                      style={styles.dealCard}
                      onPress={() => onOpenDeal(deal)}
                    >
                      <View style={styles.dealTop}>
                        <Image source={{ uri: property?.image }} style={styles.dealImage} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dealTitle}>{property?.title}</Text>
                          <Text style={styles.dealSubtitle}>{customer?.name}</Text>
                        </View>
                      </View>

                      <View style={styles.dealBottom}>
                        <View style={[styles.stageBadge, { backgroundColor: stage.bg }]}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: stage.text }}>
                            {deal.stage}
                          </Text>
                        </View>
                        <Text style={styles.price}>{formatCurrency(property?.price)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Today's Focus */}
          <View style={{ marginTop: 24 }}>
            <View style={styles.focusHeader}>
              <Text style={styles.sectionTitle}>Today’s Focus</Text>
              <TouchableOpacity style={styles.viewAll}>
                <Text style={styles.viewAllText}>View All</Text>
                <ArrowRight size={14} color="#968CE4" />
              </TouchableOpacity>
            </View>

            {pendingFollowUps.length === 0 ? (
              <View style={styles.emptyState}>
                <Image 
                  source={require('../../assets/images/rafiki.png')} 
                  style={styles.emptyStateImage}
                  resizeMode="contain"
                />
                <Text style={styles.emptyStateTitle}>All Clear!</Text>
                <Text style={styles.emptyStateText}>
                  No tasks for today. Time to relax or plan ahead!
                </Text>
              </View>
            ) : (
              pendingFollowUps.map(task => {
                const customer = customers.find(c => c.id === task.customerId);
                const date = new Date(task.date);

                return (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateMonth}>
                        {date.toLocaleString('default', { month: 'short' })}
                      </Text>
                      <Text style={styles.dateDay}>{date.getDate()}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle}>{customer?.name}</Text>
                      <Text style={styles.taskNote} numberOfLines={1}>
                        {task.note}
                      </Text>
                      <View style={styles.timeRow}>
                        <Clock size={10} color="#9ca3af" />
                        <Text style={styles.timeText}>
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
      )}
    </View>
  );
};

export default Dashboard;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    backgroundColor: '#BFB7FD',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 25 : 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  headerDecoration: {
    position: 'absolute',
    width: 245,
    height: 245,
    opacity: 0.95,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 52,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { fontSize: 18, fontWeight: '700', color: '#313131' },
  verificationBadge: { width: 16, height: 16, resizeMode: 'contain' },
  bellButton: { padding: 12, borderRadius: 16, position: 'relative' },
  notificationIcon: { width: 24, height: 24, resizeMode: 'contain' },
  dot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  statsOuterBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  statInnerBox: {
    flex: 1,
    backgroundColor: '#F2F0FF',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statCount: { fontSize: 14, fontWeight: '400' },
  statLabel: { fontSize: 11, marginTop: 6 },
  
  // Body Padding is 20
  body: { padding: 20 },
  
  sectionTitle: { fontFamily: 'MONTSERRAT_700' , fontSize: 16, fontWeight: '700', marginBottom: 15 , color:'#313131'},

  /* --- MODIFIED BILL PAYMENTS STYLES --- */
  
  billPaymentsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -20, 
    marginBottom: 4,
  },

  iconsGroup: {
    flex: 1, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 22, 
  },

  navItem: { 
    alignItems: 'center',
    minWidth: 50, 
  },

  navIconContainer: {
    width: 54, 
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  navLabel: { 
    fontSize: 11, 
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center' 
  },

  brokerBlock: {
    backgroundColor: '#E9e6f7',
    width: 80, 
    height: 80, 
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    
    alignItems: 'center',
    justifyContent: 'center',
  },

  brokerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 0,
    fontFamily: 'MONTSERRAT_600',
  },

  brokerNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 1,
    fontFamily: 'MONTSERRAT_600',
  },
  
  errorBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
  },
  errorText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    fontFamily: 'MONTSERRAT_500',
  },
  /* ------------------------------------ */

  dealCard: {
    width: 280,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dealTop: { flexDirection: 'row', gap: 12 },
  dealImage: { width: 40, height: 40, borderRadius: 10 },
  dealTitle: { fontWeight: '500', fontSize: 13 },
  dealSubtitle: { fontFamily: 'MONTSERRAT_400', fontSize: 11, color: '#6b7280' },
  stageBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dealBottom: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextStep: { fontSize: 12, color: '#9ca3af' },
  price: { fontSize: 13, fontWeight: '800' },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: { flexDirection: 'row',  gap: 4 , bottom:8},
  viewAllText: { fontSize: 12, fontWeight: '700', color: '#968CE4' },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: { fontSize: 10, fontWeight: '700', color: '#6b7280' },
  dateDay: { fontSize: 18, fontWeight: '900' },
  taskTitle: { fontWeight: '700' },
  taskNote: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  timeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  timeText: { fontSize: 10, fontWeight: '700', color: '#9ca3af' , bottom :3},
});

// Skeleton Loader Styles - Added after closing brace
const skeletonStyles = StyleSheet.create({
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  skeletonNameContainer: {
    gap: 6,
  },
  skeletonName: {
    width: 120,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonBell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  skeletonStatCount: {
    width: 30,
    height: 14,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonStatLabel: {
    width: 50,
    height: 11,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
  },
  skeletonSectionTitle: {
    width: 120,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 15,
  },
  skeletonNavItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  skeletonNavIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    marginBottom: 2,
  },
  skeletonNavLabel: {
    width: 40,
    height: 11,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonBrokerText: {
    width: 50,
    height: 12,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonBrokerNumber: {
    width: 30,
    height: 12,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
  },
  skeletonDealCard: {
    width: 280,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonDealTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  skeletonDealImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  skeletonDealTitle: {
    height: 13,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonDealSubtitle: {
    height: 11,
    width: '60%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonDealBottom: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonDealBadge: {
    width: 80,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  skeletonDealPrice: {
    width: 60,
    height: 13,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonTaskCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonDateBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  skeletonTaskTitle: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonTaskNote: {
    height: 12,
    width: '80%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonTaskTime: {
    height: 10,
    width: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateImage: {
    width: 180,
    height: 180,
    marginBottom: 14,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

// Merge skeleton styles with main styles
Object.assign(styles, skeletonStyles);
