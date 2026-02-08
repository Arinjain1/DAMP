import { MapPin, X, Bell, CheckCircle, Clock } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { updateDeal } from '../src/store/slices/dealsSlice';
import * as Haptics from 'expo-haptics';
import MeetingView from '../src/Views/MeetingView';
import PaymentView from '../src/Views/PaymentView';
import AgreementView from '../src/Views/AgreementView';

export default function DealPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Meeting');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  
  // Custom alert states
  const [showReminderSetAlert, setShowReminderSetAlert] = useState(false);
  const [showMeetingReminderAlert, setShowMeetingReminderAlert] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);

  const { selectedDeal } = useSelector(state => state.deals);
  const { properties } = useSelector(state => state.properties);
  const { customers } = useSelector(state => state.customers);
  const { profile } = useSelector(state => state.auth);

  if (!selectedDeal) {
    router.back();
    return null;
  }

  const property = properties.find(p => p.id === selectedDeal.propertyId);
  const customer = customers.find(c => c.id === selectedDeal.customerId);

  // Get meetings from deal
  const meetings = selectedDeal.meetings || [];

  // Load reminder preference from deal
  useEffect(() => {
    if (selectedDeal.reminderEnabled !== undefined) {
      setReminderEnabled(selectedDeal.reminderEnabled);
    }
  }, [selectedDeal]);

  // Check for upcoming meetings and show reminder with alarm sound
  useEffect(() => {
    if (!reminderEnabled || meetings.length === 0) return;

    const triggerAlarm = async (meeting) => {
      // Trigger vibration pattern
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning), 500);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), 1000);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 1500);
      } catch (error) {
        console.log('Haptics not available:', error);
      }

      // Show custom alert
      setCurrentReminder(meeting);
      setShowMeetingReminderAlert(true);
    };

    const checkReminders = () => {
      const now = new Date();
      meetings.forEach(meeting => {
        if (meeting.status === 'upcoming' && !meeting.reminderShown) {
          const meetingTime = new Date(meeting.date);
          const timeDiff = meetingTime - now;
          const minutesDiff = Math.floor(timeDiff / (1000 * 60));

          // Trigger alarm 30 minutes before meeting
          if (minutesDiff <= 30 && minutesDiff > 29) {
            triggerAlarm(meeting);
            // Mark reminder as shown to avoid repeated alarms
            const updatedMeetings = meetings.map(m =>
              m.id === meeting.id ? { ...m, reminderShown: true } : m
            );
            dispatch(updateDeal({
              ...selectedDeal,
              meetings: updatedMeetings
            }));
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [reminderEnabled, meetings]);

  const handleClose = () => {
    router.back();
  };

  const handleSnoozeReminder = async () => {
    setShowMeetingReminderAlert(false);
    
    if (currentReminder) {
      setTimeout(() => {
        setShowMeetingReminderAlert(true);
      }, 5 * 60 * 1000);
    }
  };

  const handleDismissReminder = async () => {
    setShowMeetingReminderAlert(false);
    setCurrentReminder(null);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const tabs = ['Meeting', 'Payment', 'Agreement'];

  // Get user name and avatar
  const userName = profile?.name || customer?.name || 'User';
  const userAvatar = profile?.avatar;

  const getRandomColor = (char) => {
    const colors = ['#e0f2fe', '#fce7f3', '#dcfce7', '#fef3c7', '#f3e8ff'];
    const textColors = ['#0284c7', '#db2777', '#16a34a', '#d97706', '#9333ea'];
    const index = char.charCodeAt(0) % colors.length;
    return { bg: colors[index], text: textColors[index] };
  };

  const colorTheme = getRandomColor(userName.charAt(0));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Profile and Close Button */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileAvatar, { backgroundColor: colorTheme.bg }]}>
              <Text style={[styles.profileAvatarText, { color: colorTheme.text }]}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.profileName}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={20} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Property Card - Only show in Meeting tab */}
        {activeTab === 'Meeting' && property && (
          <View style={styles.propertyCard}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={{ uri: property.image }} style={styles.propertyImage} />
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle}>{property.title}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={12} color="#6b7280" />
                  <Text style={styles.locationText}>{property.location}</Text>
                </View>
                <Text style={styles.propertyPrice}>₹{property.price?.toLocaleString('en-IN')}</Text>
              </View>
            </View>
            <View style={styles.dealBadge}>
              <Text style={styles.dealBadgeText}>DEAL STARTED</Text>
            </View>
          </View>
        )}

        {/* Tab Content - Render different views based on active tab */}
        {activeTab === 'Meeting' && (
          <MeetingView 
            selectedDeal={selectedDeal}
            reminderEnabled={reminderEnabled}
            setReminderEnabled={setReminderEnabled}
            setShowReminderSetAlert={setShowReminderSetAlert}
          />
        )}
        
        {activeTab === 'Payment' && <PaymentView />}
        
        {activeTab === 'Agreement' && <AgreementView />}
      </ScrollView>

      {/* Custom Reminder Set Alert */}
      <Modal
        visible={showReminderSetAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReminderSetAlert(false)}
      >
        <View style={styles.customAlertOverlay}>
          <View style={styles.customAlertContainer}>
            <View style={styles.customAlertIconContainer}>
              <View style={styles.customAlertSuccessIcon}>
                <CheckCircle size={48} color="#10b981" />
              </View>
            </View>
            <Text style={styles.customAlertTitle}>Reminder Set</Text>
            <Text style={styles.customAlertMessage}>
              You will receive a notification 30 minutes before each upcoming meeting.
            </Text>
            <TouchableOpacity
              style={styles.customAlertButton}
              onPress={() => setShowReminderSetAlert(false)}
            >
              <Text style={styles.customAlertButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Meeting Reminder Alert */}
      <Modal
        visible={showMeetingReminderAlert}
        transparent
        animationType="fade"
        onRequestClose={handleDismissReminder}
      >
        <View style={styles.customAlertOverlay}>
          <View style={[styles.customAlertContainer, styles.reminderAlertContainer]}>
            <View style={styles.customAlertIconContainer}>
              <View style={styles.customAlertWarningIcon}>
                <Bell size={48} color="#f59e0b" />
              </View>
            </View>
            <Text style={styles.customAlertTitle}>🚨 MEETING REMINDER</Text>
            <Text style={styles.customAlertSubtitle}>
              Your meeting is starting in 30 minutes!
            </Text>
            {currentReminder && (
              <View style={styles.reminderDetailsCard}>
                <View style={styles.reminderDetailRow}>
                  <Text style={styles.reminderDetailLabel}>Meeting:</Text>
                  <Text style={styles.reminderDetailValue}>{currentReminder.title}</Text>
                </View>
                <View style={styles.reminderDetailRow}>
                  <Clock size={16} color="#6b7280" />
                  <Text style={styles.reminderDetailValue}>{formatTime(currentReminder.date)}</Text>
                </View>
                <Text style={styles.reminderPrepareText}>Please prepare for the meeting.</Text>
              </View>
            )}
            <View style={styles.customAlertButtonGroup}>
              <TouchableOpacity
                style={styles.customAlertSecondaryButton}
                onPress={handleSnoozeReminder}
              >
                <Clock size={18} color="#6b7280" />
                <Text style={styles.customAlertSecondaryButtonText}>Snooze (5 min)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customAlertPrimaryButton}
                onPress={handleDismissReminder}
              >
                <Text style={styles.customAlertPrimaryButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 16 : 64,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 30,
    marginTop: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F4F7FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#000000',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  // Property Card
  propertyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  propertyImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  dealBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dealBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  // Schedule
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    left: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#BFB7FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9A8CFC',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#ffffff',
  },
  // Schedule List
  scheduleList: {
    gap: 12,
    marginBottom: 24,
  },
  scheduleItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedItem: {
    backgroundColor: '#f9fafb',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  completedText: {
    color: '#6b7280',
  },
  scheduleTime: {
    fontSize: 13,
    color: '#9ca3af',
  },
  statusBadgeContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  upcomingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d97706',
  },
  markDoneButton: {
    paddingVertical: 2,
  },
  markDoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
  // Reminder - Fixed at bottom
  reminderCardFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
  },
  reminderCardInner: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  reminderSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  // Empty State
  emptySchedule: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1f2937',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  dateTimeText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#9A8CFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Custom Alert Styles
  customAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  customAlertContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  reminderAlertContainer: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  customAlertIconContainer: {
    marginBottom: 20,
  },
  customAlertSuccessIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAlertWarningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAlertTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  customAlertSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  customAlertMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  reminderDetailsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reminderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  reminderDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  reminderDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  reminderPrepareText: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
  },
  customAlertButton: {
    backgroundColor: '#9A8CFC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  customAlertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  customAlertButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  customAlertPrimaryButton: {
    backgroundColor: '#9A8CFC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
  },
  customAlertPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  customAlertSecondaryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  customAlertSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Payment Tab Styles
  amountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  remainingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionGridButton: {
    width: '22%',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: {
    fontSize: 24,
    color: '#3E3E3E',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3E3E3E',
    textAlign: 'center',
  },
  priceInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  priceInputGroup: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3E3E3E',
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#C4B5FD',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
