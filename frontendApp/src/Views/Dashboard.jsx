import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowRight,
    Bell,
    Briefcase,
    Clock,
    Handshake,
    Plus,
    UserPlus
} from 'lucide-react-native';
import {
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const Dashboard = ({
  properties = [],
  customers = [],
  followUps = [],
  activeDeals = [],
  unreadCount = 0,
  onOpenCollab,
  onOpenDeal,
  onNavigate,
  onOpenModal,
}) => {

  const stats = {
    active: properties.filter(p => p.status === 'Available').length,
    leads: customers.length,
    tasks: followUps.filter(f => f.status === 'Pending').length,
    hotLeads: activeDeals.length,
  };

  const NavItem = ({ icon: Icon, label, onPress }) => (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.navItem}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        onPress={onPress}
        style={styles.navIconContainer}
        activeOpacity={0.8}
      >
        <Icon size={24} color="#374151" strokeWidth={2} />
      </TouchableOpacity>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // --- STAT BLOCK (From your code) ---
  const StatBlock = ({ label, count, onPress }) => (
    <TouchableOpacity style={styles.statInnerBox} onPress={onPress}>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        
        {/* ===== GRADIENT HEADER ===== */}
        <LinearGradient
          colors={['#BFB7FD', '#E5E1FF', '#f9fafb']} 
          locations={[0, 0.7, 1]}
          style={styles.gradientHeader}
        >
          {/* Profile Row */}
          <View style={styles.profileRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150' }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.greetingText}>Welcome back,</Text>
                <Text style={styles.userName}>Roberts Adams</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => onNavigate && onNavigate('/notifications')}
              style={styles.bellButton}
            >
              <Bell size={20} color="#111827" />
              {unreadCount > 0 && <View style={styles.dot} />}
            </TouchableOpacity>
          </View>

          {/* --- STATS BOX (From your code) --- */}
          <View style={styles.statsOuterBox}>
            <StatBlock 
              label="Properties" 
              count={stats.active} 
              onPress={() => onNavigate && onNavigate('/properties')} 
            />
            <StatBlock 
              label="Clients" 
              count={stats.leads} 
              onPress={() => onNavigate && onNavigate('/customers')} 
            />
            <StatBlock 
              label="Tasks" 
              count={stats.tasks} 
              onPress={() => onNavigate && onNavigate('/followups')} 
            />
            <StatBlock 
              label="Deals" 
              count={stats.hotLeads} 
              onPress={() => onNavigate && onNavigate('/deals')} 
            />
          </View>

        </LinearGradient>

        {/* ===== MAIN CONTENT ===== */}
        <View style={styles.mainBody}>

          {/* --- QUICK ACTIONS --- */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.navRow}>
              <NavItem
                icon={UserPlus}
                label="New Lead"
                onPress={() => onOpenModal && onOpenModal('Customer')}
              />
              <NavItem
                icon={Plus}
                label="Add Prop"
                onPress={() => {
                  console.log('Add Prop clicked - opening Property modal');
                  onOpenModal && onOpenModal('Property');
                }}
              />
              <NavItem
                icon={Briefcase}
                label="Deals"
                onPress={() => onNavigate && onNavigate('/deals')}
              />
              <NavItem
                icon={Handshake}
                label="Collab"
                onPress={onOpenCollab}
              />
            </View>
          </View>

          {/* --- ACTIVE DEALS (High Detail Version) --- */}
          {activeDeals.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Briefcase size={20} color="#4f46e5" />
                  <Text style={styles.sectionHeaderTitle}>Active Deals</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{activeDeals.length}</Text>
                </View>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ gap: 16, paddingRight: 20 }}
              >
                {activeDeals.map(deal => {
                  const property = properties.find(p => p.id === deal.propertyId);
                  const customer = customers.find(c => c.id === deal.customerId);
                  return (
                    <TouchableOpacity
                      key={deal.id}
                      onPress={() => onOpenDeal(deal)}
                      activeOpacity={0.9}
                      style={styles.dealCard}
                    >
                      <View style={styles.dealCardTop}>
                        <View style={styles.dealInfoRow}>
                          <Image 
                            source={{ uri: property?.image || 'https://via.placeholder.com/100' }} 
                            style={styles.dealImage}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dealTitle} numberOfLines={1}>
                              {property?.title || 'Unknown Property'}
                            </Text>
                            <Text style={styles.dealSubtitle} numberOfLines={1}>
                              {customer?.name || 'Unknown Client'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.stageBadge}>
                          <Text style={styles.stageText}>{deal.stage}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.dealCardBottom}>
                        <Text style={styles.nextStepText}>Next: Meeting</Text>
                        <Text style={styles.dealPriceText}>{formatCurrency(property?.price)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* --- TODAY'S FOCUS (High Detail Version) --- */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Today's Focus</Text>
              <TouchableOpacity onPress={() => onNavigate && onNavigate('/followups')} style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <ArrowRight size={14} color="#2563eb" />
              </TouchableOpacity>
            </View>
            
            {followUps.filter(f => f.status === 'Pending').slice(0, 3).map((task) => {
              const customer = customers.find(c => c.id === task.customerId);
              const taskDate = new Date(task.date);
              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateMonth}>
                      {taskDate.toLocaleString('default', { month: 'short' })}
                    </Text>
                    <Text style={styles.dateDay}>
                      {taskDate.getDate()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskTitle}>{customer?.name || 'Client Task'}</Text>
                    <Text style={styles.taskNote} numberOfLines={1}>{task.note}</Text>
                    <View style={styles.timeBadge}>
                      <Clock size={10} color="#9ca3af" style={{marginRight: 4}} />
                      <Text style={styles.timeText}>
                        {taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  
                </View>
              );
            })}
            
            {followUps.filter(f => f.status === 'Pending').length === 0 && (
               <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No tasks due today. All caught up!</Text>
               </View>
            )}
          </View>

        </View> 
        {/* End of Main Body */}

      </ScrollView>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Gradient Header Styles
  gradientHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'white',
  },
  greetingText: {
    fontSize: 12,
    color: '#4b5563', 
    fontWeight: '600',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  bellButton: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 10,
    borderRadius: 14,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 8,
    width: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'white',
  },

  // --- STATS STYLES (From Your Code) ---
  statsOuterBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    // Added shadow for better visibility on gradient
    
  },
  statInnerBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 4,
  },

  // Main Content
  mainBody: {
    paddingHorizontal: 20,
  },

  // Section Common
  sectionContainer: {
    marginTop: 8, 
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  
  // Navigation Grid (Quick Actions)
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  navIconContainer: {
    height: 56,
    width: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    
    // Standard Border (Detailed Look)
    borderWidth: 1,
    borderColor: '#e5e7eb',
    
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },

  // Active Deals (Detailed Look)
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1f2937',
  },
  countBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countBadgeText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealCard: {
    width: 280,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    
    // Detailed Border
    borderWidth: 1,
    borderColor: '#e5e7eb',
    
  },
  dealCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dealInfoRow: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  dealImage: {
    height: 40,
    width: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  dealTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  dealSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  stageBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stageText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  dealCardBottom: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  dealPriceText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },

  // Task List (Detailed Look)
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    
    // Detailed Border
    borderWidth: 1,
    borderColor: '#e5e7eb',
    
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    
  },
  dateBox: {
    backgroundColor: '#eff6ff',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3b82f6',
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e3a8a',
    lineHeight: 20,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  taskNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  timeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center', 
    paddingVertical: 20, 
    opacity: 0.6
  },
  emptyStateText: {
    fontSize: 13, 
    color: '#6b7280'
  }
});

export default Dashboard;