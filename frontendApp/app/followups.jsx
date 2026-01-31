import {
    CheckCircle,
    Clock,
    Edit3,
    Home,
    Map,
    MapPin,
    Phone,
    Plus,
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
import WhatsAppIcon from '@/src/Components/WhatsAppIcon';
import AddModal from '@/src/Modal and Sheets/AddModal';
import { clearEditItem, setEditItem, setModalOpen, setModalType } from '@/src/store/slices/uiSlice';
import {
    addFollowUp,
    deleteFollowUp,
    setActiveSiteVisit,
    updateFollowUp,
    updateFollowUpStatus
} from '../src/store/slices/followUpsSlice';

// Helper for generating IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

export default function FollowUps() {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('Pending'); // Default is Pending
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Redux state
  const { followUps, activeSiteVisit } = useSelector(state => state.followUps);
  const { customers } = useSelector(state => state.customers);
  const { properties } = useSelector(state => state.properties);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);
  
  console.log('🔍 FollowUps - Modal state:', { modalOpen, modalType, editItem });
  
  // --- DATE LOGIC ---
  const getExtendedDates = () => {
    const today = new Date();
    const dates = [];
    
    // Add 2 days before today
    for (let i = 2; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    // Add today
    dates.push(new Date(today));
    
    // Add 10 days after today
    for (let i = 1; i <= 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const extendedDates = getExtendedDates();
  
  // --- FILTER & SORT LOGIC ---
  const filteredTasks = (followUps || [])
    .filter(t => {
      const taskDate = new Date(t.date);
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      
      // Match Status AND Date
      return t.status === filter && taskDateOnly.getTime() === selectedDateOnly.getTime();
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // --- HANDLERS ---
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

  const handleEditTask = (task) => {
    dispatch(setEditItem(task));
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
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
      
      {/* --- HEADER: Date & Toggle --- */}
      <View style={styles.headerContainer}>
         <View style={styles.dateBlock}>
            <Text style={styles.bigDateNumber}>{selectedDate.getDate()}</Text>
            <View style={styles.dateTexts}>
               <Text style={styles.dayName}>
                 {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}
               </Text>
               <Text style={styles.monthYear}>
                 {selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
               </Text>
            </View>
         </View>
         
         {/* Toggle Switch: Pending (Red) -> Done (Green) */}
         <View style={styles.toggleWrapper}>
            {/* Pending Button */}
            <TouchableOpacity 
               onPress={() => setFilter('Pending')}
               style={[
                 styles.toggleBtn, 
                 filter === 'Pending' ? styles.pendingActive : styles.inactiveBtn
               ]}
            >
               <Text style={[styles.toggleText, filter === 'Pending' ? styles.activeText : styles.inactiveText]}>
                 Pending
               </Text>
            </TouchableOpacity>

            {/* Done Button */}
            <TouchableOpacity 
               onPress={() => setFilter('Done')}
               style={[
                 styles.toggleBtn, 
                 filter === 'Done' ? styles.doneActive : styles.inactiveBtn
               ]}
            >
               <Text style={[styles.toggleText, filter === 'Done' ? styles.activeText : styles.inactiveText]}>
                 Done
               </Text>
            </TouchableOpacity>
         </View>
      </View>

      {/* --- CALENDAR STRIP SCROLLABLE --- */}
      <View style={styles.calendarContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarScrollContent}
          style={styles.calendarScrollView}
        >
          {extendedDates.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dayInitial = date.toLocaleDateString('en-US', { weekday: 'narrow' }); // S, M, T...
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.dayItem,
                  isSelected && styles.dayItemSelected
                ]}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {dayInitial}
                </Text>
                <Text style={[styles.dateLabel, isSelected && styles.dateLabelSelected]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* --- TASKS TIMELINE --- */}
      <View style={styles.timelineWrapper}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
         <View style={styles.timelineHeader}>
            <Text style={styles.colHeaderTime}>Time</Text>
            <Text style={styles.colHeaderTask}>Tasks</Text>
         </View>

         {/* Continuous Vertical Line */}
         <View style={styles.timelineContainer}>
            <View style={styles.continuousVerticalLine} />
            
            {filteredTasks.length > 0 ? filteredTasks.map((task, index) => {
               const customer = customers.find(c => c.id === task.customerId);
               const property = properties.find(p => p.id === task.propertyId);
               const date = new Date(task.date);
               
               // Logic: Only first card in Pending is purple, all others (including all Done cards) are grey/white
               const isFirst = index === 0;
               const isPendingFirst = filter === 'Pending' && isFirst;
               const cardStyle = isPendingFirst ? styles.cardPurple : styles.cardWhite;
               const textPrimary = isPendingFirst ? '#FFF' : '#1f2937';
               const textSecondary = isPendingFirst ? 'rgba(255,255,255,0.7)' : '#6b7280';
               const iconColor = isPendingFirst ? 'rgba(255,255,255,0.8)' : '#9ca3af';

               return (
                  <View key={task.id} style={styles.timelineRow}>
                     {/* Time Column */}
                     <View style={styles.timeCol}>
                        <Text style={styles.startTime}>
                           {date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}
                        </Text>
                     </View>

                     {/* Task Card */}
                     <TouchableOpacity 
                       onPress={() => handleEditTask(task)}
                       activeOpacity={0.9}
                       style={[styles.card, cardStyle]}
                     >
                     {/* Card Header: Title & Action Buttons */}
                     <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={1}>
                           {task.type}
                        </Text>
                        <View style={styles.headerActions}>
                           <TouchableOpacity onPress={() => handleEditTask(task)}>
                              <Edit3 size={14} color={textPrimary} />
                           </TouchableOpacity>
                           <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                              <Trash2 size={14} color={filter === 'Done' ? 'rgba(255,255,255,0.8)' : '#ef4444'} />
                           </TouchableOpacity>
                           {filter !== 'Done' && (
                              <TouchableOpacity onPress={() => handleUpdateStatus(task.id, 'Done')}>
                                 <CheckCircle size={16} color={filter === 'Done' ? 'rgba(255,255,255,0.8)' : '#10b981'} />
                              </TouchableOpacity>
                           )}
                        </View>
                     </View>

                     {/* Customer Name */}
                     <Text style={[styles.customerName, { color: textPrimary }]} numberOfLines={1}>
                        {customer?.name || 'Unknown Customer'}
                     </Text>

                     {/* Property Info */}
                     {property && (
                        <View style={styles.infoRow}>
                           <Home size={12} color={iconColor} />
                           <Text style={[styles.infoText, { color: textSecondary }]} numberOfLines={1}>
                              {property.title}
                           </Text>
                        </View>
                     )}

                     {/* Location */}
                     <View style={styles.infoRow}>
                        <MapPin size={12} color={iconColor} />
                        <Text style={[styles.infoText, { color: textSecondary }]} numberOfLines={1}>
                           {property ? property.location : 'No location set'}
                        </Text>
                     </View>

                     {/* Note */}
                     {task.note && (
                        <Text style={[styles.noteText, { color: textSecondary }]} numberOfLines={2}>
                           {task.note}
                        </Text>
                     )}

                     {/* Action Buttons */}
                     <View style={[
                        styles.actionContainer,
                        filter === 'Done' && styles.actionContainerNoBorder
                     ]}>
                        {(task.type === 'Site Visit' || task.type === 'Visit') && filter === 'Pending' && property ? (
                           <TouchableOpacity 
                              onPress={() => handleStartVisit({ 
                                 id: generateId(), 
                                 customer, 
                                 property, 
                                 taskId: task.id 
                              })}
                              style={styles.startVisitButton}
                           >
                              <Map size={12} color="#fbbf24" />
                              <Text style={styles.startVisitText}>Start Visit</Text>
                           </TouchableOpacity>
                        ) : filter === 'Pending' && !isPendingFirst ? (
                           <View style={styles.contactButtonsRow}>
                              <TouchableOpacity onPress={() => handleCall(customer?.phone)} style={styles.miniBtn}>
                                 <Phone size={12} color="#15803d" />
                                 <Text style={[styles.miniBtnText, { color: '#15803d' }]}>Call</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleWhatsApp(customer?.phone)} style={styles.miniBtn}>
                                 <WhatsAppIcon size={12} color="#25D366" />
                                 <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Msg</Text>
                              </TouchableOpacity>
                           </View>
                        ) : null}
                     </View>
                  </TouchableOpacity>
               </View>
            );
         }) : (
            <View style={styles.emptyContainer}>
               <Clock size={40} color="#e5e7eb" />
               <Text style={styles.emptyText}>No {filter.toLowerCase()} tasks</Text>
            </View>
         )}
         </View>
        </ScrollView>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleFABClick}>
        <Plus color="#FFF" size={24} />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // --- HEADER STYLES ---
  headerContainer: {
    paddingTop: 60, // Safe area
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
    
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bigDateNumber: {
    fontSize: 42,
    fontWeight: '300',
    color: '#1f2937',
    fontFamily: 'Montserrat-700Bold',
  },
  dateTexts: {
    justifyContent: 'center',
  },
  dayName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  monthYear: {
    fontSize: 15,
    fontWeight: '400',
    color: '#9ca3af',
  },
  
  // --- TOGGLE STYLES ---
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 2,
    height: 46,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8,
    width: 80,
    alignItems: 'center',
  },
  inactiveBtn: {
    backgroundColor: 'transparent',
  },
  pendingActive: {
    backgroundColor: '#ef4444', // Red for Pending
    elevation: 2,
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  doneActive: {
    backgroundColor: '#22c55e', // Green for Done
    elevation: 2,
    shadowColor: '#22c55e',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#ffffff',
  },
  inactiveText: {
    color: '#9ca3af',
  },

  // --- CALENDAR STRIP ---
  calendarContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  calendarScrollView: {
    paddingHorizontal: 16,
  },
  calendarScrollContent: {
    paddingRight: 16, // Extra padding at the end
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 55,
    height: 65,
    borderRadius: 18,
    marginRight: 12, // Space between items
  },
  dayItemSelected: {
    backgroundColor: '#000000', // Black selected background like image "W 24",
    color: '#ffffff',
  },
  dayLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#ffffff', // Slightly lighter grey inside black box? Or white? Image looks greyish
  },
  dateLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '700',
  },
  dateLabelSelected: {
    color: '#ffffff',
  },

  // --- TIMELINE WRAPPER ---
  timelineWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // --- TIMELINE ---
  scrollView: {
    flex: 1,
    marginTop: 10,
    
  },
  scrollContent: {
    paddingBottom: 100,
  },
  timelineHeader: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  colHeaderTime: {
    width: 60,
    fontSize: 13,
    color: '#d1d5db',
    fontWeight: '500',
  },
  colHeaderTask: {
    fontSize: 13,
    color: '#d1d5db',
    fontWeight: '500',
  },
  timelineContainer: {
    position: 'relative',
    paddingHorizontal: 24,
  },
  continuousVerticalLine: {
    position: 'absolute',
    left: 80, // Position after time column (24px padding + 44px time width + 12px margin)
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#f3f4f6', // Lighter color
    zIndex: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
    zIndex: 2,
  },
  timeCol: {
    width: 44, // Fixed width for alignment
    paddingTop: 4,
    marginRight: 24, // Space before the card
  },
  startTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  
  // --- CARDS ---
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    justifyContent: 'center',
    
  },
  cardPurple: {
    backgroundColor: '#bca4ff', // Similar to the "Mathematics" card
  },
  cardWhite: {
    backgroundColor: '#f9fafb', // Similar to "Biology" card
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  customerName: {
    fontFamily: 'Montserrat-600SemiBold',
    fontSize: 14,
    color: '#000000',
    fontWeight: '700',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-700Bold',
    fontWeight: '700',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  infoText: {
    fontFamily: 'Lato-400Regular',
    fontSize: 11,
    fontWeight: '100',
    flex: 1,
  },
  noteText: {
    fontFamily: 'Lato-400Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 8,
    
  },
  actionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionContainerNoBorder: {
    borderTopWidth: 0,
    paddingTop: 0,
    marginTop: 0,
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
    backgroundColor: '#00000000',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  miniBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  startVisitButton: {
    backgroundColor: '#000000',
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
  },  // --- EMPTY STATE ---
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 10,
    color: '#9ca3af',
  },

  // --- FAB ---
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});