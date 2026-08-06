import {
  ArrowRight,
  Briefcase,
  Clock,
  Plus,
  UserPlus
} from 'lucide-react-native';
import { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { Image } from 'expo-image';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Dimensions,
  InteractionManager,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { dashboardAPI } from '../config/api';
import {
  INITIAL_PROFILE,
} from '../MockData/Mockdata';
import Skeleton from '../Components/Skeleton';

const { width: screenWidth } = Dimensions.get('window');

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <View style={styles.timeRow}>
            <Clock size={10} color="#9ca3af" />
            <Text style={styles.timeText}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {taskNote?.includes('[Collaborated]') && (
            <View style={{ backgroundColor: '#BFB7FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#7c3aed' }}>COLLABORATED</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});
TaskCard.displayName = 'TaskCard';

const Dashboard = ({ 
  properties = [], 
  customers = [], 
  followUps = [], 
  onOpenCollab, 
  onOpenDeal, 
  onNavigate, 
  onOpenModal 
}) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentDate = useMemo(() => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }, []);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const hasValidSession = isAuthenticated && !!user?.token;

  const activeDeals = dashboardData?.active_deals || [];
  const unreadCount = 2;

  // FIX: isBackground add kiya taaki skeleton bar bar na aaye
  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!hasValidSession) {
      if (!isBackground) {
        setLoading(false);
      }
      return;
    }

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
  }, [hasValidSession]);

  // Sirf pehli baar pura load hoga (with skeleton)
  useEffect(() => {
    if (!hasValidSession) {
      return;
    }

    fetchDashboardData(false);
  }, [fetchDashboardData, hasValidSession]);

  // Tab focus hone par "Silent Refresh" hoga (no skeleton)
  useFocusEffect(
    useCallback(() => {
      if (!hasValidSession) {
        return;
      }

      // Agar data pehle se hai, toh background refresh karo
      if (dashboardData !== null) {
        const task = InteractionManager.runAfterInteractions(() => {
          fetchDashboardData(true);
        });
        return () => task.cancel();
      }
    }, [fetchDashboardData, dashboardData, hasValidSession])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(true); // Pull-to-refresh pe native spinner chalega, skeleton nahi
    setRefreshing(false);
  };

  const stats = dashboardData?.stats || {
    total_visitor: customers.length,
    total_sale: 0,
    pending: 0,
    rejected: 0,
  };

  const todaysTasks = useMemo(() => {
    const localPending = followUps.filter(f => f.status === 'Pending');
    const combined = [...(dashboardData?.todays_focus || [])];
    localPending.forEach(task => {
      if (!combined.some(c => c.id === task.id)) {
        const taskDate = new Date(task.date);
        const today = new Date();
        const isToday = taskDate.getDate() === today.getDate() &&
                        taskDate.getMonth() === today.getMonth() &&
                        taskDate.getFullYear() === today.getFullYear();
        if (isToday || task.note?.includes('[Collaborated]')) {
          combined.unshift(task);
        }
      }
    });
    return combined.slice(0, 5);
  }, [dashboardData?.todays_focus, followUps]);

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
                <View style={styles.nameColumn}>
                  <Skeleton width={120} height={16} borderRadius={4} />
                  <Skeleton width={80} height={12} borderRadius={4} />
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

            <Image
              source={require('../../assets/images/ChatGPT Image Jul 28, 2026, 11_18_12 PM 1.png')}
              style={styles.bannerImage}
              contentFit="contain"
            />
          </View>

          {/* Body Skeleton */}
          <View style={styles.body}>
            <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 15 }} />
            
            {/* Quick Features Skeleton */}
            <View style={styles.quickFeaturesContainer}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.navItem}>
                  <Skeleton width={54} height={54} borderRadius={14} style={{ marginBottom: 2 }} />
                  <Skeleton width={40} height={11} borderRadius={4} />
                </View>
              ))}
            </View>

            <View style={{ marginTop: 12 }}>
              <Skeleton width={screenWidth - 40} height={((screenWidth - 40) / 2.122) - 110} borderRadius={18} />
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
              <View style={styles.nameColumn}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Image 
                    source={require('../../assets/images/pajamas_partner-verified.png')} 
                    style={styles.verificationBadge}
                    contentFit="contain"
                  />
                </View>
                <Text style={styles.dateText}>{currentDate}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.bellButton}>
              <Image 
                source={require('../../assets/images/famicons_notifications.png')} 
                style={styles.notificationIcon}
                contentFit="contain"
              />
              {unreadCount > 0 && <View style={styles.dot} />}
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsOuterBox}>
            <StatBlock label="Total Visitor" count={stats.total_visitor} />
            <StatBlock label="Matches" count={stats.total_sale} />
            <StatBlock label="Pending" count={stats.pending} />
            <StatBlock label="Rejected" count={stats.rejected} />
          </View>

          <Image
            source={require('../../assets/images/ChatGPT Image Jul 28, 2026, 11_18_12 PM 1.png')}
            style={styles.bannerImage}
            contentFit="contain"
          />
        </View>

        {/* ================= BODY ================= */}
        <View style={styles.body}>
          
          <Text style={styles.sectionTitle}>Quick Features</Text>
          
          <View style={styles.quickFeaturesContainer}>
            <NavItem icon={UserPlus} label="New Lead" onPress={() => onOpenModal?.('Customer')} />
            <NavItem icon={Plus} label="Add Prop" onPress={() => onOpenModal?.('Property')} />
            <NavItem icon={Briefcase} label="Deal" onPress={() => onNavigate?.('/deals')} />
          </View>

          <TouchableOpacity 
            style={styles.collabBannerButton}
            onPress={onOpenCollab}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/images/Group 1597884459.png')}
              style={styles.collabBannerImage}
              contentFit="contain"
            />
          </TouchableOpacity>

          {/* ================= MATCH OPPORTUNITIES (Page 7/8 in PDF) ================= */}
          <View style={{ marginTop: 24 }}>
            <View style={styles.focusHeader}>
              <Text style={styles.sectionTitle}>Match Opportunities</Text>
              <TouchableOpacity style={styles.viewAll} onPress={onOpenCollab}>
                <Text style={styles.viewAllText}>View All</Text>
                <ArrowRight size={14} color="#968CE4" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
              {[
                { id: 1, name: 'Ravi Sir', compat: 91, price: '₹75-90 L', spec: '2 BHK Flat • Andheri East', tag: 'MATCHING PROPERTY', colorBg: '#f5f3ff', colorBorder: '#ddd6fe', colorText: '#7c3aed', btnStyle: styles.matchCardBtnPurple },
                { id: 5, name: 'Sita Properties', compat: 84, price: '₹70-85 L', spec: 'Requires 2 BHK • Andheri West', tag: 'MATCHING CLIENT', colorBg: '#eff6ff', colorBorder: '#bfdbfe', colorText: '#1d4ed8', btnStyle: styles.matchCardBtnDark },
                { id: 3, name: 'Gopal Realty', compat: 77, price: '₹78-92 L', spec: '2 BHK Flat • Andheri East', tag: 'MATCHING PROPERTY', colorBg: '#f5f3ff', colorBorder: '#ddd6fe', colorText: '#7c3aed', btnStyle: styles.matchCardBtnPurple }
              ].map(item => (
                <View key={item.id} style={styles.matchOpportunityCard}>
                  <View style={[styles.matchCardTag, { backgroundColor: item.colorBg, borderColor: item.colorBorder, marginBottom: 6 }]}>
                    <Text style={[styles.matchCardTagText, { color: item.colorText }]}>{item.tag} • {item.compat}%</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.matchCardTitle}>{item.name}</Text>
                    <Text style={[styles.matchCardTitle, { color: '#635BFF' }]}>{item.price}</Text>
                  </View>
                  <Text style={[styles.matchCardSubtitle, { marginBottom: 10 }]}>{item.spec}</Text>
                  <TouchableOpacity 
                    style={item.btnStyle} 
                    onPress={() => onOpenCollab?.(null, item.id)}
                  >
                    <Text style={styles.matchCardBtnTextLight}>View Details</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ================= ACTIVE COLLABORATIONS ================= */}
          <View style={{ marginTop: 24 }}>
            <View style={styles.focusHeader}>
              <Text style={styles.sectionTitle}>Active Collaborations</Text>
              <TouchableOpacity style={styles.viewAll} onPress={onOpenCollab}>
                <Text style={styles.viewAllText}>View All</Text>
                <ArrowRight size={14} color="#968CE4" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.activeCollabCard} onPress={() => onOpenCollab?.(1)} activeOpacity={0.9}>
              <View style={styles.collabAvatar}>
                <Text style={styles.collabAvatarText}>R</Text>
              </View>
              <View style={styles.collabInfo}>
                <Text style={styles.collabName}>Rahul Sharma</Text>
                <Text style={styles.collabDetails}>Gokuldham • Client for 2 BHK</Text>
                <View style={styles.collabBadge}>
                  <Text style={styles.collabBadgeText}>Site Visit Scheduled</Text>
                </View>
              </View>
              <View style={styles.collabProgressBox}>
                <Text style={styles.collabProgressText}>50 / 50</Text>
                <Text style={styles.openRoomLink}>Open room ›</Text>
              </View>
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
                  contentFit="contain"
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
    //paddingBottom: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: screenWidth - 20,
    height: (screenWidth - 20) / 2.258,
    alignSelf: 'flex-end',
    marginRight: -20,
    marginTop: -6,
    zIndex: -1,
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
    marginBottom: 20,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameColumn: { flexDirection: 'column', justifyContent: 'center', gap: 2 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { fontSize: 18, color: '#000000' , fontFamily:'Lato_700Bold' },
  dateText: { fontSize: 11, fontWeight: '500', color: '#5B5B5B', fontFamily: 'MONTSERRAT_500' },
  verificationBadge: { width: 16, height: 16 },
  bellButton: { padding: 12, borderRadius: 16, position: 'relative' },
  notificationIcon: { width: 24, height: 24 },
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
    zIndex: 1,
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
  
  quickFeaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
    marginBottom: 16,
    zIndex: 10,
  },

  navItem: { 
    alignItems: 'center',
    minWidth: 48, 
  },

  navIconContainer: {
    width: 54, 
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F3F4F8',
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

  collabBannerButton: {
    borderRadius: 14,
    overflow: 'cover',
    marginBottom: 0,
    marginTop: -100,
    zIndex: 1,
  },

  collabBannerImage: {
    width: screenWidth - 40,
    height: (screenWidth - 40) / 2.122,
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
  // Match Opportunities (Page 7/8 in PDF)
  matchOpportunityCard: {
    width: 280,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 3,
  },
  matchCardTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  matchCardTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  matchCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  matchCardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  matchCardBtnDark: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  matchCardBtnPurple: {
    backgroundColor: '#7c3aed',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  matchCardBtnTextLight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Active Collaborations
  activeCollabCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  collabAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ddd6fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collabAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
  },
  collabInfo: {
    flex: 1,
  },
  collabName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  collabDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  collabBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  collabBadgeText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '700',
  },
  collabProgressBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  collabProgressText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  openRoomLink: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
  },
});
