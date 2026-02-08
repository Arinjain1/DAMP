import {
  BadgeIndianRupee,
  Check,
  ChevronRight,
  CircleCheckBig,
  Clock,
  Edit3,
  FileText,
  Handshake,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Users,
  X
} from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// --- SALES STAGES LIST ---
const SALES_STAGES = [
  { id: 'New', label: 'New', icon: 'Check' },
  { id: 'Contacted', label: 'Contacted', icon: 'Phone' },
  { id: 'Site Visit', label: 'Site Visit', icon: 'MapPin' },
  { id: 'Interested', label: 'Interested', icon: 'ThumbsUp' },
  { id: 'Meeting', label: 'Meeting', icon: 'Users' },
  { id: 'Negotiation', label: 'Negotiation', icon: 'Handshake' },
  { id: 'Token', label: 'Token', icon: 'BadgeIndianRupee' },
  { id: 'Agreement', label: 'Agreement', icon: 'FileText' },
  { id: 'Completed', label: 'Completed', icon: 'CircleCheckBig' },
];

// Icon mapping
const getStageIcon = (iconName, size, color) => {
  const icons = {
    Check: <Check size={size} color={color} />,
    Phone: <Phone size={size} color={color} />,
    ThumbsUp: <ThumbsUp size={size} color={color} />,
    MapPin: <MapPin size={size} color={color} />,
    Users: <Users size={size} color={color} />,
    Handshake: <Handshake size={size} color={color} />,
    BadgeIndianRupee: <BadgeIndianRupee size={size} color={color} />,
    FileText: <FileText size={size} color={color} />,
    CircleCheckBig: <CircleCheckBig size={size} color={color} />,
  };
  return icons[iconName] || <Check size={size} color={color} />;
};

// --- STAGE INDICATOR COMPONENT ---
const StageIndicator = ({ currentStage }) => {
  const currentIndex = SALES_STAGES.findIndex(s => s.id === currentStage);
  
  return (
    <View style={styles.stageContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stageScrollContent}
      >
        {SALES_STAGES.map((stage, index) => {
          const isCurrent = currentIndex === index;
          const isCompleted = currentIndex > index;
          
          let circleStyle, iconColor;
          if (isCompleted) {
            circleStyle = styles.stageCircleCompleted;
            iconColor = '#ffffff';
          } else if (isCurrent) {
            circleStyle = styles.stageCircleCurrent;
            iconColor = '#ffffff';
          } else {
            circleStyle = styles.stageCircleFuture;
            iconColor = '#d1d5db';
          }
          
          return (
            <View key={stage.id} style={styles.stageItem}>
              <View style={[styles.stageCircle, circleStyle]}>
                {getStageIcon(stage.icon, 20, iconColor)}
              </View>
              <Text style={[
                styles.stageLabel,
                isCurrent && styles.stageLabelActive
              ]}>
                {stage.label}
              </Text>
              {isCurrent && <View style={styles.stageUnderline} />}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const CustomerDetailSheet = ({ customer, onClose, properties = [], activeDeals = [], followUps = [], onAddFollowUp, onStartDeal, onOpenDeal, onEditTask, onDeleteTask, onUpdateStage, onSelectProperties }) => {
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState(customer.selectedProperties || []);
  const [interestedPropertyIds, setInterestedPropertyIds] = useState(customer.interestedProperties || []);
  const [holdPropertyIds, setHoldPropertyIds] = useState(customer.holdProperties || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapView, setShowMapView] = useState(false);
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [isPropertyExpanded, setIsPropertyExpanded] = useState(false);

  if (!customer) return null;

  const currentStageIndex = SALES_STAGES.findIndex(s => s.id === (customer.stage || 'New'));
  const nextStage = currentStageIndex < SALES_STAGES.length - 1 ? SALES_STAGES[currentStageIndex + 1] : null;
  
  const showNextStepCard = nextStage && (customer.stage === 'New' || customer.stage === 'Contacted');

  const handleProceedToNextStage = () => {
    if (nextStage && onUpdateStage) {
      onUpdateStage(customer.id, nextStage.id);
    }
  };

  const handleToggleProperty = (propertyId) => {
    const newSelection = selectedPropertyIds.includes(propertyId)
      ? selectedPropertyIds.filter(id => id !== propertyId)
      : [...selectedPropertyIds, propertyId];
    
    setSelectedPropertyIds(newSelection);
    
    // Update customer with selected properties after state update
    if (onSelectProperties) {
      onSelectProperties(customer.id, newSelection);
    }
  };

  const handlePropertyInterested = (propertyId) => {
    // Add to interested properties array (don't replace, add to existing)
    const newInterestedProperties = interestedPropertyIds.includes(propertyId)
      ? interestedPropertyIds
      : [...interestedPropertyIds, propertyId];
    
    setInterestedPropertyIds(newInterestedProperties);
    
    // Update customer with interested properties (separate from selectedProperties)
    if (onSelectProperties) {
      const customer_data = {
        selectedProperties: selectedPropertyIds, // Keep original selected properties
        interestedProperties: newInterestedProperties // Track interested properties separately
      };
      // Store both arrays in customer
      const customerToUpdate = properties.length > 0 ? customer : null;
      if (customerToUpdate) {
        onSelectProperties(customer.id, selectedPropertyIds, newInterestedProperties);
      }
    }
    
    // Move customer to Interested stage
    if (onUpdateStage) {
      onUpdateStage(customer.id, 'Interested');
    }
    
    // Close the map view to show the updated stage
    setShowMapView(false);
    setIsPropertyExpanded(false);
  };

  const handlePropertyNotInterested = (propertyId) => {
    // Remove property from selectedProperties
    const newSelectedProperties = selectedPropertyIds.filter(id => id !== propertyId);
    setSelectedPropertyIds(newSelectedProperties);
    
    // Update customer with updated selected properties
    if (onSelectProperties) {
      onSelectProperties(customer.id, newSelectedProperties, interestedPropertyIds);
    }
    
    // If no properties left, close map view
    if (newSelectedProperties.length === 0) {
      setShowMapView(false);
      setIsPropertyExpanded(false);
    } else {
      // Move to next property if available
      if (currentPropertyIndex >= newSelectedProperties.length) {
        setCurrentPropertyIndex(newSelectedProperties.length - 1);
      }
    }
  };

  const handlePropertyHold = (propertyId) => {
    // Add to hold properties array
    const newHoldProperties = holdPropertyIds.includes(propertyId)
      ? holdPropertyIds
      : [...holdPropertyIds, propertyId];
    
    setHoldPropertyIds(newHoldProperties);
    
    // Keep property in selectedProperties (don't remove it)
    // Update customer with hold properties
    if (onSelectProperties) {
      onSelectProperties(customer.id, selectedPropertyIds, interestedPropertyIds, newHoldProperties);
    }
  };

  const customerDeals = activeDeals.filter(d => d.customerId === customer.id);
  const dealtPropertyIds = customerDeals.map(d => d.propertyId);
  const customerTasks = followUps.filter(f => f.customerId === customer.id);

  // Determine which properties to show based on stage
  // Filter out hold properties from the active list
  const propertiesToShow = customer.stage === 'Interested' 
    ? interestedPropertyIds.filter(id => !holdPropertyIds.includes(id))
    : selectedPropertyIds.filter(id => !holdPropertyIds.includes(id));

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        
        <View style={styles.sheetContainer}>
          
          {/* Header */}
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
          
          {/* Stage Indicator */}
          <StageIndicator currentStage={customer.stage || 'New'} />

          {/* Main Content */}
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={{ paddingBottom: 100 }} 
            showsVerticalScrollIndicator={false}
          >

            {/* --- UPDATED NEXT STEP CARD (Vertical Layout + Full Width Button) --- */}
            {showNextStepCard && (
              <View style={styles.nextStepCard}>
                <View style={styles.nextStepInfo}>
                  <Text style={styles.nextStepLabel}>NEXT STEP</Text>
                  <Text style={styles.nextStepTitle}>Move to {nextStage.label}</Text>
                  <Text style={styles.nextStepSub}>Advance stage to track progress.</Text>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.proceedButton,
                    customer.stage === 'Contacted' && selectedPropertyIds.length === 0 && styles.proceedButtonDisabled
                  ]}
                  onPress={handleProceedToNextStage}
                  activeOpacity={0.9}
                  disabled={customer.stage === 'Contacted' && selectedPropertyIds.length === 0}
                >
                  <Text style={styles.proceedButtonText}>Proceed to {nextStage.label}</Text>
                  <ChevronRight size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {/* Customer Contact Card - Show only for New stage */}
            {customer.stage === 'New' && (
              <View style={styles.section}>
                <View style={styles.contactCard}>
                  <View style={styles.contactInfoSection}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactAvatarText}>{customer.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactName}>{customer.name}</Text>
                      <Text style={styles.contactPhone}>{customer.phone}</Text>
                    </View>
                  </View>
                  <View style={styles.contactButtonRow}>
                    <TouchableOpacity 
                      style={styles.contactActionBtn}
                      onPress={() => Linking.openURL(`tel:${customer.phone}`)}
                    >
                      <Phone size={18} color="#16a34a" />
                      <Text style={styles.contactActionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.contactActionBtn}
                      onPress={() => Linking.openURL(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`)}
                    >
                      <MessageCircle size={18} color="#25D366" />
                      <Text style={styles.contactActionText}>WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Select Properties Section - Show only for Contacted stage */}
            {customer.stage === 'Contacted' && (
              <View style={styles.section}>
                <Text style={styles.formLabel}>
                  Properties to Show ({selectedPropertyIds.length})
                </Text>
                
                <TouchableOpacity 
                  style={styles.selectPropertiesButton}
                  onPress={() => setShowPropertyPicker(true)}
                >
                  <Plus size={20} color="#6a7380" />
                  <Text style={styles.selectPropertiesButtonText}>Select Properties</Text>
                </TouchableOpacity>

                {/* Show selected properties */}
                {selectedPropertyIds.length > 0 && (
                  <View style={styles.listContainer}>
                    {selectedPropertyIds.map(propId => {
                      const prop = properties.find(p => p.id === propId);
                      if (!prop) return null;
                      return (
                        <View key={prop.id} style={styles.selectedPropertyItem}>
                          <Image source={{ uri: prop.image }} style={styles.compactImg} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.compactTitle} numberOfLines={1}>{prop.title}</Text>
                            <Text style={styles.matchPrice}>{formatCurrency(prop.price)}</Text>
                          </View>
                          <TouchableOpacity 
                            onPress={() => handleToggleProperty(prop.id)}
                            style={styles.removeButton}
                          >
                            <X size={16} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* Properties to Show - Show for Site Visit and later stages */}
            {customer.stage !== 'New' && customer.stage !== 'Contacted' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Properties to Show ({propertiesToShow.length})
                </Text>
                
                {/* Hide Add More Properties button for Interested stage */}
                {customer.stage !== 'Interested' && (
                  <TouchableOpacity 
                    style={styles.selectPropertiesButton}
                    onPress={() => setShowPropertyPicker(true)}
                  >
                    <Plus size={20} color="#6a7380" />
                    <Text style={styles.selectPropertiesButtonText}>Add More Properties</Text>
                  </TouchableOpacity>
                )}

                {propertiesToShow.length > 0 && (
                  <View style={styles.listContainer}>
                    {propertiesToShow.map(propId => {
                      const prop = properties.find(p => p.id === propId);
                      if (!prop) return null;
                      
                      // Check if deal already exists for this property
                      const hasDeal = dealtPropertyIds.includes(prop.id);
                      
                      return (
                        <View key={prop.id} style={styles.matchCard}>
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
                            {!hasDeal ? (
                              <TouchableOpacity 
                                onPress={() => {
                                  if (customer.stage === 'Interested') {
                                    // Show confirmation alert before starting deal
                                    Alert.alert(
                                      '🤝 Start Deal',
                                      `Are you sure you want to start a deal for "${prop.title}" with ${customer.name}?\n\nThis will move the customer to Meeting stage.`,
                                      [
                                        {
                                          text: 'Cancel',
                                          style: 'cancel'
                                        },
                                        {
                                          text: 'Yes, Start Deal',
                                          onPress: () => {
                                            onStartDeal(customer, prop);
                                            if (onUpdateStage) {
                                              onUpdateStage(customer.id, 'Meeting');
                                            }
                                          }
                                        }
                                      ]
                                    );
                                  } else {
                                    // Open Google Maps for other stages
                                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.location)}`);
                                  }
                                }}
                                style={styles.visitBtn}
                              >
                                {customer.stage !== 'Interested' && (
                                  <MapPin size={14} color="white" />
                                )}
                                <Text style={styles.visitBtnText}>
                                  {customer.stage === 'Interested' ? 'Start Deal' : 'Visit'}
                                </Text>
                              </TouchableOpacity>
                            ) : (
                              <View style={styles.dealStartedBadge}>
                                <CircleCheckBig size={12} color="#059669" />
                                <Text style={styles.dealStartedText}>Deal Started</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
                )}
              </View>
            )}

            {/* Pending Decision - Show hold properties in Site Visit stage */}
            {customer.stage === 'Site Visit' && holdPropertyIds.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Decision ({holdPropertyIds.length})</Text>
                <View style={styles.listContainer}>
                  {holdPropertyIds.map(propId => {
                    const prop = properties.find(p => p.id === propId);
                    if (!prop) return null;
                    
                    // Check if deal already exists for this property
                    const hasDeal = dealtPropertyIds.includes(prop.id);
                    
                    return (
                      <View key={prop.id} style={styles.matchCard}>
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
                            {!hasDeal ? (
                              <TouchableOpacity 
                                onPress={() => {
                                  // Open Google Maps with property location
                                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.location)}`);
                                }}
                                style={styles.visitBtn}
                              >
                                <MapPin size={14} color="white" />
                                <Text style={styles.visitBtnText}>Visit</Text>
                              </TouchableOpacity>
                            ) : (
                              <View style={styles.dealStartedBadge}>
                                <CircleCheckBig size={12} color="#059669" />
                                <Text style={styles.dealStartedText}>Deal Started</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Pending Decision - Show hold properties in Interested stage */}
            {customer.stage === 'Interested' && holdPropertyIds.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Decision ({holdPropertyIds.length})</Text>
                <View style={styles.listContainer}>
                  {holdPropertyIds.map(propId => {
                    const prop = properties.find(p => p.id === propId);
                    if (!prop) return null;
                    
                    // Check if deal already exists for this property
                    const hasDeal = dealtPropertyIds.includes(prop.id);
                    
                    return (
                      <View key={prop.id} style={styles.pendingCardWithButtons}>
                        {/* Top Section - Image and Details */}
                        <View style={styles.pendingCardTop}>
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
                              <View style={styles.holdBadge}>
                                <Clock size={12} color="#d97706" />
                                <Text style={styles.holdBadgeText}>On Hold</Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        {/* Bottom Section - Action Buttons Full Width */}
                        <View style={styles.pendingActionButtonsVertical}>
                          <TouchableOpacity 
                            style={styles.interestedActionBtn}
                            onPress={() => {
                              // Add to interested properties without changing stage
                              const newInterestedProperties = interestedPropertyIds.includes(propId)
                                ? interestedPropertyIds
                                : [...interestedPropertyIds, propId];
                              
                              setInterestedPropertyIds(newInterestedProperties);
                              
                              // Remove from hold properties
                              const newHoldProperties = holdPropertyIds.filter(id => id !== propId);
                              setHoldPropertyIds(newHoldProperties);
                              
                              // Update customer
                              if (onSelectProperties) {
                                onSelectProperties(customer.id, selectedPropertyIds, newInterestedProperties, newHoldProperties);
                              }
                            }}
                          >
                            <Text style={styles.interestedActionText}>Interested</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.visitActionBtn}
                            onPress={() => {
                              // Open Google Maps with property location
                              Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.location)}`);
                            }}
                          >
                            <Text style={styles.visitActionText}>Visit</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Active Deals - Hide for New and Contacted stages */}
            {customer.stage !== 'New' && customer.stage !== 'Contacted' && customerDeals.length > 0 && (
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

            {/* Tasks - Hide for New stage */}
            {customer.stage !== 'New' && customerTasks.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tasks ({customerTasks.length})</Text>
                    <View style={styles.listContainer}>
                        {customerTasks.map(task => {
                            const prop = properties.find(p => p.id === task.propertyId);
                            const date = new Date(task.date);
                            const isVisit = task.type === 'Visit' || task.type === 'Meeting';
                            const statusColor = task.status === 'Done' ? '#059669' : '#d97706';
                            
                            return (
                                <View key={task.id} style={styles.taskCard}>
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

          </ScrollView>

          {/* Property Picker Modal */}
          {showPropertyPicker && (
             <View style={styles.pickerOverlay}>
                <View style={styles.pickerHeader}>
                   <Text style={styles.pickerTitle}>
                     {customer.stage === 'Contacted' ? 'Select Properties to Show' : 'Select Property'}
                   </Text>
                   <TouchableOpacity onPress={() => {
                     setShowPropertyPicker(false);
                     setSearchQuery('');
                   }} style={styles.closeButton}>
                      <X size={22} color="#000" />
                   </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <Search size={18} color="#9ca3af" />
                  <TextInput
                    placeholder="Search properties..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <X size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <ScrollView style={styles.pickerContent}>
                   {properties
                     .filter(p => {
                       // Filter by search query
                       const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                           p.location.toLowerCase().includes(searchQuery.toLowerCase());
                       // For Contacted and Site Visit stages: show all matching properties
                       // For other stages: show only available properties not in deals
                       if (customer.stage === 'Contacted' || customer.stage === 'Site Visit') {
                         return matchesSearch && p.type === customer.type && p.status !== 'Sold';
                       } else {
                         return matchesSearch && p.status === 'Available' && !dealtPropertyIds.includes(p.id);
                       }
                     })
                     .map(p => {
                     const isSelected = selectedPropertyIds.includes(p.id);
                     const canToggle = customer.stage === 'Contacted' || customer.stage === 'Site Visit';
                     return (
                      <TouchableOpacity 
                         key={p.id} 
                         onPress={() => {
                           if (canToggle) {
                             // For Contacted and Site Visit stages: toggle selection
                             handleToggleProperty(p.id);
                           } else {
                             // For other stages: show confirmation before starting deal
                             Alert.alert(
                               '🤝 Start Deal',
                               `Are you sure you want to start a deal for "${p.title}" with ${customer.name}?\n\nThis will move the customer to Meeting stage.`,
                               [
                                 {
                                   text: 'Cancel',
                                   style: 'cancel'
                                 },
                                 {
                                   text: 'Yes, Start Deal',
                                   onPress: () => {
                                     onStartDeal(customer, p);
                                     setShowPropertyPicker(false);
                                     setSearchQuery('');
                                   }
                                 }
                               ]
                             );
                           }
                         }}
                         style={[
                           styles.pickerItem,
                           canToggle && isSelected && styles.pickerItemSelected
                         ]}
                      >
                         <Image source={{ uri: p.image }} style={styles.pickerImg} />
                         <View style={{ flex: 1 }}>
                            <Text style={styles.pickerItemTitle}>{p.title}</Text>
                            <View style={styles.rowCenter}>
                              <MapPin size={10} color="#9ca3af" />
                              <Text style={styles.pickerItemLocation}>{p.location}</Text>
                            </View>
                            <Text style={styles.pickerItemPrice}>{formatCurrency(p.price)}</Text>
                         </View>
                         {canToggle ? (
                           <View style={[
                             styles.checkboxCircle,
                             isSelected && styles.checkboxCircleSelected
                           ]}>
                             {isSelected && <Check size={16} color="#ffffff" />}
                           </View>
                         ) : (
                           <Plus size={20} color="#2563eb" />
                         )}
                      </TouchableOpacity>
                     );
                   })}
                </ScrollView>

                {/* Done button for Contacted and Site Visit stages */}
                {(customer.stage === 'Contacted' || customer.stage === 'Site Visit') && (
                  <View style={styles.pickerFooter}>
                    <TouchableOpacity 
                      style={styles.doneButton}
                      onPress={() => {
                        setShowPropertyPicker(false);
                        setSearchQuery('');
                      }}
                    >
                      <Text style={styles.doneButtonText}>Done ({selectedPropertyIds.length} selected)</Text>
                    </TouchableOpacity>
                  </View>
                )}
             </View>
          )}

        </View>

        {/* Fixed Bottom Buttons - Show for Site Visit stage */}
        {customer.stage === 'Site Visit' && (
          <View style={styles.fixedBottomContainer}>
            {/* Show two buttons if there are interested properties */}
            {interestedPropertyIds.length > 0 ? (
              <View style={styles.twoButtonRow}>
                <TouchableOpacity 
                  style={[styles.halfWidthButton, styles.interestedButton]}
                  onPress={() => {
                    if (onUpdateStage) {
                      onUpdateStage(customer.id, 'Interested');
                    }
                  }}
                >
                  <Text style={styles.visitSitesButtonText}>View Interested ({interestedPropertyIds.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.halfWidthButton,
                    styles.visitSitesButton,
                    selectedPropertyIds.length === 0 && styles.visitSitesButtonDisabled
                  ]}
                  onPress={() => setShowMapView(true)}
                  disabled={selectedPropertyIds.length === 0}
                >
                  <MapPin size={20} color="white" />
                  <Text style={styles.visitSitesButtonText}>Visit Sites ({selectedPropertyIds.length})</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.visitSitesButton,
                  selectedPropertyIds.length === 0 && styles.visitSitesButtonDisabled
                ]}
                onPress={() => setShowMapView(true)}
                disabled={selectedPropertyIds.length === 0}
              >
                <MapPin size={20} color="white" />
                <Text style={styles.visitSitesButtonText}>Visit Sites ({selectedPropertyIds.length})</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Fixed Bottom Button - Show only for Interested stage */}
        {customer.stage === 'Interested' && (
          <View style={styles.fixedBottomContainer}>
            <TouchableOpacity 
              style={styles.visitSitesButton}
              onPress={() => {
                if (onUpdateStage) {
                  onUpdateStage(customer.id, 'Site Visit');
                }
              }}
            >
              <MapPin size={20} color="white" />
              <Text style={styles.visitSitesButtonText}>Back to Visit Sites</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Map View Modal */}
      {showMapView && (
        <Modal
          visible={true}
          transparent={false}
          animationType="slide"
          onRequestClose={() => {
            setShowMapView(false);
            setIsPropertyExpanded(false);
          }}
          statusBarTranslucent
        >
          <View style={styles.mapViewContainer}>
            {/* Background Map Image */}
            <Image 
              source={require('../../assets/images/Rectangle.png')} 
              style={styles.mapImage}
              resizeMode="cover"
              progressiveRenderingEnabled={true}
              fadeDuration={300}
            />
            
            {/* Header with Title and Close Button */}
            <View style={styles.mapHeader}>
              <TouchableOpacity 
                style={styles.mapCloseButton}
                onPress={() => {
                  setShowMapView(false);
                  setIsPropertyExpanded(false);
                }}
              >
                <X size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Properties Horizontal Scroll - Small Cards */}
            {!isPropertyExpanded && (
              <View style={styles.collapsedModalCard}>
                {/* Horizontal Line */}
                <TouchableOpacity 
                  activeOpacity={1}
                  onPress={() => {
                    if (selectedPropertyIds.length > 0) {
                      setCurrentPropertyIndex(0);
                      setIsPropertyExpanded(true);
                    }
                  }}
                >
                  <View style={styles.handleBar} />

                  {/* Visit Sites Label */}
                  <Text style={styles.propertiesToShowLabel}>Visit Sites</Text>
                </TouchableOpacity>

                {/* Property Horizontal Scroll */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.propertiesScrollContent}
                  nestedScrollEnabled={true}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={3}
                  windowSize={5}
                >
                  {selectedPropertyIds.map((propId, index) => {
                    const prop = properties.find(p => p.id === propId);
                    if (!prop) return null;
                    
                    return (
                      <TouchableOpacity 
                        key={prop.id} 
                        style={styles.propertyScrollCard}
                        onPress={() => {
                          setCurrentPropertyIndex(index);
                          setIsPropertyExpanded(true);
                        }}
                        activeOpacity={0.9}
                      >
                        <Image source={{ uri: prop.image }} style={styles.propertyScrollImageSmall} />
                        <View style={styles.propertyScrollInfo}>
                          <Text style={styles.propertyScrollTitle} numberOfLines={2}>{prop.title}</Text>
                          <View style={styles.propertyScrollLocation}>
                            <MapPin size={14} color="#6b7280" />
                            <Text style={styles.propertyScrollLocationText} numberOfLines={1}>{prop.location}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Expanded Property Details */}
            {isPropertyExpanded && selectedPropertyIds.length > 0 && (
              <View style={styles.expandedModalCard}>
                {/* Horizontal Line */}
                <TouchableOpacity 
                  activeOpacity={1}
                  onPress={() => setIsPropertyExpanded(false)}
                >
                  <View style={styles.handleBar} />
                </TouchableOpacity>

                {/* Visit Sites Label */}
                <Text style={styles.propertiesToShowLabel}>Visit Sites</Text>

                {/* Property Horizontal Scroll */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.expandedPropertiesScroll}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  snapToInterval={322}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / 322);
                    setCurrentPropertyIndex(index);
                  }}
                >
                  {selectedPropertyIds.map((propId, index) => {
                    const prop = properties.find(p => p.id === propId);
                    if (!prop) return null;
                    
                    // Check if property is on hold
                    const isOnHold = holdPropertyIds.includes(propId);
                    
                    return (
                      <View 
                        key={prop.id} 
                        style={styles.expandedPropertyCard}
                      >
                        <Image source={{ uri: prop.image }} style={styles.expandedPropertyCardImage} />
                        <View style={styles.expandedPropertyCardInfo}>
                          <View style={styles.propertyCardHeader}>
                            <Text style={styles.expandedPropertyCardTitle} numberOfLines={1}>
                              {prop.title}
                            </Text>
                            {isOnHold && (
                              <View style={styles.holdBadgeSmall}>
                                <Clock size={10} color="#d97706" />
                                <Text style={styles.holdBadgeSmallText}>Hold</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.expandedPropertyCardLocation}>
                            <MapPin size={12} color="#9ca3af" />
                            <Text style={styles.expandedPropertyCardLocationText} numberOfLines={1}>
                              {prop.location}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>

                {/* Feedback Buttons - Single Row with Partitions */}
                <View style={styles.feedbackButtonsRow}>
                  <TouchableOpacity 
                    style={styles.feedbackBtn}
                    onPress={() => {
                      const propId = selectedPropertyIds[currentPropertyIndex];
                      if (propId) {
                        handlePropertyInterested(propId);
                      }
                    }}
                  >
                    <ThumbsUp size={20} color="#374151" />
                    <Text style={styles.feedbackTextHorizontal}>Interested</Text>
                  </TouchableOpacity>
                  <View style={styles.verticalDivider} />
                  <TouchableOpacity 
                    style={styles.feedbackBtn}
                    onPress={() => {
                      const propId = selectedPropertyIds[currentPropertyIndex];
                      if (propId) {
                        handlePropertyNotInterested(propId);
                      }
                    }}
                  >
                    <ThumbsDown size={20} color="#374151" />
                    <Text style={styles.feedbackTextHorizontal}>Not-Interested</Text>
                  </TouchableOpacity>
                  <View style={styles.verticalDivider} />
                  <TouchableOpacity 
                    style={styles.feedbackBtn}
                    onPress={() => {
                      const propId = selectedPropertyIds[currentPropertyIndex];
                      if (propId) {
                        handlePropertyHold(propId);
                      }
                    }}
                  >
                    <Clock size={20} color="#374151" />
                    <Text style={styles.feedbackTextHorizontal}>Hold</Text>
                  </TouchableOpacity>
                </View>

                {/* Contact Owner Button */}
                <TouchableOpacity 
                  style={styles.contactOwnerButton}
                  onPress={() => {
                    const prop = properties.find(p => p.id === selectedPropertyIds[currentPropertyIndex]);
                    if (prop && prop.ownerPhone) {
                      Linking.openURL(`tel:${prop.ownerPhone}`);
                    }
                  }}
                >
                  <Phone size={18} color="#374151" />
                  <Text style={styles.contactOwnerText}>Call Owner</Text>
                </TouchableOpacity>

                {/* Navigate Button */}
                <TouchableOpacity 
                  style={styles.navigateButtonExpanded}
                  onPress={() => {
                    const prop = properties.find(p => p.id === selectedPropertyIds[currentPropertyIndex]);
                    if (prop) {
                      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.location)}`);
                    }
                  }}
                >
                  <Text style={styles.navigateButtonExpandedText}>Navigate to Property</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetContainer: {
    backgroundColor: '#f9fafb',
    width: '100%',
    height: '83%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  
  // Header
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    gap: 12,
  },
  avatar: {
    height: 44,
    width: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#374151',
  },
  customerName: {
    fontSize: 16,
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
    backgroundColor: '#ffffff',
  },
  
  // Sections
  section: {
    marginBottom: 32,
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
    gap: 14,
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
    fontSize: 15,
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

  // Match Card
  matchCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    gap: 16,
    
  },
  pendingCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    gap: 16,
  },
  pendingCardVertical: {
    flexDirection: 'column',
    padding: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    gap: 12,
  },
  pendingCardWithButtons: {
    flexDirection: 'column',
    padding: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    gap: 12,
  },
  pendingCardTop: {
    flexDirection: 'row',
    gap: 16,
  },
  pendingCardImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  pendingCardContent: {
    gap: 8,
  },
  matchImg: {
    width: 70,
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
    marginBottom: 2,
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
    marginTop: 4,
  },
  matchPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#6b7280',
  },
  pendingActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  pendingActionButtonsVertical: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  interestedActionBtn: {
    flex: 1,
    backgroundColor: '#34d399',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  interestedActionBtnFull: {
    width: '100%',
    backgroundColor: '#34d399',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  interestedActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  visitActionBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  visitActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  startDealActionBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  startDealActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
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
  visitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  visitBtnText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dealStartedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dealStartedText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: 'bold',
  },
  holdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  holdBadgeText: {
    color: '#d97706',
    fontSize: 10,
    fontWeight: 'bold',
  },
  holdBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fef3c7',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  holdBadgeSmallText: {
    color: '#d97706',
    fontSize: 9,
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
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'white',
    zIndex: 50,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop: 0,
    backgroundColor: '#ffffff',
  },
  pickerTitle: { 
    fontSize: 17, 
    fontWeight: '800',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft:6,
  },
  searchContainer: {
    marginTop:20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  pickerContent: { padding: 20, paddingTop: 8 },
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
  pickerItemTitle: { fontSize: 14, fontWeight: 'bold' },
  pickerItemLocation: { fontSize: 11, color: '#9ca3af', marginLeft: 4 },
  pickerItemPrice: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  
  // Stage Indicator
  stageContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stageScrollContent: {
    paddingHorizontal: 8,
    gap: 24,
  },
  stageItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  stageCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stageCircleCompleted: { backgroundColor: '#86efac' },
  stageCircleCurrent: { backgroundColor: '#1f2937' },
  stageCircleFuture: { backgroundColor: '#f3f4f6' },
  stageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },
  stageLabelActive: { color: '#1f2937', fontWeight: '700' },
  stageUnderline: {
    width: 32,
    height: 3,
    backgroundColor: '#1f2937',
    borderRadius: 2,
    marginTop: 4,
  },

  // --- UPDATED NEXT STEP CARD ---
  nextStepCard: {
    backgroundColor: '#E9E6F7', // Reference Card BG
    borderColor: '#BFB7FD',     // Reference Card Border
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    // Column layout (default in RN) ensures vertical stacking
    shadowColor: '#BFB7FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  nextStepInfo: {
    marginBottom: 16, // Space between Text and Button
  },
  nextStepLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7c3aed', 
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  nextStepSub: {
    fontSize: 12,
    color: '#6b7280',
  },
  proceedButton: {
    backgroundColor: '#9f95f2', // Darker purple when enabled
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%', // Full Width
    shadowColor: '#9f95f2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  proceedButtonDisabled: {
    backgroundColor: '#BFB7FD', // Light purple when disabled
    shadowColor: '#BFB7FD',
    opacity: 0.6,
  },
  proceedButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white', // White Text
  },

  // Customer Contact Card Styles
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    
  },
  contactInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  contactAvatar: {
    width: 46,
    height: 46,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6b7280',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  contactButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  // Select Properties Styles
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  selectPropertiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e3e6',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  selectPropertiesButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6a7380',
  },
  selectedPropertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    gap: 14,
    
  },
  removeButton: {
    padding: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  selectablePropertyCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    
  },
  selectedPropertyCard: {
    borderColor: '#a78bfa',
    backgroundColor: '#f3f0ff',
  },
  pickerItemSelected: {
    backgroundColor: '#f3f0ff',
    borderColor: '#a78bfa',
  },
  pickerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: 'white',
  },
  doneButton: {
    backgroundColor: '#a78bfa',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  checkboxCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  checkboxCircleSelected: {
    backgroundColor: '#a78bfa',
    borderColor: '#a78bfa',
  },

  // Fixed Bottom Button
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    
    
  },
  visitSitesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    backgroundColor: '#9f95f2',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#9f95f2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  visitSitesButtonDisabled: {
    backgroundColor: '#bfb7fd',
    shadowColor: '#bfb7fd',
    opacity: 0.6,
  },
  visitSitesButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  twoButtonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  halfWidthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  interestedButton: {
    backgroundColor: '#34d399',
    shadowColor: '#34d399',
  },
  pendingDecisionButton: {
    backgroundColor: '#1f2937',
    shadowColor: '#1f2937',
  },

  // Map View Styles
  mapViewContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  mapHeaderContent: {
    flex: 1,
  },
  mapHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  mapHeaderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  mapCloseButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collapsedModalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  propertiesScrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  propertyScrollCard: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginHorizontal: 6,
  },
  propertyScrollImageSmall: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  propertyScrollInfo: {
    flex: 1,
    gap: 6,
  },
  propertyScrollTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  propertyScrollLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyScrollLocationText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  
  // Expanded Modal Card
  expandedModalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 30,
    
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 36,
    height: 36,
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  handleBar: {
    width: 70,
    height: 5,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  propertiesToShowLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 23,
    textAlign: 'center',
  },
  scrollWrapper: {
    marginBottom: 20,
  },
  expandedPropertiesContainer: {
    marginBottom: 28,
  },
  expandedPropertiesScroll: {
    paddingHorizontal: 0,
    gap: 10,
    marginBottom: 20,
  },
  expandedPropertyCard: {
    width: 310,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginHorizontal: 6,
  },
  expandedPropertyCardActive: {
    borderColor: '#bfb7fd',
    backgroundColor: '#faf9ff',
  },
  expandedPropertyCardImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  expandedPropertyCardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  propertyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  expandedPropertyCardTitle: {
    fontFamily:'Lato_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  expandedPropertyCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandedPropertyCardLocationText: {
    fontSize: 13,
    color: '#313131',
    flex: 1,
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 16,
    alignItems: 'center',
  },
  feedbackBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 18,
  },
  verticalDivider: {
    width: 1.5,
    height: '60%',
    backgroundColor: '#e5e7eb',
  },
  feedbackTextHorizontal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  contactOwnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  contactOwnerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  navigateButtonExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a9a0f5',
    paddingVertical: 16,
    borderRadius: 14,
   
  },
  navigateButtonExpandedText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default CustomerDetailSheet;