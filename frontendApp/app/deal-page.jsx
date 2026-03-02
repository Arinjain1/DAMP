import { MapPin, X, Bell, CheckCircle, Clock } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { updateDeal } from '../src/store/slices/dealsSlice';
import { completeAgreement } from '../src/store/slices/customersSlice';
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

  const handleMarkAgreementDone = async () => {
    if (customer && customer.stage === 'In-Process') {
      // Trigger haptic feedback
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
      }

      // Dispatch action to complete agreement
      dispatch(completeAgreement(customer.id));


    }
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

        {activeTab === 'Agreement' && <AgreementView onMarkAgreementDone={handleMarkAgreementDone} />}
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
import styles from '../src/styles/dealPageStyles';
