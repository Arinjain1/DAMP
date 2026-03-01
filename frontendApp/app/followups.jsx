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
import { useState, useEffect, useCallback } from 'react';
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl
} from 'react-native';
import { showToast } from '@/src/utils/toast';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Components
import WhatsAppIcon from '@/src/Components/WhatsAppIcon';
import AddModal from '@/src/Modal and Sheets/AddModal';
import SiteVisitMapModal from '@/src/Modal and Sheets/SiteVisitMapModal';
import { clearEditItem, setEditItem, setModalOpen, setModalType } from '@/src/store/slices/uiSlice';
import {
  setFollowUps,
  deleteFollowUp,
  setActiveSiteVisit,
  updateFollowUp,
  updateFollowUpStatus,
  setLoading
} from '../src/store/slices/followUpsSlice';
import { updateCustomer } from '../src/store/slices/customersSlice';
import { tasksAPI, visitsAPI } from '../src/config/api';

// Helper for generating IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

export default function FollowUps() {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('Pending'); // Default is Pending
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
  const [siteVisitCustomer, setSiteVisitCustomer] = useState(null);
  const [siteVisitProperties, setSiteVisitProperties] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Redux state
  const { followUps, activeSiteVisit, loading } = useSelector(state => state.followUps);
  const { customers } = useSelector(state => state.customers);
  const { properties } = useSelector(state => state.properties);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth); // Get logged-in user

  // Fetch tasks from backend on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Refresh tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const fetchTasks = async () => {
    try {
      dispatch(setLoading(true));
      const response = await tasksAPI.getAll({ status: 'All' });

      if (response.data.success) {
        // Transform backend data to frontend format
        const transformedTasks = response.data.data.map(task => {
          // For site visits, use site_visit_properties array
          let propertyIds = [];
          if (task.site_visit_properties && Array.isArray(task.site_visit_properties)) {
            propertyIds = task.site_visit_properties.map(p => p.property_id);
          } else if (task.property_id) {
            propertyIds = [task.property_id];
          }

          return {
            id: task.id,
            customerId: task.client_id,
            // Fallback for client name if redux lookup fails
            clientNameFallback: task.client?.name || task.client?.full_name || task.client_name,
            propertyIds: propertyIds,
            type: task.task_type || 'Meeting',
            date: task.due_date,
            note: task.description || '',
            status: task.status === 'completed' ? 'Done' : 'Pending',
            siteVisitId: task.site_visit_id,
            propertyCount: task.site_visit_property_count || 0,
            siteVisitProperties: task.site_visit_properties || []
          };
        });
        dispatch(setFollowUps(transformedTasks));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast.error('Failed to load tasks');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };



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
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone, task, customer) => {
    if (!phone) return;

    // Get broker name
    const brokerName = user?.name || user?.full_name || 'Your Property Broker';

    // Create pre-filled message based on task type
    const date = new Date(task.date);
    const formattedDate = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    let message = '';
    const nameToUse = customer?.name || customer?.full_name || task.clientNameFallback || 'there';

    if (task.type === 'Site Visit' || task.type === 'Visit') {
      message = `Hi ${nameToUse},\n\nThis is a reminder for your property site visit scheduled on ${formattedDate} at ${formattedTime}.\n\nLooking forward to showing you the properties!\n\nBest regards,\n${brokerName}`;
    } else if (task.type === 'Meeting') {
      message = `Hi ${nameToUse},\n\nReminder: We have a meeting scheduled on ${formattedDate} at ${formattedTime}.\n\n${task.note ? `Agenda: ${task.note}\n\n` : ''}See you soon!\n\nBest regards,\n${brokerName}`;
    } else if (task.type === 'Follow-up' || task.type === 'Call') {
      message = `Hi ${nameToUse},\n\nJust following up on our previous discussion about the property.\n\n${task.note ? `Note: ${task.note}\n\n` : ''}Feel free to reach out if you have any questions!\n\nBest regards,\n${brokerName}`;
    } else {
      // Generic message for other task types
      message = `Hi ${nameToUse},\n\nReminder for: ${task.type}\nScheduled: ${formattedDate} at ${formattedTime}\n\n${task.note ? `${task.note}\n\n` : ''}Best regards,\n${brokerName}`;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Clean phone number and add +91 if not present
    let cleanPhone = phone.replace(/[^0-9]/g, '');

    // Add +91 if number doesn't start with 91 and is 10 digits
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    } else if (!cleanPhone.startsWith('91') && cleanPhone.length > 10) {
      cleanPhone = '91' + cleanPhone;
    }

    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodedMessage}`);
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      const response = await tasksAPI.toggleStatus(taskId);

      if (response.data.success) {
        dispatch(updateFollowUpStatus({ id: taskId, status }));
        showToast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showToast.error('Failed to update task status');
    }
  };

  const handleStartVisit = async (visitData) => {
    // If site visit already exists, fetch details
    if (visitData.siteVisitId) {
      try {
        const response = await visitsAPI.getById(visitData.siteVisitId);
        if (response.data.success) {
          const visitProperties = response.data.data.map(item => ({
            ...properties.find(p => p.id === item.property_id),
            visitItemId: item.item_id,
            visitStatus: item.visit_status,
            outcome: item.outcome
          }));

          setSiteVisitCustomer(visitData.customer);
          setSiteVisitProperties(visitProperties);
          setShowSiteVisitModal(true);
        }
      } catch (error) {
        console.error('Error fetching visit details:', error);
        showToast.error('Failed to load site visit details');
      }
    } else {
      // Open Site Visit Map Modal with properties
      const { customer, properties: visitProps } = visitData;
      setSiteVisitCustomer(customer);
      setSiteVisitProperties(visitProps);
      setShowSiteVisitModal(true);
    }
  };

  const handleDeleteTask = (taskId) => {
    dispatch(deleteFollowUp(taskId));
  };

  const handleFABClick = () => {

    dispatch(clearEditItem());
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));

  };

  const handleEditTask = (task) => {
    dispatch(setEditItem(task));
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
  };

  const handleAdd = async (data) => {
    try {
      dispatch(setLoading(true));

      // Check if it's a site visit with multiple properties
      if ((data.type === 'Site Visit' || data.type === 'Visit') && data.propertyIds?.length > 0) {
        // Create site visit (this will also create task in backend)
        const visitResponse = await visitsAPI.create({
          client_id: data.customerId,
          property_ids: data.propertyIds,
          scheduled_date: data.date.split('T')[0],
          scheduled_time: data.date.split('T')[1]?.substring(0, 5) || '10:00'
        });

        if (visitResponse.data.success) {
          showToast.success('Site visit scheduled!');
          await fetchTasks(); // Refresh tasks
        }
      } else {
        // Create regular task
        const taskResponse = await tasksAPI.create({
          client_id: data.customerId,
          property_id: data.propertyIds?.[0] || null,
          task_type: data.type || 'Meeting',
          schedule_date: data.date.split('T')[0],
          schedule_time: data.date.split('T')[1]?.substring(0, 5) || '10:00',
          notes: data.note || ''
        });

        if (taskResponse.data.success) {
          showToast.success('Task created!');
          await fetchTasks(); // Refresh tasks
        }
      }

      dispatch(setModalOpen(false));
    } catch (error) {
      console.error('Error creating task:', error);
      showToast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleUpdate = async (updatedItem) => {
    try {
      dispatch(setLoading(true));

      // Prepare data for API
      const updateData = {
        client_id: updatedItem.clientId,
        property_id: updatedItem.propertyIds?.[0] || null,
        task_type: updatedItem.type || updatedItem.task_type,
        schedule_date: updatedItem.date?.split('T')[0] || updatedItem.due_date?.split('T')[0],
        schedule_time: updatedItem.date?.split('T')[1]?.substring(0, 5) || updatedItem.due_date?.split('T')[1]?.substring(0, 5) || '10:00',
        notes: updatedItem.note || updatedItem.description || '',
        title: updatedItem.title
      };

      const response = await tasksAPI.update(updatedItem.id, updateData);

      if (response.data.success) {
        showToast.success('Task updated successfully!');
        await fetchTasks(); // Refresh tasks
        dispatch(clearEditItem());
        dispatch(setModalOpen(false));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showToast.error(error.response?.data?.message || 'Failed to update task');
    } finally {
      dispatch(setLoading(false));
    }
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.timelineHeader}>
            <Text style={styles.colHeaderTime}>Time</Text>
            <Text style={styles.colHeaderTask}>Tasks</Text>
          </View>

          {/* Continuous Vertical Line */}
          <View style={styles.timelineContainer}>
            <View style={styles.continuousVerticalLine} />

            {loading ? (
              // Skeleton Loader
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View key={i} style={styles.timelineRow}>
                    {/* Time Column Skeleton */}
                    <View style={styles.timeCol}>
                      <View style={styles.skeletonTime} />
                    </View>

                    {/* Task Card Skeleton */}
                    <View style={[styles.card, styles.cardWhite]}>
                      <View style={styles.cardHeader}>
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonActions} />
                      </View>
                      <View style={styles.skeletonCustomerName} />
                      <View style={styles.skeletonInfoRow} />
                      <View style={styles.skeletonInfoRow} />
                      <View style={styles.skeletonNote} />
                      <View style={styles.skeletonActionButtons}>
                        <View style={styles.skeletonButton} />
                        <View style={styles.skeletonButton} />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : filteredTasks.length > 0 ? filteredTasks.map((task, index) => {
              // FIXED: Convert IDs to strings for robust matching
              const customer = customers.find(c => String(c.id) === String(task.customerId));

              // FIXED: Added robust fallback logic for displaying customer name
              const displayCustomerName = customer?.name || customer?.full_name || task.clientNameFallback || 'Unknown Customer';

              // Support both single propertyId (old) and propertyIds array (new)
              const taskPropertyIds = task.propertyIds || (task.propertyId ? [task.propertyId] : []);
              const taskProperties = properties.filter(p => taskPropertyIds.includes(p.id));
              const firstProperty = taskProperties[0]; // For backward compatibility
              const date = new Date(task.date);

              // Logic: Only first card in Pending is purple, all others (including all Done cards) are grey/white
              const isFirst = index === 0;
              const isPendingFirst = filter === 'Pending' && isFirst;
              const cardStyle = isPendingFirst ? styles.cardPurple : styles.cardWhite;
              const textPrimary = isPendingFirst ? '#374151' : '#1f2937'; // Dark grey for purple card
              const textSecondary = isPendingFirst ? '#4b5563' : '#6b7280'; // Darker grey for purple card
              const iconColor = isPendingFirst ? '#6b7280' : '#9ca3af'; // Dark grey icons for purple card

              return (
                <View key={task.id} style={styles.timelineRow}>
                  {/* Time Column */}
                  <View style={styles.timeCol}>
                    <Text style={styles.startTime}>
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
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
                          <Trash2 size={14} color={isPendingFirst ? '#dc2626' : '#ef4444'} />
                        </TouchableOpacity>
                        {filter !== 'Done' && (
                          <TouchableOpacity onPress={() => handleUpdateStatus(task.id, 'Done')}>
                            <CheckCircle size={16} color={isPendingFirst ? '#059669' : '#10b981'} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Customer Name */}
                    <Text style={[styles.customerName, { color: textPrimary }]} numberOfLines={1}>
                      {displayCustomerName}
                    </Text>

                    {/* Properties List */}
                    {taskProperties.length > 0 && (
                      <View>
                        {/* Show first property */}
                        <View>
                          <View style={styles.infoRow}>
                            <Home size={12} color={iconColor} />
                            <Text style={[styles.infoText, { color: textSecondary }]} numberOfLines={1}>
                              {taskProperties[0].title}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            <MapPin size={12} color={iconColor} />
                            <Text style={[styles.infoText, { color: textSecondary }]} numberOfLines={1}>
                              {taskProperties[0].location || 'No location set'}
                            </Text>
                          </View>
                        </View>
                        {/* Show "Show More" if multiple properties */}
                        {taskProperties.length > 1 && (
                          <Text style={[styles.showMoreText, { color: textSecondary }]}>
                            +{taskProperties.length - 1} more {taskProperties.length - 1 === 1 ? 'property' : 'properties'}
                          </Text>
                        )}
                      </View>
                    )}

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
                      {isPendingFirst ? (
                        // Purple card actions based on task type
                        (task.type === 'Site Visit' || task.type === 'Visit') ? (
                          <>
                            <TouchableOpacity
                              onPress={() => {
                                if (taskProperties.length === 1) {
                                  // Single property - directly navigate to Google Maps
                                  const prop = taskProperties[0];
                                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.location)}`);
                                } else {
                                  // Multiple properties - start site visit flow
                                  handleStartVisit({
                                    id: generateId(),
                                    customer,
                                    properties: taskProperties,
                                    taskId: task.id
                                  });
                                }
                              }}
                              style={styles.startVisitButton}
                            >
                              <Map size={12} color="#fbbf24" />
                              <Text style={styles.startVisitText}>
                                {taskProperties.length === 1 ? 'Navigate' : `Visit ${taskProperties.length} Sites`}
                              </Text>
                            </TouchableOpacity>
                            <View style={[styles.contactButtonsRow, { marginTop: 8 }]}>
                              <TouchableOpacity onPress={() => handleCall(customer?.phone)} style={styles.miniBtn}>
                                <Phone size={12} color="#4b5563" />
                                <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Call</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleWhatsApp(customer?.phone, task, customer)} style={styles.miniBtn}>
                                <WhatsAppIcon size={12} color="#4b5563" />
                                <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Msg</Text>
                              </TouchableOpacity>
                            </View>
                          </>
                        ) : (
                          // For Meeting, Call, Follow-up etc. - show Call & Msg buttons
                          <View style={styles.contactButtonsRow}>
                            <TouchableOpacity onPress={() => handleCall(customer?.phone)} style={styles.miniBtn}>
                              <Phone size={12} color="#4b5563" />
                              <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleWhatsApp(customer?.phone, task, customer)} style={styles.miniBtn}>
                              <WhatsAppIcon size={12} color="#4b5563" />
                              <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Msg</Text>
                            </TouchableOpacity>
                          </View>
                        )
                      ) : (
                        // Non-purple cards (white cards)
                        (task.type === 'Site Visit' || task.type === 'Visit') && filter === 'Pending' && taskProperties.length > 0 ? (
                          <View>
                            <TouchableOpacity
                              onPress={() => {
                                if (taskProperties.length === 1) {
                                  // Single property - directly navigate to Google Maps
                                  const prop = taskProperties[0];
                                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.location)}`);
                                } else {
                                  // Multiple properties - start site visit flow
                                  handleStartVisit({
                                    id: generateId(),
                                    customer,
                                    properties: taskProperties,
                                    taskId: task.id
                                  });
                                }
                              }}
                              style={styles.startVisitButton}
                            >
                              <Map size={12} color="#fbbf24" />
                              <Text style={styles.startVisitText}>
                                {taskProperties.length === 1 ? 'Navigate' : `Visit ${taskProperties.length} Sites`}
                              </Text>
                            </TouchableOpacity>
                            <View style={[styles.contactButtonsRow, { marginTop: 8 }]}>
                              <TouchableOpacity onPress={() => handleCall(customer?.phone)} style={styles.miniBtn}>
                                <Phone size={12} color="#4b5563" />
                                <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Call</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleWhatsApp(customer?.phone, task, customer)} style={styles.miniBtn}>
                                <WhatsAppIcon size={12} color="#4b5563" />
                                <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Msg</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : filter === 'Pending' ? (
                          <View style={styles.contactButtonsRow}>
                            <TouchableOpacity onPress={() => handleCall(customer?.phone)} style={styles.miniBtn}>
                              <Phone size={12} color="#4b5563" />
                              <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleWhatsApp(customer?.phone, task, customer)} style={styles.miniBtn}>
                              <WhatsAppIcon size={12} color="#4b5563" />
                              <Text style={[styles.miniBtnText, { color: '#4b5563' }]}>Msg</Text>
                            </TouchableOpacity>
                          </View>
                        ) : null
                      )}
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

      {/* Site Visit Map Modal */}
      <SiteVisitMapModal
        visible={showSiteVisitModal}
        onClose={() => {
          setShowSiteVisitModal(false);
          setSiteVisitCustomer(null);
          setSiteVisitProperties([]);
        }}
        properties={siteVisitProperties}
        customer={siteVisitCustomer}
        onPropertyInterested={(propId) => {
          // Handle interested property
          if (siteVisitCustomer) {
            const updatedCustomer = {
              ...siteVisitCustomer,
              interestedProperties: [...(siteVisitCustomer.interestedProperties || []), propId],
              selectedProperties: (siteVisitCustomer.selectedProperties || []).filter(id => id !== propId)
            };
            dispatch(updateCustomer(updatedCustomer));
            setSiteVisitCustomer(updatedCustomer);

            // Remove from visit properties
            setSiteVisitProperties(prev => prev.filter(p => p.id !== propId));
          }
        }}
        onPropertyNotInterested={(propId) => {
          // Remove property from list
          setSiteVisitProperties(prev => prev.filter(p => p.id !== propId));

          if (siteVisitCustomer) {
            const updatedCustomer = {
              ...siteVisitCustomer,
              selectedProperties: (siteVisitCustomer.selectedProperties || []).filter(id => id !== propId)
            };
            dispatch(updateCustomer(updatedCustomer));
            setSiteVisitCustomer(updatedCustomer);
          }
        }}
        onPropertyHold={(propId) => {
          // Add to hold properties
          if (siteVisitCustomer) {
            const updatedCustomer = {
              ...siteVisitCustomer,
              holdProperties: [...(siteVisitCustomer.holdProperties || []), propId]
            };
            dispatch(updateCustomer(updatedCustomer));
            setSiteVisitCustomer(updatedCustomer);
          }
        }}
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
    fontSize: 15,
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
    fontSize: 12,
    fontWeight: '100',
    flex: 1,
  },
  showMoreText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 18,
    marginTop: 2,
    fontStyle: 'italic',
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
    borderColor: 'rgba(0,0,0,0.05)', // Same as partition border color
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

  // --- SKELETON LOADER STYLES ---
  skeletonTime: {
    width: 40,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonTitle: {
    width: 80,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonActions: {
    width: 60,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonCustomerName: {
    width: 120,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 8,
  },
  skeletonInfoRow: {
    width: '90%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 6,
  },
  skeletonNote: {
    width: '100%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 8,
  },
  skeletonActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  skeletonButton: {
    flex: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
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