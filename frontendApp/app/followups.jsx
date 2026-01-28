import {
    CheckCircle,
    Clock,
    Edit3,
    Home,
    Map,
    Phone,
    Trash2
} from 'lucide-react-native';
import { useState } from 'react';
import {
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Components
import AddModal from '@/src/Modal and Sheets/AddModal';
import { clearEditItem, setEditItem, setModalOpen, setModalType } from '@/src/store/slices/uiSlice';
import FAB from '../src/Components/FAB.jsx';
import {
    addFollowUp,
    deleteFollowUp,
    setActiveSiteVisit,
    updateFollowUp,
    updateFollowUpStatus
} from '../src/store/slices/followUpsSlice';
import WhatsAppIcon from '@/src/Components/WhatsAppIcon.jsx';

// Helper for generating IDs if needed
const generateId = () => Math.random().toString(36).substring(2, 11);

export default function FollowUps() {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('Pending');
  
  // Redux state
  const { followUps, activeSiteVisit } = useSelector(state => state.followUps);
  const { customers } = useSelector(state => state.customers);
  const { properties } = useSelector(state => state.properties);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);
  
  console.log('🔍 FollowUps - Modal state:', { modalOpen, modalType, editItem });
  
  // Logic to filter and sort tasks
  const filteredTasks = (followUps || [])
    .filter(t => t.status === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Action Handlers
  const handleCall = (phone) => {
    if(phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone) => {
    if(phone) Linking.openURL(`https://wa.me/${phone}`);
  };

  const handleUpdateStatus = (taskId, status) => {
    dispatch(updateFollowUpStatus({ id: taskId, status }));
  };

  const handleStartVisit = (visitData) => {
    console.log('Starting site visit:', visitData);
    dispatch(setActiveSiteVisit(visitData));
  };

  const handleEditTask = (task) => {
    dispatch(setEditItem(task));
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
  };

  const handleDeleteTask = (taskId) => {
    dispatch(deleteFollowUp(taskId));
  };

  const handleFABClick = () => {
    console.log('🔥 FAB clicked in followups page');
    console.log('🔥 Current modal state:', modalOpen, modalType);
    dispatch(clearEditItem());
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
    console.log('🔥 Dispatched modal open actions');
  };

  const handleAdd = (data) => {
    const newTask = { ...data, id: generateId() };
    dispatch(addFollowUp(newTask));
    dispatch(setModalOpen(false));
  };

  const handleUpdate = (updatedItem) => {
    dispatch(updateFollowUp(updatedItem));
    dispatch(clearEditItem());
    dispatch(setModalOpen(false));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* --- HEADER (Compact) --- */}
      <View style={styles.headerContainer}>
         <View>
            <Text style={styles.headerTitle}>Daily Planner</Text>
            <Text style={styles.headerSubtitle}>{filteredTasks.length} tasks {filter.toLowerCase()}</Text>
         </View>
         
         {/* Filter Toggle */}
         <View style={styles.toggleContainer}>
            {['Pending', 'Done'].map(f => (
               <TouchableOpacity 
                  key={f} 
                  onPress={() => setFilter(f)} 
                  style={[
                    styles.toggleButton, 
                    filter === f && styles.toggleButtonActive
                  ]}
                  activeOpacity={0.8}
               >
                  <Text style={[
                    styles.toggleText, 
                    filter === f ? styles.toggleTextActive : styles.toggleTextInactive
                  ]}>
                     {f}
                  </Text>
               </TouchableOpacity>
            ))}
         </View>
      </View>
      
      {/* --- TIMELINE LIST --- */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
         <View style={styles.timelineContainer}>
            
            {/* Thin Vertical Line */}
            <View style={styles.timelineLine} />

            <View style={styles.taskList}>
               {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                  const customer = customers.find(c => c.id === task.customerId);
                  const property = properties.find(p => p.id === task.propertyId);
                  const date = new Date(task.date);
                  
                  const isVisit = task.type === 'Visit' || task.type === 'Meeting';
                  const primaryColor = isVisit ? '#f59e0b' : '#3b82f6'; // Amber / Blue
                  const lightBg = isVisit ? '#fffbeb' : '#eff6ff'; 

                  return (
                     <View key={task.id} style={styles.taskRow}>
                        
                        {/* Time Column (Tighter) */}
                        <View style={styles.timeColumn}>
                           <Text style={styles.timeText}>
                              {date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           </Text>
                           <View style={[styles.timelineDot, { borderColor: primaryColor }]} />
                        </View>

                        {/* Task Card (Compact) */}
                        <View style={[styles.card, { borderLeftColor: primaryColor }]}>
                           
                           {/* Header: Type & Edit */}
                           <View style={styles.cardHeader}>
                              <View style={[styles.badge, { backgroundColor: lightBg }]}>
                                 <Text style={[styles.badgeText, { color: isVisit ? '#b45309' : '#1d4ed8' }]}>
                                    {task.type}
                                 </Text>
                              </View>
                              
                              <View style={{flexDirection: 'row', gap: 8}}>
                                <TouchableOpacity onPress={() => handleEditTask(task)}>
                                    <Edit3 size={14} color="#9ca3af" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                                    <Trash2 size={14} color="#ef4444" />
                                </TouchableOpacity>
                                {filter !== 'Done' && (
                                    <TouchableOpacity onPress={() => handleUpdateStatus(task.id, 'Done')}>
                                        <CheckCircle size={16} color="#10b981" />
                                    </TouchableOpacity>
                                )}
                              </View>
                           </View>
                           
                           {/* Main Info */}
                           <Text style={styles.customerName} numberOfLines={1}>{customer?.name || 'Unknown'}</Text>
                           
                           {property && (
                              <View style={styles.propertyRow}>
                                 <Home size={10} color="#6b7280" />
                                 <Text style={styles.propertyText} numberOfLines={1}>{property.title}</Text>
                              </View>
                           )}
                           
                           {/* Note */}
                           {task.note ? (
                             <Text style={styles.noteText} numberOfLines={2}>{task.note}</Text>
                           ) : null}
                           
                           {/* Footer Actions */}
                           <View style={styles.actionContainer}>
                              {task.type === 'Visit' && filter === 'Pending' && property ? (
                                 <TouchableOpacity 
                                    onPress={() => handleStartVisit({ id: generateId(), customer, property, taskId: task.id })}
                                    style={styles.startVisitButton}
                                 >
                                    <Map size={12} color="#fbbf24" />
                                    <Text style={styles.startVisitText}>Start Visit</Text>
                                 </TouchableOpacity>
                              ) : filter === 'Pending' ? (
                                 <View style={styles.contactButtonsRow}>
                                    <TouchableOpacity 
                                       onPress={() => handleCall(customer?.phone)} 
                                       style={styles.miniBtn}
                                    >
                                       <Phone size={12} color="#15803d" />
                                       <Text style={[styles.miniBtnText, { color: '#15803d' }]}>Call</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                       onPress={() => handleWhatsApp(customer?.phone)}
                                       style={styles.miniBtn}
                                    >
                                       <WhatsAppIcon size={12} color="#25D366" />
                                       <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Msg</Text>
                                    </TouchableOpacity>
                                 </View>
                              ) : null}
                           </View>

                        </View>
                     </View>
                  );
               }) : (
                  <View style={styles.emptyState}>
                     <Clock size={40} color="#e5e7eb" />
                     <Text style={styles.emptyText}>No {filter.toLowerCase()} tasks</Text>
                  </View>
               )}
            </View>
         </View>
      </ScrollView>

      {/* FAB for adding new task */}
      <FAB onPress={handleFABClick} />

      {/* Add Modal */}
      <AddModal 
        isOpen={modalOpen} 
        type={modalType} 
        onClose={() => dispatch(setModalOpen(false))} 
        onSave={handleAdd} 
        onUpdate={handleUpdate} 
        editItem={editItem} 
        properties={properties} 
        customers={customers} 
      />
    </View>
  );
}

// --- COMPACT STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  // Header
  headerContainer: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20, // Smaller
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 3,
    borderRadius: 8,
  },
  toggleButton: {
    paddingHorizontal: 12, // Compact
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  toggleText: {
    fontSize: 11, // Smaller text
    fontWeight: '700',
  },
  toggleTextActive: { color: '#111827' },
  toggleTextInactive: { color: '#9ca3af' },

  // Timeline
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  timelineContainer: {
    padding: 16, // Reduced padding
    position: 'relative',
    minHeight: '100%',
  },
  timelineLine: {
    position: 'absolute',
    top: 16,
    left: 60, // Adjusted line position
    bottom: 0,
    width: 1.5, // Thinner line
    backgroundColor: '#e5e7eb',
    zIndex: 0,
  },
  taskList: {
    gap: 16, // Reduced gap between cards
    zIndex: 10,
  },
  taskRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Time Column
  timeColumn: {
    width: 50, // Narrower column
    alignItems: 'center',
    paddingTop: 2,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  timelineDot: {
    width: 10, // Smaller dot
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: 'white',
    marginTop: 6,
    zIndex: 20,
  },

  // Card Design (Clean & Compact)
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12, // Less rounded
    padding: 12, // Compact padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 3, // Thinner accent border
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderLeftColor: 'transparent', // Overridden inline
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9, // Tiny font
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  propertyText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  noteText: {
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 16,
    marginBottom: 8,
  },
  
  // Actions
  actionContainer: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  miniBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  startVisitButton: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  startVisitText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    opacity: 0.5,
  },
  emptyText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 12,
  },
});