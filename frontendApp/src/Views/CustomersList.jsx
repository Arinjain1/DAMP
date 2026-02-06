import { ChevronDown, ChevronRight, ChevronUp, CirclePlus, Phone, Search } from 'lucide-react-native';
import { useState } from 'react';
import {
    ImageBackground, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- 1. UPDATED STAGES LIST ---
const SALES_STAGES = [
  { id: 'New', label: 'New', isFirst: true },
  { id: 'Contacted', label: 'Contacted', isFirst: false },
  { id: 'Site Visit', label: 'Site Visit', isFirst: false },
  { id: 'Interested', label: 'Interested', isFirst: false },
  { id: 'Meeting', label: 'Meeting', isFirst: false },
  { id: 'Negotiation', label: 'Negotiation', isFirst: false },
  { id: 'Token', label: 'Token', isFirst: false },
  { id: 'Agreement', label: 'Agreement', isFirst: false },
  { id: 'Completed', label: 'Completed', isFirst: false },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getRandomColor = (char) => {
  const colors = ['#e0f2fe', '#fce7f3', '#dcfce7', '#fef3c7', '#f3e8ff'];
  const textColors = ['#0284c7', '#db2777', '#16a34a', '#d97706', '#9333ea'];
  const index = char.charCodeAt(0) % colors.length;
  return { bg: colors[index], text: textColors[index] };
};

const CustomersList = ({ customers = [], onSelect, onAddCustomer }) => {
  const [query, setQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleCall = (phone, customerName) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      console.log(`No phone available`);
    }
  };

  const toggleCardExpansion = (customerId) => {
    setExpandedCards(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(customerId)) {
        newExpanded.delete(customerId);
      } else {
        newExpanded.add(customerId);
      }
      return newExpanded;
    });
  };

  // Mock current tasks for each customer
  const getCurrentTask = (customerId) => {
    const tasks = {
      'c1': { 
        title: 'Schedule site visit', 
        time: 'Today 2:30 PM',
        type: 'Site Visit'
      },
      'c2': { 
        title: 'Token payment follow-up', 
        time: 'Tomorrow 11:00 AM',
        type: 'Follow-up'
      },
      'c3': { 
        title: 'Initial contact call', 
        time: 'Today 4:00 PM',
        type: 'Call'
      },
      'c4': { 
        title: 'Document handover', 
        time: 'Completed',
        type: 'Documentation'
      },
    };
    return tasks[customerId] || {
      title: 'Follow up required',
      time: 'Pending',
      type: 'General'
    };
  };

  // --- STAGE INDICATOR COMPONENT ---
  const StageIndicator = ({ currentStage }) => {
    const currentIndex = SALES_STAGES.findIndex(s => s.id === currentStage);
    const lastStageIndex = SALES_STAGES.length - 1;
    
    return (
      <View style={styles.stageContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stageScrollContent}
        >
          {SALES_STAGES.map((stage, index) => {
            const isCompleted = currentIndex > index;
            const isLastStage = index === lastStageIndex;
            
            // Choose background image based on stage status
            let backgroundImage;
            if (stage.isFirst) {
              // First stage always uses Front Bg
              backgroundImage = require('../../assets/images/Front Bg (2).png');
            } else if (isLastStage) {
              // Last stage uses Done last bg if completed or current, otherwise regular Last Bg
              if (isCompleted || currentIndex === index) {
                backgroundImage = require('../../assets/images/Done last bg.png');
              } else {
                backgroundImage = require('../../assets/images/Last Bg.png');
              }
            } else if (isCompleted || currentIndex === index) {
              // Middle stages use Done middle Bg if completed or current
              backgroundImage = require('../../assets/images/Done middle Bg.png');
            } else {
              // Future middle stages use regular Middle Bg
              backgroundImage = require('../../assets/images/Middle Bg.png');
            }
            
            return (
              <View key={stage.id} style={styles.stageWrapper}>
                <ImageBackground
                  source={backgroundImage}
                  style={[
                    styles.stageArrow,
                    (stage.isFirst || isLastStage) && styles.stageArrowSpecial
                  ]}
                  resizeMode="stretch"
                >
                  <View style={styles.stageContent}>
                    <Text style={[
                      styles.stageText,
                      (isCompleted || currentIndex === index) && { color: '#7B6FDA' }
                    ]}>
                      {stage.label}
                    </Text>
                  </View>
                </ImageBackground>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Leads</Text>
        
        {/* Search Bar and Add Button Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={16} color="#6b7280" />
            <TextInput
              placeholder="Search leads..."
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onAddCustomer}
          >
            <CirclePlus size={16} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Clients</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyState}>
            <Search size={40} color="#e5e7eb" />
            <Text style={styles.emptyText}>No leads found</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredCustomers.map((customer) => {
              const colorTheme = getRandomColor(customer.name.charAt(0));
              const isExpanded = expandedCards.has(customer.id);
              const currentTask = getCurrentTask(customer.id);
              
              return (
                <View
                  key={customer.id}
                  style={styles.card}
                >
                  {/* Header Info */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: colorTheme.bg }]}>
                      <Text style={[styles.avatarText, { color: colorTheme.text }]}>
                        {customer.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.headerInfo}>
                      <Text style={styles.nameText} numberOfLines={1}>{customer.name}</Text>
                      <Text style={styles.budgetText}>{formatCurrency(customer.budget)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: customer.status === 'Hot' ? '#fee2e2' : '#f3f4f6' }]}>
                      <Text style={[styles.statusText, { color: customer.status === 'Hot' ? '#ef4444' : '#4b5563' }]}>
                        {customer.status || 'New'}
                      </Text>
                    </View>
                    
                    {/* Dropdown Arrow */}
                    <TouchableOpacity 
                      style={styles.dropdownButton}
                      onPress={() => toggleCardExpansion(customer.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp size={20} color="#6b7280" />
                      ) : (
                        <ChevronDown size={20} color="#6b7280" />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Stage Scroll Section */}
                  <View style={styles.stageSection}>
                    <StageIndicator currentStage={customer.stage || 'New'} />
                  </View>

                  {/* Expanded Task Section */}
                  {isExpanded && currentTask && (
                    <View style={styles.taskSection}>
                      <Text style={styles.taskName}>{currentTask.title}</Text>
                      <View style={styles.taskDetails}>
                        <Text style={styles.taskType}>{currentTask.type}</Text>
                        <Text style={styles.taskTime}>{currentTask.time}</Text>
                      </View>
                    </View>
                  )}

                  {/* Actions - Only show when expanded */}
                  {isExpanded && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCall(customer.phone, customer.name);
                        }}
                      >
                        <Phone size={18} color="#22c55e" />
                        <Text style={styles.actionText}>Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={() => onSelect(customer)}
                      >
                        <Text style={styles.actionTextPrimary}>View Details</Text>
                        <ChevronRight size={18} color="#7c3aed" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 16 : 64,
    paddingHorizontal: 20, paddingBottom: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    backgroundColor: '#ffffff',
    alignItems:'center'
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#3E3E3E', marginBottom: 16 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 2,
    borderWidth: 1, borderColor: '#e5e7eb',
    height: 50,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: '#111827', fontWeight: '500', alignItems:'center' },
  scrollView: { flex: 1 , backgroundColor: '#ffffff',},
  scrollContent: { paddingTop: 4, paddingBottom: 100, paddingHorizontal: 20 },
  gridContainer: { gap: 10 },
  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
     marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold' },
  headerInfo: { flex: 1 },
  nameText: { fontSize: 15, fontWeight: 'bold', color: '#3E3E3E', marginBottom: 1 },
  budgetText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // --- STAGE SCROLL STYLES ---
  stageSection: {
    marginBottom: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  stageContainer: {
    height: 46,
  },
  stageScrollContent: {
    paddingHorizontal: 2,
    alignItems: 'center',
    paddingRight: 20,
  },
  stageWrapper: {
    marginRight: 0,
    height: 32,
  },
  stageArrow: {
    height: 36,
    minWidth: 100, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  stageArrowSpecial: {
    height: 38,
  },
  stageContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    color: '#4b5563',
  },

  // Task Section Styles
  taskSection: {
    
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  taskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskType: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    textAlign: 'center',
  },
  taskTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },

  // Actions
  cardActions: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
  },
  actionButtonPrimary: { backgroundColor: '#f3e8ff', borderColor: '#e9d5ff' },
  actionText: { fontSize: 13, fontWeight: '600', color: '#22c55e' },
  actionTextPrimary: { fontSize: 13, fontWeight: '700', color: '#7c3aed' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: '#9ca3af' },
});

export default CustomersList;