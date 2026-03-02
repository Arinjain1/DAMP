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
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Users,
  X
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AddModal from './AddModal';
import { visitsAPI, customersAPI } from '../config/api';
import { showToast } from '../utils/toast';

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

const CustomerDetailSheet = ({ customer, onClose, properties = [], activeDeals = [], followUps = [], onAddFollowUp, onStartDeal, onOpenDeal, onEditTask, onDeleteTask, onUpdateStage, onSelectProperties, openMapView = false }) => {
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState(customer.selectedProperties || []);
  const [interestedPropertyIds, setInterestedPropertyIds] = useState(customer.interestedProperties || []);
  const [holdPropertyIds, setHoldPropertyIds] = useState(customer.holdProperties || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapView, setShowMapView] = useState(openMapView);
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [isPropertyExpanded, setIsPropertyExpanded] = useState(openMapView);
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch customer details on mount to get latest property selections
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customer?.id) return;

      try {
        setLoading(true);
        const response = await customersAPI.getById(customer.id);

        if (response.data.success) {
          const customerData = response.data.data.profile;

          // Update state with fetched data
          setSelectedPropertyIds(customerData.selectedProperties || []);
          setInterestedPropertyIds(customerData.interestedProperties || []);
          setHoldPropertyIds(customerData.holdProperties || []);
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
        // Keep using props data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customer?.id]);

  // Reset search query when property picker opens
  const handleOpenPropertyPicker = () => {
    setSearchQuery('');
    setShowPropertyPicker(true);
  };

  if (!customer) return null;

  const currentStageIndex = SALES_STAGES.findIndex(s => s.id === (customer.stage || 'New'));
  const nextStage = currentStageIndex < SALES_STAGES.length - 1 ? SALES_STAGES[currentStageIndex + 1] : null;

  const showNextStepCard = nextStage && (customer.stage === 'New' || customer.stage === 'Contacted');

  const handleProceedToNextStage = () => {
    if (nextStage && onUpdateStage) {
      onUpdateStage(customer.id, nextStage.id);
    }
  };

  const handleToggleProperty = async (propertyId) => {
    const newSelection = selectedPropertyIds.includes(propertyId)
      ? selectedPropertyIds.filter(id => id !== propertyId)
      : [...selectedPropertyIds, propertyId];

    setSelectedPropertyIds(newSelection);

    try {
      // Save to database
      await customersAPI.updateProperties(customer.id, {
        selected_properties: newSelection
      });

      // Update customer with selected properties after state update
      if (onSelectProperties) {
        onSelectProperties(customer.id, newSelection);
      }
    } catch (error) {
      console.error('Error saving selected properties:', error);
      showToast.error('Failed to save property selection');
      // Revert on error
      setSelectedPropertyIds(selectedPropertyIds);
    }
  };

  const handlePropertyInterested = async (propertyId) => {
    try {
      // Get the current site visit task for this customer
      const siteVisitTask = customerTasks.find(t =>
        (t.type === 'Site Visit' || t.type === 'Visit') &&
        t.status !== 'Done'
      );

      if (siteVisitTask && siteVisitTask.siteVisitId) {
        // Submit feedback to backend with property_id
        await visitsAPI.submitFeedback(siteVisitTask.siteVisitId, {
          outcome: 'interested',
          notes: 'Customer showed interest in this property',
          property_id: propertyId
        });
      }

      // Add to interested properties array (don't replace, add to existing)
      const newInterestedProperties = interestedPropertyIds.includes(propertyId)
        ? interestedPropertyIds
        : [...interestedPropertyIds, propertyId];

      setInterestedPropertyIds(newInterestedProperties);

      // Remove from selectedProperties so it doesn't show in Site Visit anymore
      const newSelectedProperties = selectedPropertyIds.filter(id => id !== propertyId);
      setSelectedPropertyIds(newSelectedProperties);

      // Save to database
      await customersAPI.updateProperties(customer.id, {
        selected_properties: newSelectedProperties,
        interested_properties: newInterestedProperties
      });

      // Update customer with both arrays
      if (onSelectProperties) {
        onSelectProperties(customer.id, newSelectedProperties, newInterestedProperties);
      }

      // DON'T move customer to Interested stage yet - stay in Site Visit
      // Only move when they click "View Interested" button

      // If no more properties to visit, close map view
      if (newSelectedProperties.length === 0) {
        setShowMapView(false);
        setIsPropertyExpanded(false);
      } else {
        // Move to next property if available
        if (currentPropertyIndex >= newSelectedProperties.length) {
          setCurrentPropertyIndex(newSelectedProperties.length - 1);
        }
      }
    } catch (error) {
      console.error('Error submitting interested feedback:', error);
      showToast.error('Failed to submit feedback. Please try again.');
    }
  };

  const handlePropertyNotInterested = async (propertyId) => {
    try {
      // Get the current site visit task for this customer
      const siteVisitTask = customerTasks.find(t =>
        (t.type === 'Site Visit' || t.type === 'Visit') &&
        t.status !== 'Done'
      );

      if (siteVisitTask && siteVisitTask.siteVisitId) {
        // Submit feedback to backend with property_id
        await visitsAPI.submitFeedback(siteVisitTask.siteVisitId, {
          outcome: 'not_interested',
          notes: 'Customer not interested in this property',
          property_id: propertyId
        });
      }

      // Remove property from selectedProperties
      const newSelectedProperties = selectedPropertyIds.filter(id => id !== propertyId);
      setSelectedPropertyIds(newSelectedProperties);

      // Save to database
      await customersAPI.updateProperties(customer.id, {
        selected_properties: newSelectedProperties
      });

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
    } catch (error) {
      console.error('Error submitting not interested feedback:', error);
      showToast.error('Failed to submit feedback. Please try again.');
    }
  };

  const handlePropertyHold = async (propertyId) => {
    try {
      // Get the current site visit task for this customer
      const siteVisitTask = customerTasks.find(t =>
        (t.type === 'Site Visit' || t.type === 'Visit') &&
        t.status !== 'Done'
      );

      if (siteVisitTask && siteVisitTask.siteVisitId) {
        // Submit feedback to backend with property_id
        await visitsAPI.submitFeedback(siteVisitTask.siteVisitId, {
          outcome: 'hold',
          notes: 'Customer wants to hold decision on this property',
          property_id: propertyId
        });
      }

      // Add to hold properties array
      const newHoldProperties = holdPropertyIds.includes(propertyId)
        ? holdPropertyIds
        : [...holdPropertyIds, propertyId];

      setHoldPropertyIds(newHoldProperties);

      // Save to database
      await customersAPI.updateProperties(customer.id, {
        hold_properties: newHoldProperties
      });

      // Keep property in selectedProperties (don't remove it)
      // Update customer with hold properties
      if (onSelectProperties) {
        onSelectProperties(customer.id, selectedPropertyIds, interestedPropertyIds, newHoldProperties);
      }

      showToast.success('Property marked as on hold');
    } catch (error) {
      console.error('Error submitting hold feedback:', error);
      showToast.error('Failed to submit feedback. Please try again.');
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
                  onPress={handleOpenPropertyPicker}
                  disabled={loading}
                >
                  <Plus size={20} color="#6a7380" />
                  <Text style={styles.selectPropertiesButtonText}>
                    {loading ? 'Loading...' : 'Select Properties'}
                  </Text>
                </TouchableOpacity>

                {/* Show selected properties */}
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading properties...</Text>
                  </View>
                ) : selectedPropertyIds.length > 0 ? (
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
                ) : null}
              </View>
            )}

            {/* Properties to Show - Show for Site Visit and later stages */}
            {customer.stage !== 'New' && customer.stage !== 'Contacted' && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    Properties to Show ({propertiesToShow.length})
                  </Text>
                  {customer.stage === 'Site Visit' && (
                    <TouchableOpacity
                      style={styles.addTaskHeaderButton}
                      onPress={() => setShowAddFollowUpModal(true)}
                    >
                      <Plus size={16} color="#ffffff" />
                      <Text style={styles.addTaskHeaderButtonText}>Add Task</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Hide Add More Properties button for Interested stage */}
                {customer.stage !== 'Interested' && (
                  <TouchableOpacity
                    style={styles.selectPropertiesButton}
                    onPress={handleOpenPropertyPicker}
                    disabled={loading}
                  >
                    <Plus size={20} color="#6a7380" />
                    <Text style={styles.selectPropertiesButtonText}>
                      {loading ? 'Loading...' : 'Add More Properties'}
                    </Text>
                  </TouchableOpacity>
                )}

                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading properties...</Text>
                  </View>
                ) : propertiesToShow.length > 0 ? (
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
                                        `Are you sure you want to start a deal for "${prop.title}" with ${customer.name}?\n\nThis will move the customer to In-Process stage.`,
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
                                                onUpdateStage(customer.id, 'In-Process');
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
                ) : null}
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
                            onPress={async () => {
                              try {
                                // Get the current site visit task for this customer
                                const siteVisitTask = customerTasks.find(t =>
                                  (t.type === 'Site Visit' || t.type === 'Visit') &&
                                  t.status !== 'Done'
                                );

                                if (siteVisitTask && siteVisitTask.siteVisitId) {
                                  // Submit feedback to backend with property_id
                                  await visitsAPI.submitFeedback(siteVisitTask.siteVisitId, {
                                    outcome: 'interested',
                                    notes: 'Customer showed interest after holding decision',
                                    property_id: propId
                                  });
                                }

                                // Add to interested properties without changing stage
                                const newInterestedProperties = interestedPropertyIds.includes(propId)
                                  ? interestedPropertyIds
                                  : [...interestedPropertyIds, propId];

                                setInterestedPropertyIds(newInterestedProperties);

                                // Remove from hold properties
                                const newHoldProperties = holdPropertyIds.filter(id => id !== propId);
                                setHoldPropertyIds(newHoldProperties);

                                // Save to database
                                await customersAPI.updateProperties(customer.id, {
                                  interested_properties: newInterestedProperties,
                                  hold_properties: newHoldProperties
                                });

                                // Update customer
                                if (onSelectProperties) {
                                  onSelectProperties(customer.id, selectedPropertyIds, newInterestedProperties, newHoldProperties);
                                }
                              } catch (error) {
                                console.error('Error submitting interested feedback:', error);
                                showToast.error('Failed to submit feedback. Please try again.');
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

            {/* Tasks - Show for Site Visit and other stages (except New) */}
            {customer.stage !== 'New' && (customer.stage === 'Site Visit' || customerTasks.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tasks ({customerTasks.length})</Text>
                {customerTasks.length > 0 ? (
                  <View style={styles.listContainer}>
                    {customerTasks.map(task => {
                      // Support both single propertyId (old) and propertyIds array (new)
                      const taskPropertyIds = task.propertyIds || (task.propertyId ? [task.propertyId] : []);
                      const taskProperties = properties.filter(p => taskPropertyIds.includes(p.id));
                      const date = new Date(task.date);
                      const isSiteVisit = task.type === 'Site Visit' || task.type === 'Visit';
                      const statusColor = task.status === 'Done' ? '#059669' : '#d97706';

                      return (
                        <View key={task.id} style={styles.taskCard}>
                          <View style={styles.taskHeader}>
                            <View style={[styles.taskTypeBadge, {
                              backgroundColor: isSiteVisit ? '#fffbeb' : '#eff6ff'
                            }]}>
                              <Text style={[styles.taskTypeText, {
                                color: isSiteVisit ? '#b45309' : '#1d4ed8'
                              }]}>
                                {isSiteVisit ? 'Site Visit' : task.type}
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
                            <View style={{ flex: 1 }}>
                              <Text style={styles.taskDate}>
                                {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                              {taskProperties.length > 0 && (
                                <Text style={styles.taskProperty} numberOfLines={1}>
                                  {taskProperties.map(p => p.title).join(', ')}
                                </Text>
                              )}
                            </View>

                            {/* Site Visit Button - Show only for Site Visit tasks */}
                            {isSiteVisit && taskProperties.length > 0 && (
                              <TouchableOpacity
                                style={styles.taskSiteVisitButton}
                                onPress={() => {
                                  if (taskProperties.length === 1) {
                                    // Single property - directly navigate to Google Maps
                                    const prop = taskProperties[0];
                                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.location)}`);
                                  } else {
                                    // Multiple properties - open site visit map view
                                    setShowMapView(true);
                                  }
                                }}
                              >
                                <MapPin size={16} color="white" />
                                <Text style={styles.taskSiteVisitButtonText}>
                                  {taskProperties.length === 1 ? 'Navigate' : `Visit ${taskProperties.length} Sites`}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.emptyTasksContainer}>
                    <Text style={styles.emptyTasksText}>No tasks yet. Add a task to get started.</Text>
                  </View>
                )}
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
                              `Are you sure you want to start a deal for "${p.title}" with ${customer.name}?\n\nThis will move the customer to In-Process stage.`,
                              [
                                {
                                  text: 'Cancel',
                                  style: 'cancel'
                                },
                                {
                                  text: 'Yes, Start Deal',
                                  onPress: () => {
                                    onStartDeal(customer, p);
                                    if (onUpdateStage) {
                                      onUpdateStage(customer.id, 'In-Process');
                                    }
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
                    styles.visitSitesButton
                  ]}
                  onPress={() => {
                    if (selectedPropertyIds.length === 0) {
                      Alert.alert(
                        'No Properties Selected',
                        'Please select properties to visit from the "Properties to Show" section above.',
                        [{ text: 'OK' }]
                      );
                    } else {
                      setShowMapView(true);
                    }
                  }}
                >
                  <MapPin size={20} color="white" />
                  <Text style={styles.visitSitesButtonText}>Visit Sites ({selectedPropertyIds.length})</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.visitSitesButton}
                onPress={() => {
                  if (selectedPropertyIds.length === 0) {
                    Alert.alert(
                      'No Properties Selected',
                      'Please select properties to visit from the "Properties to Show" section above.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    setShowMapView(true);
                  }
                }}
              >
                <MapPin size={20} color="white" />
                <Text style={styles.visitSitesButtonText}>Visit Sites ({selectedPropertyIds.length})</Text>
              </TouchableOpacity>
            )}

            {/* Floating Add Follow Up Button */}
            <TouchableOpacity
              style={styles.floatingAddButton}
              onPress={() => setShowAddFollowUpModal(true)}
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
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

      {/* Add Follow Up Modal */}
      <AddModal
        isOpen={showAddFollowUpModal}
        onClose={() => setShowAddFollowUpModal(false)}
        type="FollowUp"
        onSave={(taskData) => {
          if (onAddFollowUp) {
            onAddFollowUp(taskData);
          }
          setShowAddFollowUpModal(false);
        }}
        onUpdate={() => { }}
        initialCustomer={customer}
        initialPropertyIds={selectedPropertyIds}
        initialTaskType="Site Visit"
        customers={[customer]}
        properties={properties}
      />
    </Modal>
  );
};

import styles from '../styles/customerDetailStyles';

export default CustomerDetailSheet;