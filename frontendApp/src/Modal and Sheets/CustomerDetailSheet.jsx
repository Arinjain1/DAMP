import {
  Clock,
  Plus,
  MapPin,
  ChevronRight,
  CircleCheckBig
} from 'lucide-react-native';
import CustomerHeader from '../Components/CustomerHeader';
import StageIndicator from '../Components/CustomerDetailComponents/StageIndicator';
import PropertyListItem from '../Components/CustomerDetailComponents/PropertyListItem';
import PropertyCard from '../Components/PropertyCard';
import PropertyPickerModal from '../Components/PropertyPickerModal';
import NextStepCard from '../Components/NextStepCard';
import ContactCard from '../Components/ContactCard';
import TaskCard from '../Components/CustomerDetailComponents/TaskCard';
import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Image } from 'expo-image';
import {
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import AddModal from './AddModal';
import SiteVisitMapModal from './SiteVisitMapModal';
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

// StageIndicator component is now imported

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const CustomerDetailSheet = ({ customer, onClose, properties = [], onAddFollowUp, onStartDeal, onOpenDeal, onEditTask, onDeleteTask, onUpdateStage, onSelectProperties, openMapView = false }) => {
  // Get followUps and deals directly from Redux for real-time updates
  const followUps = useSelector((state) => state.followUps.followUps);
  const activeDeals = useSelector((state) => state.deals.deals);
  
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState(customer.selectedProperties || []);
  const [interestedPropertyIds, setInterestedPropertyIds] = useState(customer.interestedProperties || []);
  const [holdPropertyIds, setHoldPropertyIds] = useState(customer.holdProperties || []);
  const [showMapView, setShowMapView] = useState(openMapView);
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [isPropertyExpanded, setIsPropertyExpanded] = useState(openMapView);
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stageUpdating, setStageUpdating] = useState(false);

  // Fetch customer details on mount to get latest property selections
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customer?.id) return;

      try {
        setLoading(true);
        const response = await customersAPI.getById(customer.id);

        if (response.data.success) {
          const customerData = response.data.data.profile || response.data.data;

          // Update state with fetched data - handle both array and JSON string formats
          const parsePropertyArray = (data) => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            if (typeof data === 'string') {
              try {
                return JSON.parse(data);
              } catch (e) {
                return [];
              }
            }
            return [];
          };

          setSelectedPropertyIds(parsePropertyArray(customerData.selected_properties || customerData.selectedProperties));
          setInterestedPropertyIds(parsePropertyArray(customerData.interested_properties || customerData.interestedProperties));
          setHoldPropertyIds(parsePropertyArray(customerData.hold_properties || customerData.holdProperties));
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
        // Keep using props data if fetch fails
        setSelectedPropertyIds(customer.selectedProperties || []);
        setInterestedPropertyIds(customer.interestedProperties || []);
        setHoldPropertyIds(customer.holdProperties || []);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customer?.id, customer.selectedProperties, customer.interestedProperties, customer.holdProperties]);

  const handleOpenPropertyPicker = useCallback(() => {
    setShowPropertyPicker(true);
  }, []);

  const handleTaskNavigateMultiple = useCallback((task) => {
    setShowMapView(true);
  }, []);

  const currentStageIndex = SALES_STAGES.findIndex(s => s.id === (customer.stage || 'New'));
  const nextStage = currentStageIndex < SALES_STAGES.length - 1 ? SALES_STAGES[currentStageIndex + 1] : null;

  const showNextStepCard = nextStage && (customer.stage === 'New' || customer.stage === 'Contacted');

  const handleProceedToNextStage = useCallback(async () => {
    if (nextStage && onUpdateStage) {
      try {
        setStageUpdating(true);
        await onUpdateStage(customer.id, nextStage.id);
        showToast.success(`Moved to ${nextStage.label} stage!`);
      } catch (error) {
        console.error('Error updating stage:', error);
        showToast.error('Failed to update stage');
      } finally {
        setStageUpdating(false);
      }
    }
  }, [customer.id, nextStage, onUpdateStage]);

  const handleToggleProperty = useCallback(async (propertyId) => {
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
  }, [customer.id, selectedPropertyIds, onSelectProperties]);

  const customerTasks = useMemo(() => {
    return followUps.filter(f => f.customerId === customer.id);
  }, [followUps, customer.id]);

  const customerDeals = useMemo(() => {
    return activeDeals.filter(d => d.customerId === customer.id);
  }, [activeDeals, customer.id]);

  const dealtPropertyIds = useMemo(() => {
    return customerDeals.map(d => d.propertyId);
  }, [customerDeals]);

  const propertiesToShow = useMemo(() => {
    return customer.stage === 'Interested'
      ? interestedPropertyIds.filter(id => !holdPropertyIds.includes(id))
      : selectedPropertyIds.filter(id => !holdPropertyIds.includes(id));
  }, [customer.stage, interestedPropertyIds, selectedPropertyIds, holdPropertyIds]);

  const handlePropertyInterested = useCallback(async (propertyId) => {
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

      // Only remove property from selectedProperties after feedback, not after adding a task
      // If feedback is submitted (interested), remove property
      if (true) { // Feedback context only
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
      }
    } catch (error) {
      console.error('Error submitting interested feedback:', error);
      showToast.error('Failed to submit feedback. Please try again.');
    }
  }, [customer.id, customerTasks, interestedPropertyIds, selectedPropertyIds, onSelectProperties, currentPropertyIndex]);

  const handlePropertyNotInterested = useCallback(async (propertyId) => {
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

      // Only remove property from selectedProperties after feedback, not after adding a task
      // If feedback is submitted (not interested), remove property
      if (true) { // Feedback context only
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
      }
    } catch (error) {
      console.error('Error submitting not interested feedback:', error);
      showToast.error('Failed to submit feedback. Please try again.');
    }
  }, [customer.id, customerTasks, selectedPropertyIds, interestedPropertyIds, onSelectProperties, currentPropertyIndex]);

  const handlePropertyHold = useCallback(async (propertyId) => {
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
  }, [customer.id, customerTasks, holdPropertyIds, selectedPropertyIds, interestedPropertyIds, onSelectProperties]);

  if (!customer) return null;

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
          <CustomerHeader name={customer.name} phone={customer.phone} onClose={onClose} />

          {/* Stage Indicator */}
          <StageIndicator currentStage={customer.stage || 'New'} loading={loading} />

          {/* Main Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >

            {/* --- UPDATED NEXT STEP CARD (Vertical Layout + Full Width Button) --- */}
            {showNextStepCard && (
              <NextStepCard
                nextStage={nextStage}
                customer={customer}
                selectedPropertyIds={selectedPropertyIds}
                onProceed={handleProceedToNextStage}
                loading={stageUpdating}
                styles={styles}
              />
            )}

            {/* Customer Contact Card - Show only for New stage */}
            {customer.stage === 'New' && (
              <ContactCard
                customer={customer}
                styles={styles}
              />
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
                    {selectedPropertyIds.map(id => {
                      const item = properties.find(p => p.id === id);
                      return item ? (
                        <PropertyListItem key={item.id} prop={item} onRemove={handleToggleProperty} />
                      ) : null;
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
                        <PropertyCard
                          key={prop.id}
                          property={prop}
                          customer={customer}
                          hasDeal={hasDeal}
                          onStartDeal={onStartDeal}
                          onUpdateStage={onUpdateStage}
                          onOpenDeal={onOpenDeal}
                          styles={styles}
                        />
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
                    // const hasDeal = dealtPropertyIds.includes(prop.id); // Removed unused variable

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
                            {!dealtPropertyIds.includes(prop.id) ? (
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
                    // Inline check used above

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
                    {customerTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        properties={properties}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onNavigateMultiple={handleTaskNavigateMultiple}
                      />
                    ))}
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
          <PropertyPickerModal
            visible={showPropertyPicker}
            customer={customer}
            properties={properties}
            selectedPropertyIds={selectedPropertyIds}
            dealtPropertyIds={dealtPropertyIds}
            onClose={() => setShowPropertyPicker(false)}
            onToggleProperty={handleToggleProperty}
            onStartDeal={onStartDeal}
            onUpdateStage={onUpdateStage}
            styles={styles}
          />

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
        <SiteVisitMapModal
          visible={showMapView}
          onClose={() => {
            setShowMapView(false);
            setIsPropertyExpanded(false);
          }}
          properties={properties.filter(p => selectedPropertyIds.includes(p.id))}
          customer={customer}
          onPropertyInterested={handlePropertyInterested}
          onPropertyNotInterested={handlePropertyNotInterested}
          onPropertyHold={handlePropertyHold}
        />
      )}

      {/* Add Follow Up Modal */}
      <AddModal
        isOpen={showAddFollowUpModal}
        onClose={() => setShowAddFollowUpModal(false)}
        type="FollowUp"
        onSave={(taskData) => {
          if (onAddFollowUp) {
            // Generate unique ID for the task
            const taskWithId = {
              ...taskData,
              id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              customerId: customer.id,
              customerName: customer.name,
            };
            onAddFollowUp(taskWithId);
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
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  addTaskHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#9f95f2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addTaskHeaderButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',

  },
  listContainer: {
    gap: 8,
    paddingBottom: 12,
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
    padding: 14,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //marginBottom: 10,
  },
  taskTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,

  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  taskNote: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 18,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
    gap: 10,
  },
  taskDate: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  taskProperty: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 3,
  },
  taskSiteVisitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#9f95f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexShrink: 0,
  },
  taskSiteVisitButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  emptyTasksContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTasksText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
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
    marginLeft: 6,
  },
  searchContainer: {
    marginTop: 20,
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
    fontFamily: 'Lato_700Bold',
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
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 13,
    fontFamily: 'Lato_400Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default memo(CustomerDetailSheet);