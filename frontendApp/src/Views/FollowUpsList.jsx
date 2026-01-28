import {
    Calendar,
    CheckCircle,
    Home,
    Map,
    Phone
} from 'lucide-react-native';
import { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import WhatsAppIcon from '../Components/WhatsAppIcon';


// Helper for generating IDs if needed
const generateId = () => Math.random().toString(36).substr(2, 9);

const FollowUpsList = ({ followUps = [], customers = [], properties = [], onUpdateStatus, onDelete, onStartVisit }) => {
  const [filter, setFilter] = useState('Pending');
  
  // Logic to filter and sort tasks
  const filteredTasks = followUps
    .filter(t => t.status === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Action Handlers
  const handleCall = (phone) => {
    if(phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone) => {
    if(phone) Linking.openURL(`https://wa.me/${phone}`);
  };

  return (
    <View style={styles.container}>
      
      {/* --- STICKY HEADER --- */}
      <View style={styles.headerContainer}>
         <View>
            <Text style={styles.headerTitle}>Daily Planner</Text>
            <Text style={styles.headerSubtitle}>Manage your tasks</Text>
         </View>
         
         {/* Improved Toggle Buttons */}
         <View style={styles.filterContainer}>
            {['Pending', 'Done'].map(f => (
               <TouchableOpacity 
                  key={f} 
                  onPress={() => setFilter(f)} 
                  style={[
                    styles.filterTab, 
                    filter === f && styles.filterTabActive
                  ]}
                  activeOpacity={0.8}
               >
                  <Text style={[
                    styles.filterText, 
                    filter === f ? styles.filterTextActive : styles.filterTextInactive
                  ]}>
                     {f}
                  </Text>
               </TouchableOpacity>
            ))}
         </View>
      </View>
      
      {/* --- SCROLLABLE TIMELINE --- */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
         <View style={styles.timelineContainer}>
            
            {/* Vertical Line */}
            <View style={styles.timelineLine} />

            <View style={styles.taskList}>
               {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                  const customer = customers.find(c => c.id === task.customerId);
                  const property = properties.find(p => p.id === task.propertyId);
                  const date = new Date(task.date);
                  
                  // Determine type (Visit vs Call) for styling
                  const isVisit = task.type === 'Visit' || task.type === 'Meeting';
                  const primaryColor = isVisit ? '#f59e0b' : '#3b82f6'; // Amber vs Blue
                  const lightBg = isVisit ? '#fffbeb' : '#eff6ff'; // Light Amber vs Light Blue

                  return (
                     <View key={task.id} style={styles.taskRow}>
                        
                        {/* Left Column: Time & Dot */}
                        <View style={styles.timeColumn}>
                           <Text style={styles.timeText}>
                              {date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           </Text>
                           <View style={[styles.timelineDot, { borderColor: primaryColor }]} />
                        </View>

                        {/* Right Column: Task Card */}
                        <View style={[
                           styles.card, 
                           { borderLeftColor: primaryColor } 
                        ]}>
                           
                           {/* Card Header */}
                           <View style={styles.cardHeader}>
                              <View style={{ flex: 1, marginRight: 8 }}>
                                 {/* Type Badge */}
                                 <View style={[styles.badge, { backgroundColor: lightBg }]}>
                                    <Text style={[styles.badgeText, { color: isVisit ? '#b45309' : '#1d4ed8' }]}>
                                       {isVisit ? 'Site Visit' : 'Call / Follow-up'}
                                    </Text>
                                 </View>
                                 
                                 {/* Customer Name */}
                                 <Text style={styles.customerName}>{customer?.name || 'Unknown Customer'}</Text>
                                 
                                 {/* Property Link */}
                                 {property && (
                                    <View style={styles.propertyRow}>
                                       <Home size={12} color="#6b7280" />
                                       <Text style={styles.propertyText} numberOfLines={1}>
                                          {property.title}
                                       </Text>
                                    </View>
                                 )}
                              </View>
                              
                              {/* Done Button */}
                              {filter !== 'Done' && (
                                 <TouchableOpacity 
                                    onPress={() => onUpdateStatus && onUpdateStatus(task.id, 'Done')} 
                                    style={styles.checkButton}
                                 >
                                    <CheckCircle size={24} color="#9ca3af" />
                                 </TouchableOpacity>
                              )}
                           </View>
                           
                           {/* Note */}
                           <Text style={styles.noteText}>{task.note}</Text>
                           
                           {/* Action Buttons */}
                           <View style={styles.actionContainer}>
                              {isVisit && filter === 'Pending' && property ? (
                                 <TouchableOpacity 
                                    onPress={() => onStartVisit && onStartVisit({ id: generateId(), customer, property, taskId: task.id })}
                                    style={styles.startVisitButton}
                                 >
                                    <Map size={16} color="#fbbf24" />
                                    <Text style={styles.startVisitText}>Start Site Visit Flow</Text>
                                 </TouchableOpacity>
                              ) : (
                                 <View style={styles.contactButtonsRow}>
                                    <TouchableOpacity 
                                       onPress={() => handleCall(customer?.phone)} 
                                       style={[styles.contactButton, { backgroundColor: '#f0fdf4' }]}
                                    >
                                       <Phone size={16} color="#15803d" />
                                       <Text style={[styles.contactButtonText, { color: '#15803d' }]}>Call</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                       onPress={() => handleWhatsApp(customer?.phone)}
                                       style={[styles.contactButton, { backgroundColor: '#f9fafb' }]}
                                    >
                                       <WhatsAppIcon size={16} color="#25D366" />
                                       <Text style={[styles.contactButtonText, { color: '#4b5563' }]}>WhatsApp</Text>
                                    </TouchableOpacity>
                                 </View>
                              )}
                           </View>

                        </View>
                     </View>
                  );
               }) : (
                  <View style={styles.emptyState}>
                     <Calendar size={48} color="#e5e7eb" />
                     <Text style={styles.emptyText}>No {filter.toLowerCase()} tasks.</Text>
                     <Text style={styles.emptySubtext}>Enjoy your free time!</Text>
                  </View>
               )}
            </View>
         </View>
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
  headerContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  
  // --- IMPROVED TOGGLE BUTTONS ---
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    height: 34,
    borderRadius: 10, // More rounded container
    alignItems: 'center',
    gap:4,
    
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 12, // Slightly taller
    borderRadius: 6,   // Matches container curve
    minWidth: 80,   
    height: 24,    // Consistent width
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700', // Bolder text
  },
  filterTextActive: {
    color: '#111827',
  },
  filterTextInactive: {
    color: '#9ca3af',
  },
  
  // --- CONTENT ---
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
  timelineContainer: {
    padding: 20,
    position: 'relative',
    minHeight: '100%',
  },
  timelineLine: {
    position: 'absolute',
    top: 20,
    left: 68, // Aligned with the center of the time column
    bottom: 0,
    width: 2,
    backgroundColor: '#e5e7eb',
    zIndex: 0,
  },
  taskList: {
    gap: 24,
    zIndex: 10,
  },
  taskRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    backgroundColor: 'white',
    marginTop: 8,
    zIndex: 20,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 6, // Colored accent bar
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  propertyText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  checkButton: {
    padding: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 999,
  },
  noteText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    paddingTop: 12,
  },
  startVisitButton: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  startVisitText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    opacity: 0.5,
  },
  emptyText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 16,
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 4,
  }
});

export default FollowUpsList;