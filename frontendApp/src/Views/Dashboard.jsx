import {
  ArrowRight,
  Briefcase,
  Clock,
  Handshake,
  Plus,
  UserPlus
} from 'lucide-react-native';
import { useEffect, useMemo, useState, useCallback, memo } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { dashboardAPI } from '../config/api';
import {
  INITIAL_CUSTOMERS,
  INITIAL_DEALS,
  INITIAL_FOLLOWUPS,
  INITIAL_PROFILE,
  INITIAL_PROPERTIES,
} from '../MockData/Mockdata';
import Skeleton from '../Components/Skeleton';

// Currency formatter
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

// Memoized components
const NavItem = memo(({ icon: Icon, label, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <View style={styles.navIconContainer}>
      <Icon size={24} color="#1F2937" strokeWidth={1.5} />
    </View>
    <Text style={styles.navLabel}>{label}</Text>
  </TouchableOpacity>
));
NavItem.displayName = 'NavItem';

const StatBlock = memo(({ label, count }) => (
  <View style={styles.statInnerBox}>
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
));
StatBlock.displayName = 'StatBlock';

const DealCard = memo(({ deal, properties, customers, getStageBadgeStyle, onOpenDeal }) => {
  const propertyTitle = deal.property_title || properties.find(p => p.id === deal.propertyId)?.title;
  const propertyImage = deal.cover_image_url || properties.find(p => p.id === deal.propertyId)?.image;
  const propertyPrice = deal.listing_price || deal.final_price || properties.find(p => p.id === deal.propertyId)?.price;
  const clientName = deal.client_name || customers.find(c => c.id === deal.customerId)?.name;
  const dealStatus = deal.status || deal.stage;
  const stage = getStageBadgeStyle(dealStatus);

  return (
    <TouchableOpacity
      style={styles.dealCard}
      onPress={() => onOpenDeal(deal)}
    >
      <View style={styles.dealTop}>
        <Image source={{ uri: propertyImage }} style={styles.dealImage} />
        <View style={{ flex: 1 }}>
          <Text style={styles.dealTitle}>{propertyTitle}</Text>
          <Text style={styles.dealSubtitle}>{clientName}</Text>
        </View>
      </View>

      <View style={styles.dealBottom}>
        <View style={[styles.stageBadge, { backgroundColor: stage.bg }]}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: stage.text }}>
            {dealStatus}
          </Text>
        </View>
        <Text style={styles.price}>{formatCurrency(propertyPrice)}</Text>
      </View>
    </TouchableOpacity>
  );
});
DealCard.displayName = 'DealCard';

const TaskCard = memo(({ task, customers }) => {
  const taskDate = task.due_date || task.date;
  const clientName = task.client_name || customers.find(c => c.id === task.customerId)?.name;
  const taskNote = task.title || task.note;
  const date = new Date(taskDate);

  return (
    <View style={styles.taskCard}>
      <View style={styles.dateBox}>
        <Text style={styles.dateMonth}>
          {date.toLocaleString('default', { month: 'short' })}
        </Text>
        <Text style={styles.dateDay}>{date.getDate()}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{clientName || 'Client'}</Text>
        <Text style={styles.taskNote} numberOfLines={1}>
          {taskNote}
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
});
TaskCard.displayName = 'TaskCard';

const Dashboard = ({ onOpenCollab, onOpenDeal, onNavigate, onOpenModal }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useSelector(state => state.auth);

  const properties = INITIAL_PROPERTIES;
  const customers = INITIAL_CUSTOMERS;
  const followUps = INITIAL_FOLLOWUPS;
  const activeDeals = dashboardData?.active_deals || INITIAL_DEALS;
  const unreadCount = 2;

  // FIX: isBackground add kiya taaki skeleton bar bar na aaye
  const fetchDashboardData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true); // Sirf tabhi loading lagao jab initial load ho
      }
      const response = await dashboardAPI.getOverview();
      
      if (response.data.success) {
        setDashboardData(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, []);

  // Sirf pehli baar pura load hoga (with skeleton)
  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Tab focus hone par "Silent Refresh" hoga (no skeleton)
  useFocusEffect(
    useCallback(() => {
      // Agar data pehle se hai, toh background refresh karo
      if (dashboardData !== null) {
        fetchDashboardData(true);
      }
    }, [fetchDashboardData, dashboardData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(true); // Pull-to-refresh pe native spinner chalega, skeleton nahi
    setRefreshing(false);
  };

  const stats = dashboardData?.stats || {
    total_visitor: customers.length,
    total_sale: INITIAL_DEALS.filter(d => d.stage === 'Completed').length,
    pending: INITIAL_DEALS.filter(d => d.stage !== 'Completed').length,
    rejected: 0,
  };

  const todaysTasks = dashboardData?.todays_focus || followUps.filter(f => f.status === 'Pending').slice(0, 3);

  const getStageBadgeStyle = useMemo(() => (stage) => {
    const colors = {
      Meeting: { bg: '#F3F1FF', text: '#5B4DFF' },
      'Site Visit': { bg: '#F0ECFF', text: '#5B21B6' },
      Negotiation: { bg: '#FDF2F8', text: '#9D174D' },
      Agreement: { bg: '#E0F2FE', text: '#075985' },
      Token: { bg: '#DCFCE7', text: '#047857' },
      Interested: { bg: '#FEF3C7', text: '#D97706' },
      'In-Process': { bg: '#F3F1FF', text: '#5B4DFF' },
      Closed: { bg: '#DCFCE7', text: '#047857' },
      Lost: { bg: '#FEE2E2', text: '#DC2626' },
    };
    return colors[stage] || { bg: '#F3F4F6', text: '#374151' };
  }, []);

  const pendingFollowUps = useMemo(() => 
    todaysTasks,
    [todaysTasks]
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Using offline data. {error}</Text>
        </View>
      )}

      {loading && !dashboardData ? ( // FIX: Agar data aa chuka hai toh wapas skeleton mat dikhao
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/Group 1.png')}
              style={styles.headerDecoration}
            />
            
            <View style={styles.profileRow}>
              <View style={styles.profileLeft}>
                <Skeleton width={48} height={48} borderRadius={16} />
                <View style={{ gap: 6 }}>
                  <Skeleton width={120} height={16} borderRadius={4} />
                </View>
              </View>
              <Skeleton width={40} height={40} circle />
            </View>

            {/* Stats Skeleton */}
            <View style={styles.statsOuterBox}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.statInnerBox}>
                  <Skeleton width={30} height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                  <Skeleton width={50} height={11} borderRadius={4} />
                </View>
              ))}
            </View>
          </View>

          {/* Body Skeleton */}
          <View style={styles.body}>
            <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 15 }} />
            
            {/* Quick Actions Skeleton */}
            <View style={styles.billPaymentsWrapper}>
              <View style={styles.iconsGroup}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.navItem}>
                    <Skeleton width={54} height={54} borderRadius={14} style={{ marginBottom: 2 }} />
                    <Skeleton width={40} height={11} borderRadius={4} />
                  </View>
                ))}
              </View>
              <View style={styles.brokerBlock}>
                <Skeleton width={50} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                <Skeleton width={30} height={12} borderRadius={4} />
              </View>
            </View>

            {/* Active Deals Skeleton */}
            <View style={{ marginTop: 24 }}>
              <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 15 }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.dealCard}>
                    <View style={styles.dealTop}>
                      <Skeleton width={40} height={40} borderRadius={10} />
                      <View style={{ flex: 1, gap: 8 }}>
                        <Skeleton height={13} borderRadius={4} />
                        <Skeleton height={11} width="60%" borderRadius={4} />
                      </View>
                    </View>
                    <View style={styles.dealBottom}>
                      <Skeleton width={80} height={20} borderRadius={6} />
                      <Skeleton width={60} height={13} borderRadius={4} />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Today's Focus Skeleton */}
            <View style={{ marginTop: 24 }}>
              <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 15 }} />
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.taskCard}>
                  <Skeleton width={48} height={48} borderRadius={12} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton height={14} borderRadius={4} />
                    <Skeleton height={12} width="80%" borderRadius={4} />
                    <Skeleton height={10} width={60} borderRadius={4} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
          
          <View style={styles.billPaymentsWrapper}>
            
            <View style={styles.iconsGroup}>
              <NavItem icon={UserPlus} label="New Lead" onPress={() => onOpenModal?.('Customer')} />
              <NavItem icon={Plus} label="Add Prop" onPress={() => onOpenModal?.('Property')} />
              <NavItem icon={Briefcase} label="Deal" onPress={() => onNavigate?.('/deals')} />
              <NavItem icon={Handshake} label="Collab" onPress={onOpenCollab} />
            </View>

            <TouchableOpacity style={styles.brokerBlock}>
              <Text style={styles.brokerLabel}>Broker</Text>
              <Text style={styles.brokerNumber}>99</Text>
            </TouchableOpacity>

          </View>

          {/* Active Deals */}
          {activeDeals.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Active Deals</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {activeDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    properties={properties}
                    customers={customers}
                    getStageBadgeStyle={getStageBadgeStyle}
                    onOpenDeal={onOpenDeal}
                  />
                ))}
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
              pendingFollowUps.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  customers={customers}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
      )}
    </View>
  );
};

export default memo(Dashboard);

/* ================= STYLES ================= */
// (Keep your styles exactly as they are)
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
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