import {
  ArrowRight,
  Briefcase,
  Clock,
  Handshake,
  Plus,
  UserPlus,
  Bell,
  LogOut,
  Search,
  PlusCircle,
  LayoutDashboard,
  Users,
  User,
  Settings,
  Check,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Calendar,
  MessageSquare,
  MapPin,
  Building2,
  Phone
} from 'lucide-react-native';
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import styles, { skeletonStyles } from '../styles/dashboardStyles';

// Merge skeleton styles with main styles
Object.assign(styles, skeletonStyles);

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
  const [refreshing, setRefreshing] = useState(false);

  // Get logged-in user from Redux
  const { user } = useSelector(state => state.auth);

  // Fallback to mock data
  const properties = INITIAL_PROPERTIES;
  const customers = INITIAL_CUSTOMERS;
  const followUps = INITIAL_FOLLOWUPS;
  const activeDeals = dashboardData?.active_deals || INITIAL_DEALS;
  const unreadCount = 2;

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Use API data if available, otherwise use mock data
  const stats = dashboardData?.stats || {
    total_visitor: customers.length,
    total_sale: INITIAL_DEALS.filter(d => d.stage === 'Completed').length,
    pending: INITIAL_DEALS.filter(d => d.stage !== 'Completed').length,
    rejected: 0,
    network_count: 99, // Fallback for local UI
  };

  const todaysTasks = dashboardData?.todays_focus || followUps.filter(f => f.status === 'Pending').slice(0, 3);

  // Memoize expensive calculations
  const getStageBadgeStyle = useMemo(() => (stage) => {
    const colors = {
      // Frontend stages
      Meeting: { bg: '#F3F1FF', text: '#5B4DFF' },
      'Site Visit': { bg: '#F0ECFF', text: '#5B21B6' },
      Negotiation: { bg: '#FDF2F8', text: '#9D174D' },
      Agreement: { bg: '#E0F2FE', text: '#075985' },
      Token: { bg: '#DCFCE7', text: '#047857' },
      // Backend statuses
      Interested: { bg: '#FEF3C7', text: '#D97706' },
      'In-Process': { bg: '#F3F1FF', text: '#5B4DFF' },
      Closed: { bg: '#DCFCE7', text: '#047857' },
      Lost: { bg: '#FEE2E2', text: '#DC2626' },
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
              <TouchableOpacity style={styles.brokerBlock} onPress={onOpenCollab}>
                <Text style={styles.brokerLabel}>Broker</Text>
                <Text style={styles.brokerNumber}>{stats.network_count}</Text>
              </TouchableOpacity>

            </View>
            {/* -------------------------------------- */}

            {/* Active Deals */}
            {activeDeals.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Active Deals</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {activeDeals.map((deal) => {
                    // Handle both API format and mock format
                    const propertyTitle = deal.property_title || properties.find(p => p.id === deal.propertyId)?.title;
                    const propertyImage = deal.cover_image_url || properties.find(p => p.id === deal.propertyId)?.image;
                    const propertyPrice = deal.listing_price || deal.final_price || properties.find(p => p.id === deal.propertyId)?.price;
                    const clientName = deal.client_name || customers.find(c => c.id === deal.customerId)?.name;
                    const dealStatus = deal.status || deal.stage;
                    const stage = getStageBadgeStyle(dealStatus);

                    return (
                      <TouchableOpacity
                        key={deal.id}
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
                  // Handle both API format (due_date, client_name) and mock format (date, customerId)
                  const taskDate = task.due_date || task.date;
                  const clientName = task.client_name || customers.find(c => c.id === task.customerId)?.name;
                  const taskNote = task.title || task.note;
                  const date = new Date(taskDate);

                  return (
                    <View key={task.id} style={styles.taskCard}>
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
