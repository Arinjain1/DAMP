import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSelector, useDispatch } from 'react-redux';
import { homeCardMetrics } from '../mockdata/homeStats';
import { updateMeetingStatus } from '../redux/slices/meetingsSlice';
import { toggleTaskComplete } from '../redux/slices/tasksSlice';
import { activeDealsMockData } from '../mockdata/activeDealsData';

const avatarImg = require('../../assets/Profile Avatar with Memoji.png');
const bgGraphic = require('../../assets/SVG - Background Abstract Topographic Lines Graphic.png');
const headerPhoto = require('../../assets/headerphoto.png');
const followUpImg = require('../../assets/follow-up.png');
const dealManagerImg = require('../../assets/deal-manager.png');
const collabImg = require('../../assets/collab.png');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const leads = useSelector((state) => state.crm.leads);
  const properties = useSelector((state) => state.inventory.properties);
  const tasks = useSelector((state) => state.tasks.tasks);
  const todayMeetings = useSelector((state) => state.meetings.todayMeetings);
  const activeDeals = activeDealsMockData;

  // Selected meeting for detail modal
  const [activeMeetingModal, setActiveMeetingModal] = useState(null);

  // Filter Segment state: Visitors, Total Sale, Collab, Pending
  const [activeSegment, setActiveSegment] = useState('Visitors');
  // Time period filter inside card: Today, 1 week, 1 month
  const [timeFilter, setTimeFilter] = useState('Today');

  // Compute current metric and stat value from mock data
  const currentMetric = homeCardMetrics[activeSegment] || homeCardMetrics['Visitors'];
  const currentStatValue = currentMetric.stats[timeFilter] || currentMetric.stats['Today'];

  const pendingTasks = tasks.filter((t) => !t.completed).length;

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Bar with Profile Avatar, Welcome, and Notification Bell */}
          <View style={styles.topBar}>
            <View style={styles.profileSection}>
              <View style={styles.avatarCircle}>
                <Image source={avatarImg} style={styles.avatarImage} resizeMode="cover" />
              </View>
              <View style={styles.welcomeTextGroup}>
                <Text style={styles.welcomeSub}>Welcome,</Text>
                <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bellBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Action')}
            >
              <Ionicons name="notifications-outline" size={26} color="#FFFFFF" />
              <View style={styles.redBadge}>
                <Text style={styles.redBadgeText}>12</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Segmented Filter Bar: Visitors, Total Sale, Collab, Pending */}
          <View style={styles.segmentedContainer}>
            {['Visitors', 'Total Sale', 'Collab', 'Pending'].map((tab) => {
              const isActive = activeSegment === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                  onPress={() => setActiveSegment(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Banner Card: 10E8A0 background with SVG on right, headerphoto, and stats */}
          <View style={styles.bannerCard}>
            {/* Background topographic graphic on the right */}
            <Image source={bgGraphic} style={styles.cardBgGraphic} resizeMode="cover" />

            {/* Illustration of two people on the right side */}
            <Image source={headerPhoto} style={styles.cardHeaderPhoto} resizeMode="contain" />

            {/* Left Content inside the card */}
            <View style={styles.cardLeftContent}>
              <TouchableOpacity
                style={styles.cardTitleRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(currentMetric.targetRoute || 'CRM')}
              >
                <Text style={styles.cardTitle}>{currentMetric.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#0C3E2D" />
              </TouchableOpacity>

              <Text
                style={styles.cardStatNumber}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {currentStatValue}
              </Text>

              {/* Time filter buttons: Today, 1 week, 1 month */}
              <View style={styles.timeFilterRow}>
                {['Today', '1 week', '1 month'].map((period) => {
                  const isSelected = timeFilter === period;
                  return (
                    <TouchableOpacity
                      key={period}
                      style={[styles.timePill, isSelected && styles.timePillActive]}
                      onPress={() => setTimeFilter(period)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.timePillText, isSelected && styles.timePillTextActive]}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Quick Action Icons: Add Prop, New Lead, Deals, Collaboration */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Inventory')}
            >
              <View style={styles.actionCircle}>
                <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Add Prop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CRM')}
            >
              <View style={styles.actionCircle}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>New Lead</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Action')}
            >
              <View style={styles.actionCircle}>
                <Ionicons name="arrow-up-circle-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Deals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CRM')}
            >
              <View style={styles.collabCapsule}>
                <Ionicons name="grid-outline" size={22} color="#FFFFFF" />
                <View style={styles.collabBadge}>
                  <Text style={styles.collabBadgeText}>12</Text>
                </View>
              </View>
              <Text style={styles.actionLabel}>Collaboration</Text>
            </TouchableOpacity>
          </View>

          {/* Lower Curved White Sheet with Today Meeting & Recent Properties */}
          <View style={styles.lowerSheet}>
            <View style={styles.dragHandle} />

            {/* Today Meeting Header Row */}
            <View style={styles.meetingHeaderRow}>
              <View style={styles.meetingTitleGroup}>
                <View style={styles.meetingTitleWithBadge}>
                  <Text style={styles.meetingSectionTitle}>Today Meeting</Text>
                  <View style={styles.meetingBadge}>
                    <Text style={styles.meetingBadgeText}>{todayMeetings.length}</Text>
                  </View>
                </View>
                <Text style={styles.meetingSubtitle}>Your schedule for the day</Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('Action')}
                activeOpacity={0.7}
              >
                <Text style={styles.meetingViewAllText}>View all</Text>
              </TouchableOpacity>
            </View>

            {/* Today Meeting Cards from Redux Slice */}
            {todayMeetings.slice(0, 2).map((meeting) => (
              <View key={meeting.id} style={styles.meetingCard}>
                <View style={styles.meetingCardTop}>
                  <View style={styles.meetingCameraIconBox}>
                    <Ionicons name="videocam" size={14} color="#FFFFFF" />
                  </View>

                  <View style={styles.meetingInfo}>
                    <Text style={styles.meetingTypeTitle}>{meeting.type}</Text>
                    <Text style={styles.meetingPropertySub}>{meeting.property}</Text>
                  </View>

                  <View style={styles.meetingTimeGroup}>
                    <Ionicons name="time" size={18} color="#D0D5DD" />
                    <Text style={styles.meetingTimeText}>{meeting.time}</Text>
                  </View>
                </View>

                <View style={styles.meetingDivider} />

                <View style={styles.meetingCardBottom}>
                  <Text style={styles.meetingClientName}>{meeting.clientName}</Text>
                  <TouchableOpacity
                    style={styles.meetingViewBtn}
                    activeOpacity={0.8}
                    onPress={() => setActiveMeetingModal(meeting)}
                  >
                    <Text style={styles.meetingViewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Active Deals Section with 100% Inline CSS / Styles */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginTop: 22,
                marginBottom: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'Manrope_600SemiBold',
                      color: '#101828',
                    }}
                  >
                    Active Deals
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#A7F3D0',
                      backgroundColor: '#ECFDF5',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Inter_600SemiBold',
                        color: '#047857',
                      }}
                    >
                      {activeDeals.length}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Manrope_400Regular',
                    color: '#6B7280',
                    marginTop: 2,
                  }}
                >
                  Your All Active Deals Summary
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 2,
                }}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CRM')}
              >
                
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: 'Inter_600SemiBold',
                    color: '#00C980',
                  }}
                >
                  View Pipeline
                </Text>
              </TouchableOpacity>
            </View>

            {/* Active Deal Cards */}
            {activeDeals.slice(0, 2).map((deal) => (
              <View
                key={deal.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  
                }}
              >
                {/* Card Top: Title, Location & Status Badge */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter_500Medium',
                        color: '#0F172A',
                      }}
                    >
                      {deal.propertyTitle}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: 'Inter_400Regular',
                        color: '#64748B',
                        marginTop: 1,
                      }}
                    >
                      {deal.location}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: deal.statusBg || '#D1FAE5',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      minHeight: 22,
                      minWidth: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {deal.status ? (
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: 'Inter_600SemiBold',
                          color: deal.statusTextColor || '#065F46',
                        }}
                      >
                        {deal.status}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Deal Value & Commission Box */}
                <View
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 12,
                    paddingVertical: 9,
                    paddingHorizontal: 16,
                    marginVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: 'Inter_500Medium',
                        color: '#94A3B8',
                        letterSpacing: 0.5,
                      }}
                    >
                      DEAL VALUE
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Inter_700Bold',
                        color: '#0F172A',
                        
                      }}
                    >
                      {deal.dealValue}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 1,
                      height: 32,
                      backgroundColor: '#E2E8F0',
                      
                      right: 22,
                    }}
                  />

                  <View style={{ flex: 1.2 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: 'Inter_500Medium',
                        color: '#94A3B8',
                        letterSpacing: 0.5,
                      }}
                    >
                      COMMISSION
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                       
                        flexWrap: 'wrap',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: 'Inter_700Bold',
                          color: '#047857',
                        }}
                      >
                        {deal.commission}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: 'Inter_400Regular',
                          color: '#94A3B8',
                          marginLeft: 4,
                        }}
                      >
                        {deal.splitType}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Row: Buyer & Track Deal link */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Inter_400Regular',
                        color: '#94A3B8',
                      }}
                    >
                      Buyer:{' '}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Inter_600SemiBold',
                        color: '#1E293B',
                      }}
                    >
                      {deal.buyerName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                      Alert.alert(
                        'Track Deal Pipeline',
                        `Property: ${deal.propertyTitle}\nStage: ${deal.stage}\nBuyer: ${deal.buyerName}\nValue: ${deal.dealValue}\nCommission: ${deal.commission} ${deal.splitType}`
                      );
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Inter_600SemiBold',
                        color: '#1C453B',
                      }}
                    >
                      Track Deal
                    </Text>
                    <Ionicons name="chevron-forward" size={15} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Horizontal Scrolling Feature Cards Full-Width (Edge to Edge) */}
            <View
              style={{
                backgroundColor: '#109A6C',
                paddingVertical: 14,
                marginTop: 20,
                marginBottom: 20,
                marginHorizontal: -22,
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 10,
                }}
              >
                {/* 1. Follow-ups Card */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('Action')}
                  style={{
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginRight: 14,
                    
                  }}
                >
                  <Image
                    source={followUpImg}
                    style={{
                      width: 170,
                      height: 225,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                {/* 2. Deal Manager Card */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('CRM')}
                  style={{
                    borderRadius: 18,
                    overflow: 'hidden',
                    marginRight: 14,
                    shadowColor: '#000',
                   
                  }}
                >
                  <Image
                    source={dealManagerImg}
                    style={{
                      width: 170,
                      height: 225,
                      borderRadius: 18,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                {/* 3. Collab Card */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('CRM')}
                  style={{
                    borderRadius: 18,
                    overflow: 'hidden',
                    marginRight: 8,
                   
                  }}
                >
                  <Image
                    source={collabImg}
                    style={{
                     width: 170,
                      height: 225,
                      borderRadius: 18,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Today's Task Section (Replaced Recent Properties) */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginTop: 8,
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Manrope_600SemiBold',
                  color: '#101828',
                }}
              >
                Today's Task
              </Text>
              <View
                style={{
                  backgroundColor: '#F1F5F9',
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: 'Inter_600SemiBold',
                    color: '#475569',
                  }}
                >
                  {tasks.filter((t) => !t.completed).length} Pending
                </Text>
              </View>
            </View>

            {/* Dark Green Task Container matching reference */}
            <View
              style={{
                backgroundColor: '#276251',
                borderRadius: 22,
                padding: 14,
                marginBottom: 20,
              }}
            >
              {tasks.map((task, index) => {
                const isCompleted = task.completed;
                return (
                  <TouchableOpacity
                    key={task.id}
                    activeOpacity={0.85}
                    onPress={() => dispatch(toggleTaskComplete(task.id))}
                    style={{
                      backgroundColor: isCompleted ? '#CFDFD7' : '#FFFFFF',
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: index === tasks.length - 1 ? 0 : 10,
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                     
                    }}
                  >
                    {/* Checkbox */}
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 6,
                        borderWidth: isCompleted ? 0 : 1.5,
                        borderColor: '#CBD5E1',
                        backgroundColor: isCompleted ? '#107559' : '#FFFFFF',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 2,
                        marginRight: 8,
                      }}
                    >
                      {isCompleted && (
                        <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                      )}
                    </View>

                    {/* Task Title & Due Time */}
                    <View style={{ flex: 1, paddingRight: 4 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Manrope_600SemiBold',
                          color: isCompleted ? '#4E7063' : '#101828',
                          lineHeight: 16,
                          textDecorationLine: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: 'Inter_400Regular',
                          color: isCompleted ? '#739185' : '#94A3B8',
                          marginTop: 4,
                        }}
                      >
                        {task.dueTime || 'Due: Today'}
                      </Text>
                    </View>

                    {/* Priority Badge */}
                    {isCompleted ? (
                      <View
                        style={{
                          backgroundColor: '#A8D5C2',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: 'Inter_600SemiBold',
                            color: '#16533F',
                          }}
                        >
                          Done
                        </Text>
                      </View>
                    ) : task.priority === 'High' ? (
                      <View
                        style={{
                          backgroundColor: '#FFE4E6',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: 'Inter_600SemiBold',
                            color: '#E11D48',
                          }}
                        >
                          High
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Meeting Detail Modal */}
      <Modal visible={!!activeMeetingModal} transparent animationType="fade">
        <View style={styles.meetingModalOverlay}>
          <View style={styles.meetingModalCard}>
            <View style={styles.meetingModalHeader}>
              <View style={styles.meetingModalTitleGroup}>
                <Text style={styles.meetingModalType}>{activeMeetingModal?.type}</Text>
                <Text style={styles.meetingModalProperty}>{activeMeetingModal?.property}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveMeetingModal(null)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.meetingModalDetailRow}>
              <Ionicons name="person-outline" size={16} color="#05DF8E" />
              <Text style={styles.meetingModalLabel}>Client:</Text>
              <Text style={styles.meetingModalValue}>{activeMeetingModal?.clientName}</Text>
            </View>

            <View style={styles.meetingModalDetailRow}>
              <Ionicons name="time-outline" size={16} color="#05DF8E" />
              <Text style={styles.meetingModalLabel}>Time:</Text>
              <Text style={styles.meetingModalValue}>{activeMeetingModal?.time}</Text>
            </View>

            <View style={styles.meetingModalDetailRow}>
              <Ionicons name="videocam-outline" size={16} color="#05DF8E" />
              <Text style={styles.meetingModalLabel}>Mode:</Text>
              <Text style={styles.meetingModalValue}>{activeMeetingModal?.mode}</Text>
            </View>

            {activeMeetingModal?.notes ? (
              <View style={styles.meetingModalNotesBox}>
                <Text style={styles.meetingModalNotesText}>{activeMeetingModal.notes}</Text>
              </View>
            ) : null}

            <View style={styles.meetingModalActionRow}>
              <TouchableOpacity
                style={styles.meetingCallBtn}
                onPress={() => {
                  Alert.alert('Calling Client', `Dialing ${activeMeetingModal?.clientPhone}...`);
                }}
              >
                <Ionicons name="call" size={16} color="#FFFFFF" />
                <Text style={styles.meetingCallBtnText}>Call Client</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.meetingDoneBtn}
                onPress={() => {
                  if (activeMeetingModal) {
                    dispatch(
                      updateMeetingStatus({ id: activeMeetingModal.id, status: 'Completed' })
                    );
                    Alert.alert('Status Updated', 'Meeting marked as completed!');
                    setActiveMeetingModal(null);
                  }
                }}
              >
                <Ionicons name="checkmark-done" size={16} color="#000000" />
                <Text style={styles.meetingDoneBtnText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#2C5849',
  },
  safeHeader: {
    flex: 1,
    backgroundColor: '#2C5849',
  },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#F7D0B7',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  welcomeTextGroup: {
    marginLeft: 12,
  },
  welcomeSub: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
    color: '#9CA3AF',
    bottom: -3,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: '#FFFFFF',
    top:-4
  },
  bellBtn: {
    position: 'relative',
    padding: 4,
    height: 36,
    width: 36,
    borderRadius: 18,
  },
  redBadge: {
    position: 'absolute',
    top: -1,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#2C5849',
  },
  redBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  segmentedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#10E8A0',
    borderRadius: 24,
    padding: 3,
    marginBottom: 16,
    backgroundColor: '#242127'
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: '#FFFFFF',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontFamily: 'Manrope_700Bold',
  },
  bannerCard: {
    marginHorizontal: 20,
    height: 134,
    backgroundColor: '#10E8A0',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  cardBgGraphic: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '65%',
    height: '100%',
    opacity: 0.85,
  },
  cardHeaderPhoto: {
    position: 'absolute',
    right: -10,
    bottom: -8,
    width: 200,
    height: '100%',
  },
  cardLeftContent: {
    position: 'absolute',
    left: 23,
    top: 12,
    bottom: 16,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: '#0A7350',
  },
  cardStatNumber: {
    fontSize: 34,
    fontFamily: 'Manrope_700Bold',
    color: '#111315',
    marginBottom: 2,
    top:-8,
    left:24,
    maxWidth: 165,
  },
  timeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    right: 14,
  },
  timePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
  },
  timePillActive: {
    backgroundColor: '#2C5849',
  },
  timePillText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: '#555555',
  },
  timePillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_600SemiBold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#343139',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collabCapsule: {
    width: 82,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#343139',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  collabBadge: {
    position: 'absolute',
    top: -8,
    right: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 15,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#2C5849',
  },
  collabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
    color: '#D2DFD9',
    marginTop: 6,
  },
  lowerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: 110,
    minHeight: 350,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#05DF8E',
  },
  propCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  propCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propCardTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: '#0F172A',
  },
  propCardLocation: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
  },
  propCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  cardTag: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#475569',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardStatus: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#05DF8E',
    marginLeft: 'auto',
  },
  // Today Meeting Styles (Exact match to reference image)
  meetingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  meetingTitleGroup: {
    flex: 1,
  },
  meetingTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingSectionTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: '#111827',
  },
  meetingBadge: {
    backgroundColor: '#F1F0FB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  meetingBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#4B5563',
  },
  meetingSubtitle: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: '#6B7280',
    marginTop: 3,
  },
  meetingViewAllText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#00C980',
    marginTop: 2,
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    
  },
  meetingCardTop: {
    flexDirection: 'row',
    /* alignItems: 'center', */
  },
  meetingCameraIconBox: {
    width: 26,
    height: 26,
    borderRadius: 18,
    backgroundColor: '#1F2937',
     justifyContent: 'center',
    alignItems: 'center', 
    marginRight: 10,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTypeTitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#2B2B2B',
  },
  meetingPropertySub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
    marginTop: 0,
  },
  meetingTimeGroup: {
    flexDirection: 'row',
    alignItems: "flex-start",
    gap: 4,
  },
  meetingTimeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#475467',
  },
  meetingDivider: {
    height: 1,
    backgroundColor: '#E5EAF2',
    marginVertical: 10,
  },
  meetingCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingClientName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#334155',
  },
  meetingViewBtn: {
    backgroundColor: '#00D589',
    paddingHorizontal: 22,
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingViewBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
  },
  // Modal Styles
  meetingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  meetingModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  meetingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  meetingModalTitleGroup: {
    flex: 1,
  },
  meetingModalType: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: '#111827',
  },
  meetingModalProperty: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  meetingModalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  meetingModalLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
    width: 60,
  },
  meetingModalValue: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#111827',
    flex: 1,
  },
  meetingModalNotesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  meetingModalNotesText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#475569',
    lineHeight: 18,
  },
  meetingModalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  meetingCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  meetingCallBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  meetingDoneBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05DF8E',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  meetingDoneBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#000000',
  },
});

export default HomeScreen;
