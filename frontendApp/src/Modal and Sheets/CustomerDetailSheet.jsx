import {
    Calendar,
    ChevronRight,
    Edit3,
    Handshake,
    MapPin,
    MessageCircle,
    Phone,
    Plus,
    Sparkles,
    Trash2,
    X
} from 'lucide-react-native';
import { useState } from 'react';
import {
    Image,
    Linking,
    Modal,
    ScrollView,
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

const CustomerDetailSheet = ({ customer, onClose, properties = [], activeDeals = [], followUps = [], onAddFollowUp, onStartDeal, onOpenDeal, onEditTask, onDeleteTask }) => {
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);

  if (!customer) return null;

  // Filter Logic
  const customerDeals = activeDeals.filter(d => d.customerId === customer.id);
  const dealtPropertyIds = customerDeals.map(d => d.propertyId);
  const customerTasks = followUps.filter(f => f.customerId === customer.id);
  
  console.log('CustomerDetailSheet - customer:', customer.id, 'followUps:', followUps.length, 'customerTasks:', customerTasks.length);
  console.log('🔍 Customer tasks:', customerTasks);

  const matches = properties.filter(p => {
    if (p.type !== customer.type) return false;
    if (p.status === 'Sold') return false;
    if (dealtPropertyIds.includes(p.id)) return false;
    return true;
  });

  const handleCall = () => {
    Linking.openURL(`tel:${customer.phone}`);
  };

  const handleWhatsApp = () => {
    const message = `Hi ${customer.name}, I have some properties that match your requirements.`;
    Linking.openURL(`https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`);
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        
        {/* Main Sheet Container */}
        <View style={styles.sheetContainer}>
          
          {/* Header (Spacious) */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
               <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{customer.name.charAt(0)}</Text>
               </View>
               <View>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerPhone}>{customer.phone}</Text>
               </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
               <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {/* Main Scroll Content */}
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={{ paddingBottom: 100 }} 
            showsVerticalScrollIndicator={false}
          >
            
            {/* Quick Stats Row (Spacious) */}
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>BUDGET</Text>
                    <Text style={styles.infoValue}>{formatCurrency(customer.budget)}</Text>
                </View>
                <View style={styles.verticalLine} />
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>TYPE</Text>
                    <Text style={styles.infoValue}>{customer.type}</Text>
                </View>
                <View style={styles.verticalLine} />
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>STATUS</Text>
                    <Text style={[styles.infoValue, {color: '#d97706'}]}>{customer.status || 'New'}</Text>
                </View>
            </View>

            {/* Action Buttons Grid (Bigger Touch Targets) */}
            <View style={styles.actionGrid}>
               <TouchableOpacity onPress={handleCall} style={styles.actionBtn}>
                  <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                     <Phone size={22} color="#059669" />
                  </View>
                  <Text style={styles.actionText}>Call</Text>
               </TouchableOpacity>
               
               <TouchableOpacity onPress={handleWhatsApp} style={styles.actionBtn}>
                  <View style={[styles.iconBox, { backgroundColor: '#ecfccb' }]}>
                     <MessageCircle size={22} color="#65a30d" />
                  </View>
                  <Text style={styles.actionText}>WhatsApp</Text>
               </TouchableOpacity>

               <TouchableOpacity onPress={() => {
                  // If there are existing tasks, edit the first pending task
                  // Otherwise, add a new task
                  const pendingTasks = customerTasks.filter(task => task.status === 'Pending');
                  if (pendingTasks.length > 0) {
                     onEditTask && onEditTask(pendingTasks[0]);
                  } else {
                     onAddFollowUp(customer);
                  }
               }} style={styles.actionBtn}>
                  <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                     <Calendar size={22} color="#2563eb" />
                  </View>
                  <Text style={styles.actionText}>Task</Text>
               </TouchableOpacity>

               <TouchableOpacity onPress={() => setShowPropertyPicker(true)} style={styles.actionBtn}>
                  <View style={[styles.iconBox, { backgroundColor: '#111827' }]}>
                     <Plus size={22} color="#fff" />
                  </View>
                  <Text style={styles.actionText}>Deal</Text>
               </TouchableOpacity>
            </View>

            {/* Active Deals Section */}
            {customerDeals.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active Deals</Text>
                    <View style={styles.listContainer}>
                        {customerDeals.map(deal => {
                            const prop = properties.find(p => p.id === deal.propertyId);
                            return (
                                <TouchableOpacity 
                                    key={deal.id} 
                                    onPress={() => onOpenDeal(deal)}
                                    style={styles.compactCard}
                                >
                                    <Image source={{ uri: prop?.image }} style={styles.compactImg} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.compactTitle} numberOfLines={1}>{prop?.title}</Text>
                                        <Text style={styles.compactSub}>{deal.stage}</Text>
                                    </View>
                                    <ChevronRight size={18} color="#d1d5db" />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Tasks Section */}
            {customerTasks.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tasks ({customerTasks.length})</Text>
                    <View style={styles.listContainer}>
                        {customerTasks.map(task => {
                            const prop = properties.find(p => p.id === task.propertyId);
                            const date = new Date(task.date);
                            const isVisit = task.type === 'Visit' || task.type === 'Meeting';
                            const statusColor = task.status === 'Done' ? '#059669' : '#d97706';
                            
                            return (
                                <View 
                                    key={task.id} 
                                    style={styles.taskCard}
                                >
                                    <View style={styles.taskHeader}>
                                        <View style={[styles.taskTypeBadge, { 
                                            backgroundColor: isVisit ? '#fffbeb' : '#eff6ff' 
                                        }]}>
                                            <Text style={[styles.taskTypeText, { 
                                                color: isVisit ? '#b45309' : '#1d4ed8' 
                                            }]}>
                                                {isVisit ? 'Site Visit' : 'Call / Follow-up'}
                                            </Text>
                                        </View>
                                        
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <TouchableOpacity 
                                                onPress={() => onEditTask && onEditTask(task)}
                                                style={{ padding: 4 }}
                                            >
                                                <Edit3 size={14} color="#6b7280" />
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                onPress={() => onDeleteTask && onDeleteTask(task.id)}
                                                style={{ padding: 4 }}
                                            >
                                                <Trash2 size={14} color="#ef4444" />
                                            </TouchableOpacity>
                                            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                                <Text style={styles.statusText}>{task.status}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    
                                    <Text style={styles.taskNote} numberOfLines={2}>{task.note}</Text>
                                    
                                    <View style={styles.taskFooter}>
                                        <Text style={styles.taskDate}>
                                            {date.toLocaleDateString()} at {date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </Text>
                                        {prop && (
                                            <Text style={styles.taskProperty} numberOfLines={1}>{prop.title}</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Matches Section */}
            <View style={styles.section}>
               <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Matches ({matches.length})</Text>
                  {matches.length > 0 && <Sparkles size={16} color="#f59e0b" />}
               </View>

               {matches.length > 0 ? (
                  <View style={styles.listContainer}>
                     {matches.map(prop => (
                        <TouchableOpacity 
                           key={prop.id} 
                           style={styles.matchCard}
                           activeOpacity={0.8}
                        >
                           <Image source={{ uri: prop.image }} style={styles.matchImg} />
                           <View style={styles.matchContent}>
                              <View>
                                <Text style={styles.matchTitle} numberOfLines={1}>{prop.title}</Text>
                                <View style={styles.rowCenter}>
                                   <MapPin size={12} color="#9ca3af" />
                                   <Text style={styles.matchLoc} numberOfLines={1}>{prop.location}</Text>
                                </View>
                              </View>
                              
                              <View style={styles.matchFooter}>
                                 <Text style={styles.matchPrice}>{formatCurrency(prop.price)}</Text>
                                 <TouchableOpacity 
                                    onPress={() => { onStartDeal(customer, prop); setShowPropertyPicker(false); }}
                                    style={styles.smallDealBtn}
                                 >
                                    <Handshake size={14} color="white" />
                                    <Text style={styles.smallDealText}>Start</Text>
                                 </TouchableOpacity>
                              </View>
                           </View>
                        </TouchableOpacity>
                     ))}
                  </View>
               ) : (
                  <View style={styles.emptyState}>
                     <Text style={styles.emptyText}>No matching properties found.</Text>
                  </View>
               )}
            </View>

          </ScrollView>

          {/* --- PROPERTY PICKER MODAL --- */}
          {showPropertyPicker && (
             <View style={styles.pickerOverlay}>
                <View style={styles.pickerHeader}>
                   <Text style={styles.pickerTitle}>Select Property</Text>
                   <TouchableOpacity onPress={() => setShowPropertyPicker(false)} style={styles.closeButton}>
                      <X size={22} color="#000" />
                   </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.pickerContent}>
                   {properties.filter(p => p.status === 'Available' && !dealtPropertyIds.includes(p.id)).map(p => (
                      <TouchableOpacity 
                         key={p.id} 
                         onPress={() => { onStartDeal(customer, p); setShowPropertyPicker(false); }}
                         style={styles.pickerItem}
                      >
                         <Image source={{ uri: p.image }} style={styles.pickerImg} />
                         <View style={{ flex: 1 }}>
                            <Text style={styles.pickerItemTitle}>{p.title}</Text>
                            <Text style={styles.pickerItemPrice}>{formatCurrency(p.price)}</Text>
                         </View>
                         <Plus size={20} color="#2563eb" />
                      </TouchableOpacity>
                   ))}
                </ScrollView>
             </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)', // Slightly darker overlay
  },
  sheetContainer: {
    backgroundColor: '#f9fafb', // Light gray background for contrast
    width: '100%',
    height: '83%', // Increased Height for spacious feel
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  
  // Header
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    height: 52, // Bigger Avatar
    width: 52,
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#374151',
  },
  customerName: {
    fontSize: 16, // Bigger Font
    fontWeight: 'bold',
    color: '#111827',
  },
  customerPhone: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 99,
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  
  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 28, // More gap
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  verticalLine: {
    width: 1,
    height: '80%',
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32, // More gap
  },
  actionBtn: {
    alignItems: 'center',
    width: '22%',
  },
  iconBox: {
    width: 52, // Bigger Touch Target
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },

  // Sections
  section: {
    marginBottom: 32, // Spacing between sections
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  listContainer: {
    gap: 14, // Gap between cards
  },
  
  // Compact Deal Card
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  compactImg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  compactSub: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
    marginTop: 2,
  },

  // Task Card
  taskCard: {
    padding: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  taskNote: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 18,
  },
  taskFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  taskDate: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  taskProperty: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },

  // Match Card (Spacious)
  matchCard: {
    flexDirection: 'row',
    padding: 16, // More padding inside
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  matchImg: {
    width: 70, // Bigger Image
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  matchContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  matchTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  matchLoc: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  matchPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2563eb',
  },
  smallDealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  smallDealText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#f9fafb',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
  },

  // Property Picker
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 50,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginTop: 20,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pickerContent: {
    padding: 20,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    marginBottom: 12,
    gap: 14,
  },
  pickerImg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  pickerItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickerItemPrice: {
    fontSize: 13,
    color: '#6b7280',
  }
});

export default CustomerDetailSheet;