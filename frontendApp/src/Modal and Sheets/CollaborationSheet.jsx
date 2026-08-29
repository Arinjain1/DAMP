import React, { useState, useRef } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  
} from 'react-native';
import {
  Check,
  Phone,
 
  Calendar,
  DollarSign,
  ArrowLeft,
  Send,
  CheckCircle2,
  Lock,
  Unlock,
  Shield,
  Clock,
  AlertTriangle,
  Trash2,
} from 'lucide-react-native';
import { showToast } from '../utils/toast';
import WhatsAppIcon from '../Components/WhatsAppIcon';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import {  setFollowUps } from '../store/slices/followUpsSlice';
import { tasksAPI, collabAPI } from '../config/api';
import { addDeal, setSelectedDeal } from '../store/slices/dealsSlice';


const mapRoomToFrontend = (room, myId) => {
  const isBroker1 = room.broker_1_id === myId;
  const partnerName = isBroker1 ? room.broker_2_name : room.broker_1_name;
  const partnerPhone = isBroker1 ? room.broker_2_phone : room.broker_1_phone;
  const yourRole = isBroker1 ? room.broker_1_role : room.broker_2_role;
  const theirRole = isBroker1 ? room.broker_2_role : room.broker_1_role;
  
  const unlocked = {
    address: true,
    ownerContact: true,
    clientPhone: true,
    documents: true
  };

  return {
    id: room.id,
    client_id: room.client_id,
    property_id: room.property_id,
    full_name: partnerName,
    phone_number: partnerPhone,
    operating_area: room.property_city || 'Indore, MP',
    property: room.property_title,
    property_address: room.property_address,
    property_price: room.property_price,
    property_image: room.property_image,
    client: room.client_name,
    client_phone: room.client_phone,
    owner_name: room.property_owner_name,
    owner_phone: room.property_owner_phone,
    yourRole,
    theirRole,
    split: room.commission_split,
    stage: room.stage,
    commissionStatus: room.commission_status,
    dealId: room.deal_id || (room.stage === 'Deal' ? 99 : null),
    unlocked,
    proposedSplit: room.commission_split,
    status: room.stage === 'Matched' ? (room.last_proposed_by !== myId ? 'Countered' : 'New') : room.stage,
    target: `${room.property_title} • ${room.client_name}`,
    role: theirRole,
    isOutgoing: room.last_proposed_by === myId,
    lastProposedBy: room.last_proposed_by,
    counterNote: room.counter_note
  };
};

const mapMatchToFrontend = (match, type) => {
  return {
    id: match.id,
    compatibility: match.compatibility || 85,
    freshness: match.distance ? `${parseFloat(match.distance).toFixed(1)} km away` : 'Active',
    type: type,
    title: match.title || `${match.configuration || ''} Flat in ${match.locality || ''}`,
    budget: match.price ? `₹${(match.price / 100000).toFixed(1)} L` : `₹${(match.budget_min / 100000).toFixed(1)}-${(match.budget_max / 100000).toFixed(1)} L`,
    moveInStatus: match.furnishing_status || 'Ready to move',
    size: match.size_sqft ? `${match.size_sqft} sq.ft.` : '1000 sq.ft.',
    broker: match.broker_name || 'Partner Broker',
    verified: true,
    responseRate: '95% response',
    bhk: match.configuration || '2 BHK',
    price: match.price ? `₹${(match.price / 100000).toFixed(1)} L` : `₹${(match.budget_min / 100000).toFixed(1)}-${(match.budget_max / 100000).toFixed(1)} L`,
    loc: match.locality || match.city || '',
    initial: (match.broker_name || 'PB').split(' ').map(n => n[0]).join('').toUpperCase()
  };
};

export default function CollaborationSheet({ isOpen, onClose, initialRoomId, initialMatchId, initialTab }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const myId = user?.id || 'dummy-broker-id';

  const { properties } = useSelector((state) => state.properties);
  const { customers } = useSelector((state) => state.customers);
  const { deals } = useSelector((state) => state.deals);

  // Main navigation tabs: 'opportunities' | 'requests' | 'active' | 'network'
  const [activeTab, setActiveTab] = useState(initialTab || (initialRoomId ? 'active' : 'requests'));
  const [matchSubTab, setMatchSubTab] = useState('clients'); // 'clients' | 'properties'
  const [requestsSubTab, setRequestsSubTab] = useState('incoming'); // 'incoming' | 'outgoing'
  
  // Transition states for sub-views
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId || null);
  
  const [selectedMatchStep, setSelectedMatchStep] = useState('detail'); // 'detail' | 'request'
  const [selectedMatchSplit, setSelectedMatchSplit] = useState('50-50');
  const [matchRequestMessage, setMatchRequestMessage] = useState('');

  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [isCountering, setIsCountering] = useState(false);

  // Network add broker form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ name: '', phone: '' });

  // Database Integration States
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [myNetwork, setMyNetwork] = useState([]);
  const [roomTasks, setRoomTasks] = useState([]);
  const [roomVisits, setRoomVisits] = useState([]);
  const [chats, setChats] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [loadingOpp, setLoadingOpp] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoadingOpp(true);
      const res = await collabAPI.getMatchOpportunities();
      if (res.data.success) {
        setOpportunities(res.data.data);
      }
    } catch (err) {
      console.error('Error loading collab sheet opportunities:', err);
    } finally {
      setLoadingOpp(false);
    }
  };

  // Fetch Rooms, Proposals, and Network on mount
  const loadData = async () => {
    try {
      const roomsRes = await collabAPI.getActiveRooms();
      if (roomsRes.data.success) {
        const allRooms = roomsRes.data.data;
        const mapped = allRooms.map(r => mapRoomToFrontend(r, myId));
        
        // stage === 'Matched' represents a proposal
        const active = mapped.filter(r => r.stage !== 'Matched');
        const reqs = mapped.filter(r => r.stage === 'Matched');
        
        setActiveRooms(active);
        setRequests(reqs);
      }
      
      const networkRes = await collabAPI.getMyNetwork();
      if (networkRes.data.success) {
        setMyNetwork(networkRes.data.data);
      }

      await fetchOpportunities();
    } catch (err) {
      console.error("Failed to load collaboration data:", err);
    }
  };

  React.useEffect(() => {
    let intervalId;
    if (isOpen) {
      loadData();
      
      // Auto-poll every 5 seconds for real-time collaboration updates
      intervalId = setInterval(() => {
        loadData();
      }, 5000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isOpen]);

  // Load Matchmaking lists
  React.useEffect(() => {
    if (isOpen && initialMatchId) {
      const loadMatchmaking = async () => {
        try {
          let res;
          if (matchSubTab === 'clients') {
            res = await collabAPI.getMatchingClients(initialMatchId);
          } else {
            res = await collabAPI.getMatchingProperties(initialMatchId);
          }
          if (res.data.success) {
            const mappedMatches = res.data.data.map(m => mapMatchToFrontend(m, matchSubTab));
            setMatches(mappedMatches);
          }
        } catch (err) {
          console.error("Matchmaking loading error:", err);
        }
      };
      loadMatchmaking();
    }
  }, [isOpen, initialMatchId, matchSubTab]);

  // Load detailed room tasks and visits when room selected
  const loadRoomDetails = async (roomId) => {
    try {
      const tasksRes = await collabAPI.getRoomTasks(roomId);
      if (tasksRes.data.success) {
        setRoomTasks(tasksRes.data.data);
      }
      const visitsRes = await collabAPI.getRoomVisits(roomId);
      if (visitsRes.data.success) {
        setRoomVisits(visitsRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load room details:", err);
    }
  };

  React.useEffect(() => {
    if (selectedRoomId) {
      loadRoomDetails(selectedRoomId);
      const currentRoom = activeRooms.find((r) => String(r.id) === String(selectedRoomId));
      if (currentRoom && currentRoom.client) {
        setVisitClient(currentRoom.client);
      } else {
        setVisitClient('');
      }
    }
  }, [selectedRoomId, activeRooms]);

  React.useEffect(() => {
    if (initialRoomId) {
      setSelectedRoomId(initialRoomId);
      setActiveTab('active');
    } else if (initialMatchId) {
      setSelectedMatchId(initialMatchId);
      setSelectedMatchStep('detail');
      setSelectedMatchSplit('50-50');
      setMatchRequestMessage('');
      setActiveTab('requests');
    } else {
      setSelectedRoomId(null);
      setSelectedMatchId(null);
      setActiveTab('requests');
    }
  }, [initialRoomId, initialMatchId]);

  // Network Search List fallback
  const [networkBrokers] = useState([
    { id: 11, full_name: 'Amit Verma', phone_number: '9988776655', operating_area: 'Indore, MP' },
    { id: 12, full_name: 'Deepika Mall', phone_number: '9123456780', operating_area: 'Ujjain, MP' },
    { id: 13, full_name: 'Vikram Seth', phone_number: '9827364510', operating_area: 'Bhopal, MP' },
  ]);

  // State controls for chat messaging
  const [newMsgText, setNewMsgText] = useState('');
  const scrollViewRef = useRef();

  // State controls for adding a new task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskVisibility, setNewTaskVisibility] = useState('Shared');

  // State controls for scheduling a visit
  const [visitTime, setVisitTime] = useState('Tomorrow - 2:00 PM');
  const [visitClient, setVisitClient] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [visitDateVal, setVisitDateVal] = useState(new Date());
  const [reschedulingVisitId, setReschedulingVisitId] = useState(null);

  // State controls for countering split/negotiations
  const [counterSplitVal, setCounterSplitVal] = useState('50/50');
  const [counterMessage, setCounterMessage] = useState('');

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------
  const handleAcceptRequest = async (roomId) => {
    Alert.alert(
      "Accept Proposal",
      `Are you sure you want to accept this collaboration proposal?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: async () => {
            try {
              const res = await collabAPI.updateSplitProposal(roomId, { status: 'Accepted' });
              if (res.data.success) {
                showToast.success(`Collaboration proposal accepted!`);
                loadData();
                setSelectedRequestId(null);
              }
            } catch (err) {
              showToast.error("Failed to accept proposal");
            }
          }
        }
      ]
    );
  };

  const handleRejectRequest = async (roomId) => {
    Alert.alert(
      "Decline Request",
      `Are you sure you want to decline this request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await collabAPI.closeRoom(roomId);
              if (res.data.success) {
                showToast.info('Collaboration proposal declined.');
                loadData();
                setSelectedRequestId(null);
              }
            } catch (err) {
              showToast.error("Failed to decline proposal");
            }
          }
        }
      ]
    );
  };

  const handleCloseCollaboration = async (roomId) => {
    Alert.alert(
      "Close Collaboration",
      "Are you sure you want to close this collaboration? This will archive the shared room.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close Collab",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await collabAPI.closeRoom(roomId);
              if (res.data.success) {
                showToast.success("Collaboration closed successfully!");
                setSelectedRoomId(null);
                loadData();
              }
            } catch (err) {
              showToast.error("Failed to close collaboration");
            }
          }
        }
      ]
    );
  };

  const handleCounterRequest = (reqId) => {
    const req = requests.find((r) => r.id === reqId);
    if (req) {
      setCounterSplitVal(req.proposedSplit);
      setSelectedRequestId(reqId);
      setIsCountering(true);
    }
  };

  const submitCounterOffer = async () => {
    try {
      const res = await collabAPI.updateSplitProposal(selectedRequestId, {
        commission_split: counterSplitVal,
        status: 'Countered',
        counter_note: counterMessage
      });
      if (res.data.success) {
        showToast.success('Counter proposal sent successfully!');
        setIsCountering(false);
        setSelectedRequestId(null);
        setCounterMessage('');
        loadData();
      }
    } catch (err) {
      showToast.error("Failed to send counter proposal");
    }
  };

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone) => {
    if (phone) Linking.openURL(`https://wa.me/${phone}`);
  };

  const handleSendRequest = () => {
    if (!formName.trim() || !formPhone.trim()) {
      showToast.error('Please fill in both name and phone number');
      return;
    }
    setSuccessData({ name: formName.trim(), phone: formPhone.trim() });
    setShowSuccessModal(true);
    setFormName('');
    setFormPhone('');
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setShowAddForm(false);
  };

  // Add Message to Room Chat (kept local for fidelity)
  const handleSendMsg = (roomId) => {
    if (!newMsgText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'you',
      text: newMsgText.trim(),
      time: 'Just now',
    };
    setChats((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg],
    }));
    setNewMsgText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Toggle Task Status
  const handleToggleTask = async (roomId, taskId) => {
    const taskObj = roomTasks.find(t => t.id === taskId);
    if (!taskObj) return;
    try {
      const res = await collabAPI.updateRoomTask(roomId, taskId, { completed: !taskObj.completed });
      if (res.data.success) {
        showToast.success('Task status updated!');
        loadRoomDetails(roomId);
      }
    } catch (err) {
      showToast.error('Failed to update task');
      console.log(err)
    }
  };

  // Add New Task
  const handleAddTask = async (roomId) => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await collabAPI.createRoomTask(roomId, {
        title: newTaskTitle.trim(),
        visibility: newTaskVisibility,
        note: ''
      });
      if (res.data.success) {
        showToast.success('Task added successfully!');
        setNewTaskTitle('');
        loadRoomDetails(roomId);
      }
    } catch (err) {
      showToast.error('Failed to add task');
    }
  };

  // Schedule New Visit
  const handleScheduleVisit = async (roomId) => {
    try {
      const res = await collabAPI.scheduleRoomVisit(roomId, {
        scheduled_time: visitDateVal.toISOString(),
        client_name: visitClient,
        outcome_notes: ''
      });
      if (res.data.success) {
        showToast.success('Site visit scheduled!');
        loadRoomDetails(roomId);
      }
    } catch (err) {
      showToast.error('Failed to schedule site visit');
    }
  };

  const handleRescheduleVisit = async (roomId, visitId, newTime) => {
    try {
      const res = await collabAPI.updateRoomVisit(roomId, visitId, {
        scheduled_time: newTime
      });
      if (res.data.success) {
        showToast.success('Site visit rescheduled!');
        loadRoomDetails(roomId);
      }
    } catch (err) {
      showToast.error('Failed to reschedule site visit');
    }
  };

  // Complete Visit Outcome
  const handleVisitOutcome = async (roomId, visitId, outcome) => {
    try {
      const res = await collabAPI.updateRoomVisit(roomId, visitId, {
        status: 'Completed',
        outcome_notes: outcome
      });
      if (res.data.success) {
        showToast.success(`Visit marked complete: ${outcome}`);
        loadRoomDetails(roomId);

        // Sync followups to Redux state instantly
        try {
          const tasksRes = await tasksAPI.getAll({ status: 'All' });
          if (tasksRes.data.success) {
            const transformedTasks = tasksRes.data.data.map(task => {
              let propertyIds = [];
              if (task.site_visit_properties && Array.isArray(task.site_visit_properties)) {
                propertyIds = task.site_visit_properties.map(p => p.property_id);
              } else if (task.property_id) {
                propertyIds = [task.property_id];
              }
              return {
                id: task.id,
                customerId: task.client_id,
                clientNameFallback: task.client?.name || task.client?.full_name || task.client_name,
                propertyNameFallback: task.property_title,
                propertyLocationFallback: task.property_address || task.property_locality,
                propertyIds: propertyIds,
                type: task.task_type || 'Meeting',
                date: task.due_date,
                note: task.description || '',
                status: task.status === 'completed' ? 'Done' : 'Pending',
                siteVisitId: task.site_visit_id,
                propertyCount: task.site_visit_property_count || 0,
                siteVisitProperties: task.site_visit_properties || [],
                collaborated: task.collaborated || false
              };
            });
            dispatch(setFollowUps(transformedTasks));
          }
        } catch (syncErr) {
          console.error("Error syncing tasks after collab visit completion:", syncErr);
        }
        
        if (outcome === 'Interested') {
          // Auto advance Room stage if client is interested
          const dealRes = await collabAPI.startDeal(roomId);
          if (dealRes.data.success) {
            showToast.success('Deal linkage initialized. Lead moved to In-Process!');
            
            const currentRoom = activeRooms.find(r => String(r.id) === String(roomId));
            const newDeal = {
              id: dealRes.data.data.dealId,
              customerId: currentRoom?.client_id || currentRoom?.client,
              propertyId: currentRoom?.property_id || currentRoom?.property,
              roomId: roomId,
              stage: 'Negotiation',
              status: 'Negotiation',
              startedAt: new Date().toISOString(),
              meetings: [],
              client_name: currentRoom?.client || 'Client Details',
              client_phone: currentRoom?.client_phone,
              property_title: currentRoom?.property || 'Property Details',
              property_address: currentRoom?.property_address,
              listing_price: currentRoom?.property_price,
              cover_image_url: currentRoom?.property_image
            };
            
            dispatch(addDeal(newDeal));
            dispatch(setSelectedDeal(newDeal));
            onClose();
            setTimeout(() => {
              router.push('/deal-page');
            }, 100);
          }
        }
      }
    } catch (err) {
      showToast.error('Failed to update visit');
    }
  };

  // Close Collab room & Mark Paid
  const handleMarkPaid = async (roomId) => {
    try {
      const res = await collabAPI.settleSplit(roomId);
      if (res.data.success) {
        showToast.success('Commission split finalized and settled!');
        loadData();
      }
    } catch (err) {
      showToast.error('Failed to settle split');
    }
  };

  // Start Deal flow
  const handleStartDeal = async (roomId) => {
    try {
      const res = await collabAPI.startDeal(roomId);
      if (res.data.success) {
        showToast.success('Deal linkage initialized. Lead moved to In-Process!');
        loadData();
        
        const currentRoom = activeRooms.find(r => String(r.id) === String(roomId));
        const newDeal = {
          id: res.data.data.dealId,
          customerId: currentRoom?.client_id || currentRoom?.client,
          propertyId: currentRoom?.property_id || currentRoom?.property,
          roomId: roomId,
          stage: 'Negotiation',
          status: 'Negotiation',
          startedAt: new Date().toISOString(),
          meetings: [],
          client_name: currentRoom?.client || 'Client Details',
          client_phone: currentRoom?.client_phone,
          property_title: currentRoom?.property || 'Property Details',
          property_address: currentRoom?.property_address,
          listing_price: currentRoom?.property_price,
          cover_image_url: currentRoom?.property_image
        };
        
        dispatch(addDeal(newDeal));
        dispatch(setSelectedDeal(newDeal));
        onClose();
        setTimeout(() => {
          router.push('/deal-page');
        }, 100);
      }
    } catch (err) {
      showToast.error('Failed to start deal');
    }
  };

  // Send Match Request Proposal
  const handleConfirmMatchRequest = async (match) => {
    try {
      const propertyId = matchSubTab === 'properties' ? match.id : initialMatchId;
      const clientId = matchSubTab === 'clients' ? match.id : initialMatchId;
      const role = matchSubTab === 'properties' ? 'Client-side' : 'Property-side';

      const res = await collabAPI.sendProposal({
        property_id: propertyId,
        client_id: clientId,
        role: role,
        proposed_split: selectedMatchSplit.replace('-', '/'),
        message: matchRequestMessage || 'Requesting collaboration split on matched property opportunity.'
      });

      if (res.data.success) {
        showToast.success(`Collaboration request sent to ${match.broker}!`);
        setSelectedMatchId(null);
        loadData();
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to send collaboration request');
    }
  };

  // Active collaboration room details sub-tab navigation
  const [activeRoomTab, setActiveRoomTab] = useState('Overview');

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        {/* Collab Hub Sheet Content */}
        <View style={styles.sheetContainer}>
            
            {/* 1. COLLABORATION ROOM DETAILS VIEW */}
            {selectedRoomId ? (
              (() => {
                const room = activeRooms.find((r) => String(r.id) === String(selectedRoomId));
                const roomChats = chats[selectedRoomId] || [];
                const matchingDeal = deals?.find(d => 
                  String(d.customerId || d.client_id) === String(room?.client_id) &&
                  String(d.propertyId || d.property_id) === String(room?.property_id)
                );

                return (
                  <View style={styles.flexContainer}>
                    {/* Header */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 25 : 60,
                      paddingBottom: 16,
                      paddingHorizontal: 20,
                      backgroundColor: 'white',
                      borderBottomWidth: 1,
                      borderColor: '#e5e7eb',
                      justifyContent: 'space-between',
                    }}>
                      <TouchableOpacity 
                        onPress={() => setSelectedRoomId(null)} 
                        style={{ padding: 4 }}
                      >
                        <ArrowLeft size={24} color="#111827" />
                      </TouchableOpacity>
                      
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>
                        Shared Room
                      </Text>
                      
                      <View style={{
                        backgroundColor: '#e2fbe8',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 14,
                      }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#16a34a', fontFamily: 'Montserrat_700Bold' }}>Active</Text>
                      </View>
                    </View>

                    {/* Room Sub-Tabs */}
                    <View style={{
                      flexDirection: 'row',
                      gap: 8,
                      marginBottom: 16,
                      marginTop: 12,
                      paddingHorizontal: 20,
                    }}>
                      {['Overview', 'Tasks', 'Visit'].map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 10,
                            backgroundColor: activeRoomTab === t ? '#000000' : '#F4F7FE',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onPress={() => setActiveRoomTab(t)}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: '600',
                              color: activeRoomTab === t ? '#ffffff' : '#6b7280',
                              fontFamily: 'Montserrat_700Bold',
                            }}
                          >
                            {t}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Sub-Tab Contents */}
                    <ScrollView
                      style={styles.flexContainer}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {activeRoomTab === 'Overview' && (
                        <View style={{ gap: 10, paddingBottom: 16 }}>
                          {/* Deal Overview Card */}
                          <View style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 14,
                            padding: 12,
                            borderColor: '#e5e7eb',
                            borderWidth: 1,
                          }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 10, fontFamily: 'Montserrat_700Bold' }}>Deal Overview</Text>
                            <View style={{ gap: 8 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Lato_400Regular', width: '30%' }}>Property</Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b', fontFamily: 'Montserrat_700Bold', flex: 1, textAlign: 'right' }}>{room?.property || 'Property Details'}</Text>
                              </View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Lato_400Regular', width: '30%' }}>Client</Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b', fontFamily: 'Montserrat_700Bold', flex: 1, textAlign: 'right' }}>
                                  {room?.client || 'Client Details'}
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Lato_400Regular', width: '30%' }}>Stage</Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b', fontFamily: 'Montserrat_700Bold', flex: 1, textAlign: 'right' }}>
                                  {room?.stage === 'Deal' && matchingDeal 
                                    ? `Deal: ${matchingDeal.stage || matchingDeal.status || 'Negotiation'}` 
                                    : (room?.stage === 'Visit' ? 'Visit Planned' : room?.stage)}
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Lato_400Regular', width: '35%' }}>Exact Address</Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b', fontFamily: 'Montserrat_700Bold', flex: 1, textAlign: 'right' }}>{room?.property_address || 'Palasia, Indore'}</Text>
                              </View>

                              {room?.client_phone && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                  <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'Lato_400Regular', width: '30%' }}>Client Phone</Text>
                                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b', fontFamily: 'Montserrat_700Bold', flex: 1, textAlign: 'right' }}>{room.client_phone}</Text>
                                </View>
                              )}
                            </View>
                          </View>

                          {/* Broker Roles & Split Card */}
                          <View style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 14,
                            padding: 12,
                            borderColor: '#e5e7eb',
                            borderWidth: 1,
                          }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 10, fontFamily: 'Montserrat_700Bold' }}>Broker Roles & Split</Text>
                            <View style={{ gap: 8, marginBottom: 10 }}>
                              {/* Aap row */}
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#f5f3ff',
                                padding: 8,
                                borderRadius: 10,
                                justifyContent: 'space-between',
                              }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <View style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: '#ddd6fe',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#BFB7FD', fontFamily: 'Montserrat_700Bold' }}>R</Text>
                                  </View>
                                  <View>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b', fontFamily: 'Montserrat_700Bold' }}>You ({user?.full_name || 'You'})</Text>
                                    <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Lato_400Regular', textTransform: 'capitalize' }}>
                                      {room?.yourRole || 'Property-side'} broker
                                    </Text>
                                  </View>
                                </View>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#BFB7FD', fontFamily: 'Montserrat_700Bold' }}>
                                  {room?.yourRole === 'Client-side' ? (room?.split ? room.split.split('/')[0] : '50') : (room?.split ? room.split.split('/')[1] : '50')}%
                                </Text>
                              </View>

                              {/* Other broker row */}
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#f8fafc',
                                padding: 8,
                                borderRadius: 10,
                                justifyContent: 'space-between',
                              }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <View style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: '#e2e8f0',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#64748b', fontFamily: 'Montserrat_700Bold' }}>
                                      {room?.full_name?.charAt(0).toUpperCase()}
                                    </Text>
                                  </View>
                                  <View>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b', fontFamily: 'Montserrat_700Bold' }}>{room?.full_name || 'Partner Broker'}</Text>
                                    <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Lato_400Regular', textTransform: 'capitalize' }}>
                                      {room?.theirRole || 'Client-side'} broker
                                    </Text>
                                  </View>
                                </View>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#64748b', fontFamily: 'Montserrat_700Bold' }}>
                                  {room?.yourRole === 'Client-side' ? (room?.split ? room.split.split('/')[1] : '50') : (room?.split ? room.split.split('/')[0] : '50')}%
                                </Text>
                              </View>
                            </View>

                            {/* Counter Note Display */}
                            {room?.counterNote && (
                              <View style={{
                                backgroundColor: '#f9fafb',
                                borderColor: '#e5e7eb',
                                borderWidth: 1,
                                borderRadius: 8,
                                padding: 10,
                                marginTop: 8,
                              }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#6b7280', fontFamily: 'Montserrat_700Bold', marginBottom: 2 }}>
                                  COUNTER NOTE:
                                </Text>
                                <Text style={{ fontSize: 12, color: '#374151', fontFamily: 'Lato_400Regular', fontStyle: 'italic' }}>
                                  {room.counterNote}
                                </Text>
                              </View>
                            )}

                            {/* Status notice */}
                            <View style={{
                              backgroundColor: '#f0fdf4',
                              borderColor: '#bbf7d0',
                              borderWidth: 1,
                              borderRadius: 10,
                              padding: 10,
                              marginTop: 8,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                            }}>
                              <Shield size={14} color="#16a34a" />
                              <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '500', fontFamily: 'Lato_400Regular' }}>
                                Contact details unlocked for both brokers
                              </Text>
                            </View>
                          </View>

                          {/* Agreed Split Card */}
                          <View style={{
                            backgroundColor: '#f5f3ff',
                            borderRadius: 14,
                            padding: 12,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            <View>
                              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b', fontFamily: 'Montserrat_700Bold' }}>Agreed Split</Text>
                              <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Lato_400Regular', marginTop: 1 }}>Both brokers agreed • Written</Text>
                            </View>
                            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#BFB7FD', fontFamily: 'Montserrat_700Bold' }}>
                              {room?.split?.replace('/', '-') || '50-50'}
                            </Text>
                          </View>
                          
                          {/* Action Buttons Row */}
                          <View style={{ flexDirection: 'row', gap: 10 }}>
                            {/* Schedule Visit Button */}
                            <TouchableOpacity
                              style={{
                                flex: 1,
                                backgroundColor: '#BFB7FD',
                                borderRadius: 14,
                                paddingVertical: 14,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 6,
                              }}
                              onPress={() => setActiveRoomTab('Visit')}
                            >
                              <Calendar size={16} color="#ffffff" />
                              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff', fontFamily: 'Montserrat_700Bold' }}>Schedule Visit</Text>
                            </TouchableOpacity>

                            {/* Start Deal Button */}
                            <TouchableOpacity
                              style={{
                                flex: 1,
                                backgroundColor: '#16a34a',
                                borderRadius: 14,
                                paddingVertical: 14,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 6,
                              }}
                              onPress={() => {
                                handleStartDeal(selectedRoomId);
                                onClose();
                                setTimeout(() => {
                                  router.push('/deal-page');
                                }, 100);
                              }}
                            >
                              <CheckCircle2 size={16} color="#ffffff" />
                              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff', fontFamily: 'Montserrat_700Bold' }}>Start Deal</Text>
                            </TouchableOpacity>
                          </View>

                          {/* Close Collaboration Button */}
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#ffffff',
                              borderColor: '#ef4444',
                              borderWidth: 1.5,
                              borderRadius: 14,
                              paddingVertical: 14,
                              alignItems: 'center',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              gap: 8,
                            }}
                            onPress={() => handleCloseCollaboration(selectedRoomId)}
                          >
                            <Trash2 size={16} color="#ef4444" />
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ef4444', fontFamily: 'Montserrat_700Bold' }}>Close Collaboration</Text>
                          </TouchableOpacity>

                          {/* Footer Logo */}
                          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
                            <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Lato_400Regular' }}>
                              BrokMate • Indian Real Estate CRM
                            </Text>
                          </View>
                        </View>
                      )}

                      {activeRoomTab === 'Tasks' && (
                        <View style={styles.gap16}>
                          <Text style={styles.cardSectionTitle}>Shared To-Do Checklist</Text>
                          <View style={styles.taskList}>
                            {roomTasks.map((task) => (
                              <TouchableOpacity
                                key={task.id}
                                style={styles.taskItem}
                                onPress={() => handleToggleTask(selectedRoomId, task.id)}
                              >
                                <View
                                  style={[
                                    styles.checkboxCircle,
                                    task.completed && styles.checkboxCircleCompleted,
                                  ]}
                                >
                                  {task.completed && <Check size={10} color="#ffffff" />}
                                </View>
                                <View style={styles.taskTextInfo}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <Text
                                      style={[
                                        styles.taskItemText,
                                        task.completed && styles.taskItemTextCompleted,
                                      ]}
                                    >
                                      {task.title}
                                    </Text>
                                    {task.visibility === 'Private' && (
                                      <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Lock size={10} color="#ef4444" />
                                        <Text style={{ fontSize: 9, color: '#ef4444', fontWeight: '700', fontFamily: 'Montserrat_700Bold' }}>Private</Text>
                                      </View>
                                    )}
                                  </View>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </View>

                          {/* Add task UI */}
                          <View style={styles.addTaskForm}>
                            <TextInput
                              style={styles.addTaskInput}
                              value={newTaskTitle}
                              onChangeText={setNewTaskTitle}
                              placeholder="New task title..."
                              placeholderTextColor="#9ca3af"
                            />
                            <View style={styles.addTaskMetaOptions}>
                              <TouchableOpacity
                                style={[
                                  styles.visibilityToggle,
                                  newTaskVisibility === 'Shared' && styles.visibilityToggleActive,
                                ]}
                                onPress={() => setNewTaskVisibility('Shared')}
                              >
                                <Text style={styles.visibilityToggleText}>Shared</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.visibilityToggle,
                                  newTaskVisibility === 'Private' && styles.visibilityToggleActive,
                                ]}
                                onPress={() => setNewTaskVisibility('Private')}
                              >
                                <Text style={styles.visibilityToggleText}>Private (Only Me)</Text>
                              </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                              style={styles.addTaskSubmitBtn}
                              onPress={() => handleAddTask(selectedRoomId)}
                            >
                              <Text style={styles.addTaskSubmitText}>Add Checklist Task</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      {activeRoomTab === 'Visit' && (
                        <View style={styles.gap16}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={styles.cardSectionTitle}>Collaborative Site Visits</Text>
                            <TouchableOpacity
                              style={{
                                backgroundColor: '#16a34a',
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                              }}
                              onPress={() => {
                                handleStartDeal(selectedRoomId);
                              }}
                            >
                              <CheckCircle2 size={14} color="#ffffff" />
                              <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff', fontFamily: 'Montserrat_700Bold' }}>Interested (Start Deal)</Text>
                            </TouchableOpacity>
                          </View>
                          {roomVisits.map((visit) => {
                            const formattedTime = visit.scheduled_time 
                              ? new Date(visit.scheduled_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : (visit.time || 'Not scheduled');
                            const clientName = visit.client_name || visit.client || 'Client';
                            const outcomeNotes = visit.outcome_notes || visit.outcome || '';
                            const isCompleted = visit.status === 'Completed';

                            return (
                              <View key={visit.id} style={[styles.visitCard, isCompleted && { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }]}>
                                <View style={styles.visitHeaderRow}>
                                  <View style={[styles.calendarIconBg, isCompleted && { backgroundColor: '#dcfce7' }]}>
                                    <Calendar size={16} color={isCompleted ? '#16a34a' : '#7c3aed'} />
                                  </View>
                                  <View style={styles.flex1}>
                                    <Text style={styles.visitTimeText}>{formattedTime}</Text>
                                    <Text style={styles.visitDetailText}>Client: {clientName} • Broker: {room?.full_name || 'Partner Broker'}</Text>
                                  </View>
                                  <View style={[
                                    styles.visitStatusBadge, 
                                    isCompleted 
                                      ? { backgroundColor: '#dcfce7' } 
                                      : (visit.status === 'Cancelled' ? { backgroundColor: '#fee2e2' } : { backgroundColor: '#fef3c7' })
                                  ]}>
                                    <Text style={[
                                      styles.visitStatusBadgeText,
                                      isCompleted 
                                        ? { color: '#15803d' } 
                                        : (visit.status === 'Cancelled' ? { color: '#b91c1c' } : { color: '#b45309' })
                                    ]}>{visit.status}</Text>
                                  </View>
                                </View>

                                {isCompleted || outcomeNotes ? (
                                  <View style={[styles.outcomeReceipt, { backgroundColor: '#ffffff', borderColor: '#bbf7d0', borderWidth: 1 }]}>
                                    <CheckCircle2 size={16} color="#16a34a" />
                                    <Text style={[styles.outcomeReceiptText, { color: '#16a34a', flex: 1 }]}>
                                      Completed {outcomeNotes ? `• Notes: ${outcomeNotes}` : ''}
                                    </Text>
                                  </View>
                                ) : (
                                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' }}>
                                    <TouchableOpacity
                                      style={{
                                        flex: 1.5,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: '#BFB7FD',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#ffffff',
                                      }}
                                      onPress={() => {
                                        setReschedulingVisitId(visit.id);
                                        setVisitDateVal(new Date());
                                        setShowDatePicker(true);
                                      }}
                                    >
                                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#7c3aed', fontFamily: 'Montserrat_700Bold' }}>Reschedule</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={{
                                        flex: 1.5,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        backgroundColor: '#7c3aed',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                      onPress={() =>
                                        handleVisitOutcome(selectedRoomId, visit.id, 'Completed')
                                      }
                                    >
                                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff', fontFamily: 'Montserrat_700Bold' }}>Complete</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: '#f3f4f6',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                      onPress={() => handleWhatsApp(room?.phone_number)}
                                    >
                                      <WhatsAppIcon size={16} color="#25D366" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: '#f3f4f6',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                      onPress={() => handleCall(room?.phone_number)}
                                    >
                                      <Phone size={16} color="#4b5563" />
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>
                            );
                          })}

                          {/* Quick Schedule widget */}
                          <View style={styles.addTaskForm}>
                            <Text style={styles.miniSectionTitle}>Propose Site Visit</Text>
                            <TextInput
                              style={[styles.addTaskInput, { marginBottom: 12 }]}
                              value={visitClient}
                              onChangeText={setVisitClient}
                              placeholder="Client Name (e.g. Arin Jain)"
                              placeholderTextColor="#9ca3af"
                            />
                            
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                              <TouchableOpacity
                                style={{
                                  flex: 1,
                                  height: 44,
                                  borderWidth: 1,
                                  borderColor: '#d1d5db',
                                  borderRadius: 10,
                                  backgroundColor: '#ffffff',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingHorizontal: 12,
                                }}
                                onPress={() => setShowDatePicker(true)}
                              >
                                <Text style={{ fontSize: 13, color: '#1f2937', fontFamily: 'Lato_400Regular' }}>
                                  {visitDateVal.toLocaleDateString()}
                                </Text>
                                <Calendar size={14} color="#BFB7FD" />
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={{
                                  flex: 1,
                                  height: 44,
                                  borderWidth: 1,
                                  borderColor: '#d1d5db',
                                  borderRadius: 10,
                                  backgroundColor: '#ffffff',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingHorizontal: 12,
                                }}
                                onPress={() => setShowTimePicker(true)}
                              >
                                <Text style={{ fontSize: 13, color: '#1f2937', fontFamily: 'Lato_400Regular' }}>
                                  {visitDateVal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Clock size={14} color="#BFB7FD" />
                              </TouchableOpacity>
                            </View>

                            {(showDatePicker || showTimePicker) && (
                              <DateTimePicker
                                value={visitDateVal}
                                mode={showDatePicker ? 'date' : 'time'}
                                display="default"
                                onChange={(event, selectedDate) => {
                                  setShowDatePicker(false);
                                  setShowTimePicker(false);
                                  if (selectedDate) {
                                    setVisitDateVal(selectedDate);
                                    if (reschedulingVisitId) {
                                      const formattedTime = selectedDate.toLocaleDateString() + ' ' + selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                      handleRescheduleVisit(selectedRoomId, reschedulingVisitId, formattedTime);
                                      setReschedulingVisitId(null);
                                    }
                                  }
                                }}
                              />
                            )}

                            <TouchableOpacity
                              style={[styles.addTaskSubmitBtn, { backgroundColor: '#BFB7FD' }]}
                              onPress={() => handleScheduleVisit(selectedRoomId)}
                            >
                              <Text style={styles.addTaskSubmitText}>Schedule Site Visit</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      {activeRoomTab === 'Deal' && (
                        <View style={styles.gap16}>
                          {/* Deal linkage status */}
                          <View style={styles.detailCard}>
                            <Text style={styles.cardSectionTitle}>Linked CRM Deal</Text>
                            {room?.dealId ? (
                              <View style={styles.dealConnectedBox}>
                                <CheckCircle2 size={20} color="#16a34a" />
                                <View style={styles.flex1}>
                                  <Text style={styles.dealConnectedTitle}>Deal ID: BRK-DEAL-{room.dealId}</Text>
                                  <Text style={styles.dealConnectedSubtitle}>Pipeline Stage: In Negotiation</Text>
                                </View>
                              </View>
                            ) : (
                              <View style={styles.dealDisconnectedBox}>
                                <Text style={styles.dealDisconnectedText}>
                                  Visits are confirmed. Move this matched requirement to a live Deal split pipeline.
                                </Text>
                                <TouchableOpacity
                                  style={styles.dealStartBtn}
                                  onPress={() => handleStartDeal(selectedRoomId)}
                                >
                                  <Text style={styles.dealStartBtnText}>Start Deal Split Pipeline</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>

                          {/* Broker Commission splits */}
                          <View style={styles.detailCard}>
                            <Text style={styles.cardSectionTitle}>Brokerage Commission Split</Text>
                            
                            <View style={styles.brokerageHeaderRow}>
                              <DollarSign size={20} color="#7c3aed" />
                              <Text style={styles.brokerageTotal}>Total Split: {room?.split}</Text>
                            </View>

                            <View style={styles.splitRow}>
                              <Text style={styles.splitUser}>You ({room?.yourRole === 'Property-side' ? 'Prop-side' : 'Client-side'})</Text>
                              <Text style={styles.splitVal}>50% Split</Text>
                            </View>
                            <View style={styles.splitRow}>
                              <Text style={styles.splitUser}>{room?.full_name} ({room?.theirRole})</Text>
                              <Text style={styles.splitVal}>50% Split</Text>
                            </View>

                            {room?.commissionStatus === 'Paid' ? (
                              <View style={[styles.outcomeReceipt, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                                <CheckCircle2 size={16} color="#16a34a" />
                                <Text style={[styles.outcomeReceiptText, { color: '#16a34a' }]}>
                                  Brokerage Settled & Paid
                                </Text>
                              </View>
                            ) : (
                              <TouchableOpacity
                                style={styles.settlePaidBtn}
                                onPress={() => handleMarkPaid(selectedRoomId)}
                              >
                                <Text style={styles.settlePaidBtnText}>Mark Commission Paid</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                );
              })()
            ) : selectedRequestId ? (
              
              /* 2. REQUEST NEGOTIATION / DETAILS VIEW */
              (() => {
                const req = requests.find((r) => r.id === selectedRequestId);
                return (
                  <View style={styles.flexContainer}>
                    {/* Header */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 32) + 10 : 60,
                      paddingBottom: 16,
                      paddingHorizontal: 20,
                      backgroundColor: 'white',
                      borderBottomWidth: 1,
                      borderColor: '#e5e7eb',
                      justifyContent: 'space-between',
                    }}>
                      <TouchableOpacity 
                        onPress={() => {
                          if (isCountering) {
                            setIsCountering(false);
                          } else {
                            setSelectedRequestId(null);
                          }
                        }} 
                        style={{ padding: 4 }}
                      >
                        <ArrowLeft size={24} color="#111827" />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>
                        {isCountering ? 'Counter Terms' : 'Connection Request'}
                      </Text>
                      <View style={{ width: 28 }} />
                    </View>

                    <ScrollView style={styles.flexContainer} contentContainerStyle={[styles.scrollContent, { paddingBottom: 180 }]}>
                      <View style={styles.negotiationHeader}>
                        <View style={styles.brokerAvatarLarge}>
                          <Text style={styles.brokerAvatarLargeText}>
                            {req?.full_name?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.negotiationBrokerName}>{req?.full_name}</Text>
                        <Text style={styles.negotiationBrokerArea}>Operating in {req?.operating_area}</Text>
                      </View>

                      <View style={styles.gap16}>
                        {/* Summary of what is matched */}
                        <View style={styles.detailCard}>
                          <Text style={styles.cardSectionTitle}>Opportunity Details</Text>
                          <Text style={styles.oppDesc}>
                            wants to collaborate on: <Text style={styles.boldText}>{req?.target}</Text>
                          </Text>
                          <Text style={styles.oppRole}>
                            Broker Role: <Text style={styles.boldText}>{req?.role}</Text>
                          </Text>
                          <View style={{ height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 }} />
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Region / Locality</Text>
                            <Text style={[styles.infoValue, { fontWeight: '600' }]}>{req?.operating_area || 'Operating Area'}</Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Full Address</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Lock size={12} color="#b45309" />
                              <Text style={[styles.infoValue, { color: '#b45309' }]}>Locked (Accept to view)</Text>
                            </View>
                          </View>
                        </View>

                        {/* Split Terms */}
                        <View style={styles.detailCard}>
                          <Text style={styles.cardSectionTitle}>Proposed Commission Split</Text>
                          
                          {isCountering ? (
                            <View style={styles.counterBox}>
                              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10, fontFamily: 'Montserrat_700Bold' }}>Choose Revised Split:</Text>
                              <View style={{ gap: 8, marginBottom: 16 }}>
                                {['50-50', '60-40', '55-45', '70-30'].map(split => {
                                  const formattedSplit = split.replace('-', '/');
                                  const isSelected = counterSplitVal === formattedSplit;
                                  return (
                                    <TouchableOpacity
                                      key={split}
                                      onPress={() => setCounterSplitVal(formattedSplit)}
                                      style={[{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingVertical: 12,
                                        paddingHorizontal: 14,
                                        borderRadius: 10,
                                        borderWidth: 1.5,
                                        borderColor: '#e5e7eb',
                                        backgroundColor: '#ffffff',
                                      }, isSelected && {
                                        borderColor: '#7c3aed',
                                        backgroundColor: '#f5f3ff',
                                      }]}
                                    >
                                      <Text style={[{
                                        fontSize: 13,
                                        fontWeight: '500',
                                        color: '#111827',
                                        fontFamily: 'Lato_400Regular',
                                      }, isSelected && {
                                        fontWeight: '700',
                                        fontFamily: 'Montserrat_700Bold',
                                      }]}>
                                        {formattedSplit} Split
                                      </Text>
                                      {isSelected && <Check size={16} color="#7c3aed" />}
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, fontFamily: 'Montserrat_700Bold' }}>Add Counter Note:</Text>
                              <TextInput
                                style={{
                                  backgroundColor: '#ffffff',
                                  borderColor: '#e5e7eb',
                                  borderWidth: 1,
                                  borderRadius: 10,
                                  padding: 12,
                                  height: 70,
                                  textAlignVertical: 'top',
                                  fontSize: 13,
                                  fontFamily: 'Lato_400Regular',
                                  color: '#111827',
                                  marginBottom: 16,
                                }}
                                value={counterMessage}
                                onChangeText={setCounterMessage}
                                placeholder="Reason for change..."
                                placeholderTextColor="#9ca3af"
                                multiline
                              />
                              <View style={styles.counterActions}>
                                <TouchableOpacity
                                  style={styles.cancelBtn}
                                  onPress={() => setIsCountering(false)}
                                >
                                  <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.submitCounterBtn}
                                  onPress={submitCounterOffer}
                                >
                                  <Text style={styles.submitCounterText}>Submit Counter</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                              req?.status === 'Countered' ? (
                                <View style={{ width: '100%' }}>
                                  <View style={{
                                    backgroundColor: '#fffbeb',
                                    borderColor: '#fef3c7',
                                    borderWidth: 1,
                                    borderRadius: 12,
                                    padding: 12,
                                    marginBottom: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                  }}>
                                    <AlertTriangle size={16} color="#d97706" />
                                    <Text style={{ fontSize: 13, color: '#b45309', fontFamily: 'Lato_700Bold' }}>
                                      Partner counter-offered this split
                                    </Text>
                                  </View>
                                  <View style={styles.splitDisplayRow}>
                                    <Text style={[styles.currentSplitText, { color: '#d97706', fontWeight: 'bold' }]}>
                                      {req?.proposedSplit} (Counter Offer)
                                    </Text>
                                    <TouchableOpacity
                                      style={[styles.changeSplitBtn, { backgroundColor: '#fef3c7', borderColor: '#fcd34d' }]}
                                      onPress={() => handleCounterRequest(req.id)}
                                    >
                                      <Text style={[styles.changeSplitBtnText, { color: '#d97706' }]}>Counter Back</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              ) : req?.isOutgoing && req?.lastProposedBy === myId ? (
                                <View style={{ width: '100%' }}>
                                  <View style={{
                                    backgroundColor: '#f5f3ff',
                                    borderColor: '#ddd6fe',
                                    borderWidth: 1,
                                    borderRadius: 12,
                                    padding: 12,
                                    marginBottom: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                  }}>
                                    <Check size={16} color="#7c3aed" />
                                    <Text style={{ fontSize: 13, color: '#6d28d9', fontFamily: 'Lato_700Bold' }}>
                                      Your Counter Offer (Waiting for response)
                                    </Text>
                                  </View>
                                  <View style={styles.splitDisplayRow}>
                                    <Text style={[styles.currentSplitText, { color: '#7c3aed', fontWeight: 'bold' }]}>
                                      {req?.proposedSplit}
                                    </Text>
                                  </View>
                                </View>
                              ) : (
                                <View style={styles.splitDisplayRow}>
                                  <Text style={styles.currentSplitText}>{req?.proposedSplit}</Text>
                                  <TouchableOpacity
                                    style={styles.changeSplitBtn}
                                    onPress={() => handleCounterRequest(req.id)}
                                  >
                                    <Text style={styles.changeSplitBtnText}>Counter split</Text>
                                  </TouchableOpacity>
                                </View>
                              )
                          )}
                          
                          {/* Counter Note Display */}
                          {!isCountering && req?.counterNote && (
                            <View style={{
                              backgroundColor: '#f9fafb',
                              borderColor: '#e5e7eb',
                              borderWidth: 1,
                              borderRadius: 10,
                              padding: 12,
                              marginTop: 12,
                            }}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: '#6b7280', fontFamily: 'Montserrat_700Bold', marginBottom: 4 }}>
                                COUNTER NOTE:
                              </Text>
                              <Text style={{ fontSize: 13, color: '#374151', fontFamily: 'Lato_400Regular', fontStyle: 'italic' }}>
                                {req.counterNote}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Unlocks information permissions preview */}
                        <View style={styles.detailCard}>
                          <Text style={styles.cardSectionTitle}>Information Visibility Preview</Text>
                          <View style={styles.unlockItemRow}>
                            <Text style={styles.unlockItemLabel}>Exact Property Address</Text>
                            {req?.unlocks?.address ? (
                              <Unlock size={14} color="#16a34a" />
                            ) : (
                              <Lock size={14} color="#dc2626" />
                            )}
                          </View>
                          <View style={styles.unlockItemRow}>
                            <Text style={styles.unlockItemLabel}>Owner Contact Name/Phone</Text>
                            {req?.unlocks?.ownerContact ? (
                              <Unlock size={14} color="#16a34a" />
                            ) : (
                              <Lock size={14} color="#dc2626" />
                            )}
                          </View>
                        </View>

                      </View>
                    </ScrollView>

                    {/* Fixed Bottom Container for Decision actions */}
                    {!isCountering && (
                      <View style={styles.fixedBottomContainer}>
                        {req?.isOutgoing && req?.status !== 'Countered' ? (
                          <View style={{ padding: 16, alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', width: '100%' }}>
                            <Text style={{ fontSize: 13, color: '#4b5563', fontFamily: 'Montserrat_600SemiBold', textAlign: 'center' }}>
                              Waiting for the partner broker to accept or counter this request.
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.decisionActions}>
                            <TouchableOpacity
                              style={styles.declineFinalBtn}
                              onPress={() => {
                                handleRejectRequest(req.id);
                                setSelectedRequestId(null);
                              }}
                            >
                              <Text style={styles.declineFinalBtnText}>Decline Request</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.acceptFinalBtn}
                              onPress={() => {
                                handleAcceptRequest(req.id);
                                setSelectedRequestId(null);
                              }}
                            >
                              <Text style={styles.acceptFinalBtnText}>Accept & Unlock</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })()
            ) : selectedMatchId ? (
              (() => {
                const match = matches.find((m) => m.id === selectedMatchId);
                return (
                  <View style={styles.flexContainer}>
                    {/* Header */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 25 : 60,
                      paddingBottom: 16,
                      paddingHorizontal: 20,
                      backgroundColor: 'white',
                      borderBottomWidth: 1,
                      borderColor: '#e5e7eb',
                      justifyContent: 'space-between',
                    }}>
                      <TouchableOpacity 
                        onPress={() => {
                          if (selectedMatchStep === 'request') {
                            setSelectedMatchStep('detail');
                          } else {
                            setSelectedMatchId(null);
                          }
                        }} 
                        style={{ padding: 4 }}
                      >
                        <ArrowLeft size={24} color="#111827" />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>
                        {selectedMatchStep === 'request' ? 'Split Details' : (match?.type === 'properties' ? 'Client Details' : 'Property Details')}
                      </Text>
                      <View style={{ width: 28 }} />
                    </View>

                    {selectedMatchStep === 'detail' ? (
                      <View style={styles.flexContainer}>
                        <ScrollView style={styles.flexContainer} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                          {/* Broker Info Card */}
                          <View style={{
                            backgroundColor: 'white',
                            borderColor: '#e5e7eb',
                            borderWidth: 1,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 12,
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                              <View style={{
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                backgroundColor: '#f3f4f6',
                                alignItems: 'center',
                                justifyContainer: 'center',
                                justifyContent: 'center',
                              }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#6b7280', fontFamily: 'Montserrat_700Bold' }}>
                                  {match?.initial || match?.broker?.slice(0, 2).toUpperCase()}
                                </Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>{match?.broker}</Text>
                                <Text style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Lato_400Regular' }}>Verified Broker • Mumbai</Text>
                              </View>
                            </View>

                            <View style={{
                              backgroundColor: '#f3e8ff',
                              borderColor: '#e9d5ff',
                              borderWidth: 1,
                              borderRadius: 10,
                              padding: 10,
                              flexDirection: 'row',
                              gap: 8,
                              alignItems: 'center',
                            }}>
                              <Shield size={16} color="#7c3aed" />
                              <Text style={{ fontSize: 11, color: '#6b21a8', fontWeight: '500', flex: 1, fontFamily: 'Lato_400Regular' }}>
                                Contact details will be unlocked after the request is accepted.
                              </Text>
                            </View>
                          </View>

                          {/* Details Grid */}
                          <View style={{
                            backgroundColor: 'white',
                            borderColor: '#e5e7eb',
                            borderWidth: 1,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 12,
                          }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 12, fontFamily: 'Montserrat_700Bold' }}>
                              {match?.type === 'properties' ? 'Client Specifications' : 'Property Specifications'}
                            </Text>
                            <View style={{ gap: 12 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Lato_400Regular', width: '30%' }}>BHK</Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold', width: '70%', textAlign: 'right' }}>{match?.bhk || '2 BHK'}</Text>
                              </View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Lato_400Regular', width: '30%' }}>Budget</Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold', width: '70%', textAlign: 'right' }}>{match?.price || '₹75-90 L'}</Text>
                              </View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Lato_400Regular', width: '30%' }}>Locality</Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold', width: '70%', textAlign: 'right' }}>{match?.loc || 'Andheri East'}</Text>
                              </View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Lato_400Regular', width: '30%' }}>Property Type</Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold', width: '70%', textAlign: 'right' }}>Residential Flat</Text>
                              </View>
                            </View>
                          </View>

                          {/* Match Score Card */}
                          <View style={{
                            backgroundColor: 'white',
                            borderColor: '#e5e7eb',
                            borderWidth: 1,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 30,
                          }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1f2937', fontFamily: 'Montserrat_700Bold' }}>Match Score</Text>
                              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#7c3aed', fontFamily: 'Montserrat_700Bold' }}>{match?.compatibility || 91}%</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                              <View style={{ height: '100%', backgroundColor: '#7c3aed', borderRadius: 3, width: `${match?.compatibility || 91}%` }} />
                            </View>
                            <Text style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Lato_400Regular' }}>Budget, locality, and BHK all match</Text>
                          </View>
                        </ScrollView>

                        {/* Bottom Actions */}
                        <View style={{
                          paddingHorizontal: 20,
                          paddingBottom: 24,
                          paddingTop: 12,
                          backgroundColor: '#ffffff',
                          borderTopWidth: 1,
                          borderColor: '#f3f4f6',
                          flexDirection: 'row',
                          gap: 10,
                        }}>
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              paddingVertical: 16,
                              borderRadius: 14,
                              backgroundColor: '#BFB7FD',
                              alignItems: 'center',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                            onPress={() => setSelectedMatchStep('request')}
                          >
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff', fontFamily: 'Montserrat_700Bold' }}>Proceed to Split Details</Text>
                            <Send size={16} color="white" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{
                              flex: 1.2,
                              paddingVertical: 16,
                              borderRadius: 14,
                              backgroundColor: '#16a34a',
                              alignItems: 'center',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                            onPress={() => {
                              onClose();
                              setTimeout(() => {
                                router.push('/deal-page');
                              }, 100);
                            }}
                          >
                            <CheckCircle2 size={16} color="white" />
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff', fontFamily: 'Montserrat_700Bold' }}>Interested (Deal)</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.flexContainer}>
                        <ScrollView style={styles.flexContainer} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                          {/* Target Broker Name Card */}
                          <View style={{
                            backgroundColor: '#f5f3ff',
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 20,
                          }}>
                            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 4, fontFamily: 'Lato_400Regular' }}>Sending Request To</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>{match?.broker}</Text>
                          </View>

                          {/* Split Options Picker */}
                          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 12, fontFamily: 'Montserrat_700Bold' }}>Choose Commission Split</Text>
                          <View style={{ gap: 10, marginBottom: 20 }}>
                            {['50-50', '60-40', '55-45', '70-30'].map(split => {
                              const isSelected = selectedMatchSplit === split;
                              const formattedSplit = split.replace('-', '/');
                              return (
                                <TouchableOpacity
                                  key={split}
                                  onPress={() => setSelectedMatchSplit(split)}
                                  style={[{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingVertical: 14,
                                    paddingHorizontal: 16,
                                    borderRadius: 12,
                                    borderWidth: 1.5,
                                    borderColor: '#e5e7eb',
                                    backgroundColor: '#ffffff',
                                  }, isSelected && {
                                    borderColor: '#7c3aed',
                                    backgroundColor: '#f5f3ff',
                                  }]}
                                >
                                  <Text style={[{
                                    fontSize: 14,
                                    fontWeight: '500',
                                    color: '#111827',
                                    fontFamily: 'Lato_400Regular',
                                  }, isSelected && {
                                    fontWeight: '700',
                                    fontFamily: 'Montserrat_700Bold',
                                  }]}>
                                    {formattedSplit} Split
                                  </Text>
                                  {isSelected && <Check size={18} color="#7c3aed" />}
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                          {/* Message input */}
                          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 12, fontFamily: 'Montserrat_700Bold' }}>Message (Optional)</Text>
                          <TextInput
                            value={matchRequestMessage}
                            onChangeText={setMatchRequestMessage}
                            placeholder="Write a message (optional)..."
                            placeholderTextColor="#9ca3af"
                            style={{
                              backgroundColor: '#ffffff',
                              borderColor: '#e5e7eb',
                              borderWidth: 1,
                              borderRadius: 12,
                              padding: 14,
                              height: 80,
                              textAlignVertical: 'top',
                              fontSize: 14,
                              fontFamily: 'Lato_400Regular',
                              color: '#111827',
                              marginBottom: 20,
                            }}
                            multiline
                          />

                          {/* Warning notice */}
                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 12, color: '#b45309', fontFamily: 'Lato_400Regular' }}>
                              ⓘ Exact details will be unlocked only after the request is accepted.
                            </Text>
                          </View>
                        </ScrollView>

                        {/* Sticky Confirm button */}
                        <View style={{
                          paddingHorizontal: 20,
                          paddingBottom: 24,
                          paddingTop: 12,
                          backgroundColor: '#ffffff',
                          borderTopWidth: 1,
                          borderColor: '#f3f4f6',
                        }}>
                          <TouchableOpacity
                            style={{
                              width: '100%',
                              paddingVertical: 16,
                              borderRadius: 14,
                              backgroundColor: '#BFB7FD',
                              alignItems: 'center',
                            }}
                            onPress={() => handleConfirmMatchRequest(match)}
                          >
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', fontFamily: 'Montserrat_700Bold' }}>Confirm & Send Request</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })()
            ) : (
                        /* 3. MAIN COLLABORATION HUB SCREEN */
              <View style={styles.flexContainer}>
                <View style={styles.header}>
                  <View style={styles.headerTitleRow}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton} activeOpacity={0.7}>
                      <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                      <Text style={styles.collabScreenTitle}>Collaboration</Text>
                      <Text style={styles.collabScreenSubtitle}>Match supply and demand, then close together</Text>
                    </View>
                  </View>
                </View>

                {/* Summary Statistics Section (Overlay card style) */}
                <View style={styles.statsCardGrid}>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatNum}>{requests.length}</Text>
                    <Text style={styles.miniStatLabel}>Requests</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatNum}>
                      {activeRooms.filter((r) => r.stage !== 'Closed').length}
                    </Text>
                    <Text style={styles.miniStatLabel}>Active Rooms</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatNum}>
                      {activeRooms.filter((r) => r.stage === 'Closed').length}
                    </Text>
                    <Text style={styles.miniStatLabel}>Closed</Text>
                  </View>
                </View>

                {/* Segmented Tab selectors */}
                <View style={styles.hubTabContainer}>
                  {['requests', 'active'].map((t) => {
                    const isActive = activeTab === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={styles.hubTabLink}
                        onPress={() => setActiveTab(t)}
                      >
                        <Text style={[styles.hubTabLinkText, isActive && styles.activeHubTabLinkText]}>
                          {t === 'requests' ? 'Requests' : 'Active'}
                        </Text>
                        {isActive && <View style={styles.hubTabActiveIndicator} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Scrollable list content */}
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >

                  {/* REQUESTS LIST VIEW */}
                  {activeTab === 'requests' && (
                    <View style={styles.gap12}>
                      {/* Sub-toggle row for Requests */}
                      <View style={styles.matchSubTabToggleRow}>
                        <TouchableOpacity
                          style={[
                            styles.matchSubTabPill,
                            requestsSubTab === 'incoming' && styles.matchSubTabPillActive,
                          ]}
                          onPress={() => setRequestsSubTab('incoming')}
                        >
                          <Text
                            style={[
                              styles.matchSubTabPillText,
                              requestsSubTab === 'incoming' && styles.matchSubTabPillTextActive,
                            ]}
                          >
                            Received
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.matchSubTabPill,
                            requestsSubTab === 'outgoing' && styles.matchSubTabPillActive,
                          ]}
                          onPress={() => setRequestsSubTab('outgoing')}
                        >
                          <Text
                            style={[
                              styles.matchSubTabPillText,
                              requestsSubTab === 'outgoing' && styles.matchSubTabPillTextActive,
                            ]}
                          >
                            Sent
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.sectionSubtitle}>
                        {requestsSubTab === 'incoming' ? 'Collaboration Proposals Received' : 'Collaboration Proposals Sent & Counter Offers'}
                      </Text>

                      {(() => {
                        const filteredRequests = requests.filter(req => 
                          requestsSubTab === 'incoming' 
                            ? !req.isOutgoing 
                            : req.isOutgoing
                        );

                        return filteredRequests.length > 0 ? (
                          filteredRequests.map((req) => {
                            const isCountered = req.status === 'Countered';
                            return (
                              <TouchableOpacity
                                key={req.id}
                                style={[
                                  styles.requestCard,
                                  isCountered && {
                                    borderColor: '#f59e0b',
                                    backgroundColor: '#fffdf5',
                                    borderWidth: 1.5,
                                  }
                                ]}
                                onPress={() => setSelectedRequestId(req.id)}
                              >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
                                  <View style={[styles.requestHeader, { flex: 1 }]}>
                                    <View style={styles.avatar}>
                                      <Text style={styles.avatarText}>
                                        {req.full_name?.charAt(0).toUpperCase()}
                                      </Text>
                                    </View>
                                    <View style={[styles.requestMetaInfo, { flex: 1 }]}>
                                      <Text style={styles.requestName} numberOfLines={1}>{req.full_name}</Text>
                                      <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Lato_400Regular' }}>Version {req.version}</Text>
                                    </View>
                                  </View>
                                  
                                  <View style={{
                                    backgroundColor: isCountered ? '#fef3c7' : '#eff6ff',
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: isCountered ? '#fcd34d' : '#bfdbfe',
                                  }}>
                                    <Text style={{
                                      fontSize: 10,
                                      fontWeight: '700',
                                      color: isCountered ? '#d97706' : '#1d4ed8',
                                      fontFamily: 'Montserrat_700Bold'
                                    }}>
                                      {isCountered ? 'COUNTER OFFER' : 'NEW'}
                                    </Text>
                                  </View>
                                </View>

                                <Text style={styles.requestDetailsText}>
                                  Wants to collaborate on: <Text style={styles.boldText}>{req.target}</Text>
                                </Text>
                                <Text style={styles.requestDetailsText}>
                                  Commission Split: <Text style={styles.boldText}>{req.proposedSplit}</Text>
                                </Text>
                                
                                {req.message && (
                                  <Text style={[styles.requestMsgSnippet, isCountered && { color: '#b45309' }]} numberOfLines={2}>
                                    &quot;{req.message}&quot;
                                  </Text>
                                )}
                                
                                <View style={[styles.tapToReviewRow, isCountered && { borderTopColor: '#fef3c7', borderTopWidth: 1 }]}>
                                  <Text style={[styles.tapToReviewText, isCountered && { color: '#d97706', fontWeight: 'bold' }]}>
                                    {isCountered ? 'Revised split proposed. Tap to review terms' : 'Tap to Accept, Decline or Counter'}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })
                        ) : (
                          <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No proposals in this section</Text>
                          </View>
                        );
                      })()}
                    </View>
                  )}

                  {/* ACTIVE ROOMS LIST VIEW */}
                  {activeTab === 'active' && (
                    <View style={styles.gap12}>
                      <Text style={styles.sectionSubtitle}>Shared Workspaces</Text>
                      {activeRooms.length > 0 ? (
                        activeRooms.map((room) => (
                          <TouchableOpacity
                            key={room.id}
                            style={styles.roomListItem}
                            onPress={() => {
                              if (room.stage === 'Deal') {
                                onClose();
                                setTimeout(() => {
                                  router.push('/deal-page');
                                }, 100);
                              } else {
                                setSelectedRoomId(room.id);
                                setActiveRoomTab('Overview');
                              }
                            }}
                          >
                            <View style={styles.roomListItemHeader}>
                              <View style={styles.avatarBg}>
                                <Text style={styles.avatarText}>
                                  {room.full_name?.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.flex1}>
                                <Text style={styles.roomListBrokerName}>{room.full_name}</Text>
                                <Text style={styles.roomListDetails}>{room.property}</Text>
                                <Text style={styles.roomListMeta}>Split: {room.split} • Pipeline: {room.stage === 'Visit' ? 'Active' : (room.stage === 'Deal' ? 'Deal' : room.stage)}</Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <TouchableOpacity 
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleCloseCollaboration(room.id);
                                  }}
                                  style={{ padding: 8 }}
                                >
                                  <Trash2 size={18} color="#ef4444" />
                                </TouchableOpacity>
                                <View style={styles.nextActionArrow}>
                                  <Text style={styles.nextActionArrowText}>→</Text>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.emptyState}>
                          <Text style={styles.emptyStateText}>No active collaborations yet</Text>
                        </View>
                      )}
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={40} color="#16a34a" />
              </View>
            </View>
            <Text style={styles.successTitle}>Request Sent!</Text>
            <Text style={styles.successMessage}>
              Invite successfully submitted. You will be notified once they accept the terms.
            </Text>
            <View style={styles.brokerDetailsBox}>
              <View style={styles.brokerDetailRow}>
                <Text style={styles.brokerDetailLabel}>Broker:</Text>
                <Text style={styles.brokerDetailValue}>{successData.name}</Text>
              </View>
              <View style={styles.brokerDetailRow}>
                <Text style={styles.brokerDetailLabel}>Phone:</Text>
                <Text style={styles.brokerDetailValue}>{successData.phone}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.doneButton} onPress={closeSuccessModal}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    //backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    flex: 1,
    overflow: 'hidden',
  },
  flexContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 25 : 60,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 99,
    marginRight: 12,
  },
  collabScreenTitle: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '700',
  },
  collabScreenSubtitle: {
    fontSize: 13,
    fontFamily: 'Lato_400Regular',
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 15,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  activeIndicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  activeLabel: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },
  callRoundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Pipeline tracker
  pipelineBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  pipelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  pipelineCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pipelineCircleActive: {
    backgroundColor: '#7c3aed',
  },
  pipelineNum: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
  },
  pipelineText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
  },
  pipelineTextActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },

  // Tabs
  subTabScrollWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  roomTabs: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  roomTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  activeRoomTab: {
    backgroundColor: '#7c3aed',
  },
  roomTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  activeRoomTabText: {
    color: '#ffffff',
  },

  statsCardGrid: {
  flexDirection: 'row',
  backgroundColor: '#ffffff',
  padding: 10,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#e5e7eb',
  marginHorizontal: 20,
  marginTop: 16,
  justifyContent: 'space-between',
  gap: 6,
},
  miniStatBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: '23.5%',
    flexGrow: 1,
    flexShrink: 1,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 62,
  },
  miniStatNum: {
    fontSize: 18,
    //fontFamily: 'Montserrat_700Bold',
    color: '#1f2937',
    fontWeight: '600',
    top: -2,
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
    marginTop: 2,
    textAlign: 'center',
  },

  // Segmented Tabs -> Custom flat underlined tabs style
  hubTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderColor: '#f1f5f9',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 2,
  },
  hubTabLink: {
    flex: 1,
    paddingVertical: 10,
    position: 'relative',
    alignItems: 'center',
  },
  hubTabLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
  },
  activeHubTabLinkText: {
    color: '#314e86',
  },
  hubTabActiveIndicator: {
    position: 'absolute',
    bottom: -1.5,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#BFB7FD',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // General helpers
  flex1: {
    flex: 1,
  },
  gap12: {
    gap: 12,
  },
  gap16: {
    gap: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 4,
  },

  // Detail Cards
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  lockedText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },

  // Next action box
  nextActionBox: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 16,
    padding: 16,
  },
  nextActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 6,
  },
  nextActionDesc: {
    fontSize: 13,
    color: '#581c87',
    lineHeight: 18,
  },

  // Matches list
  matchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 8,
  },
  matchBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  freshnessBadge: {
    backgroundColor: '#faf5ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freshnessText: {
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: '700',
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  matchMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  matchBroker: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  matchRequirement: {
    fontSize: 12,
    color: '#9ca3af',
  },
  matchActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  matchActionOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchActionSolid: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchActionTextDark: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  matchActionTextLight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
  },

  // Requests
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 10,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ddd6fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ddd6fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
  },
  requestMetaInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  requestStatusLabel: {
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: '600',
  },
  requestDetailsText: {
    fontSize: 13,
    color: '#4b5563',
  },
  requestMsgSnippet: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 8,
  },
  tapToReviewRow: {
    borderTopWidth: 1,
    borderColor: '#f3f4f6',
    paddingTop: 8,
    alignItems: 'center',
  },
  tapToReviewText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },

  // Active rooms list
  roomListItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  roomListItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomListBrokerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  roomListDetails: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  roomListMeta: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  nextActionArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextActionArrowText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '700',
  },

  // Chat Tab view
  chatWrapper: {
    height: 380,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  chatScroll: {
    flex: 1,
    padding: 12,
  },
  chatContent: {
    gap: 12,
    paddingBottom: 20,
  },
  chatBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    maxWidth: '80%',
  },
  bubbleYou: {
    backgroundColor: '#7c3aed',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  bubbleThem: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  chatTextYou: {
    fontSize: 13,
    color: '#ffffff',
  },
  chatTextThem: {
    fontSize: 13,
    color: '#1f2937',
  },
  chatTime: {
    fontSize: 9,
    color: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#1f2937',
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#BFB7FD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Task checklist
  taskList: {
    gap: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleCompleted: {
    backgroundColor: '#BFB7FD',
    borderColor: '#BFB7FD',
  },
  taskTextInfo: {
    flex: 1,
  },
  taskItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  taskItemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  tagLabel: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagLabelText: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '700',
  },
  taskAssignee: {
    fontSize: 10,
    color: '#9ca3af',
  },

  // Add Task widget
  addTaskForm: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginTop: 8,
  },
  addTaskInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
  },
  addTaskMetaOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  visibilityToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  visibilityToggleActive: {
    backgroundColor: '#ddd6fe',
  },
  visibilityToggleText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '600',
  },
  addTaskSubmitBtn: {
    backgroundColor: '#BFB7FD',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  addTaskSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Visits
  visitCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  visitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  visitDetailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  visitStatusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  visitStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
  },
  outcomeReceipt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  outcomeReceiptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  visitActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  visitActionOutline: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  visitActionSolid: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  visitActionTextDark: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  visitActionTextLight: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  miniSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },

  // Deal linkage Box
  dealConnectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  dealConnectedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  dealConnectedSubtitle: {
    fontSize: 12,
    color: '#15803d',
  },
  dealDisconnectedBox: {
    gap: 10,
  },
  dealDisconnectedText: {
    fontSize: 13,
    color: '#6b7280',
  },
  dealStartBtn: {
    backgroundColor: '#BFB7FD',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  dealStartBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Commission Info splits
  brokerageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#faf5ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  brokerageTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  splitUser: {
    fontSize: 13,
    color: '#4b5563',
  },
  splitVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  settlePaidBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  settlePaidBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Negotiations Header
  negotiationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brokerAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ddd6fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brokerAvatarLargeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7c3aed',
  },
  negotiationBrokerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  negotiationBrokerArea: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  oppDesc: {
    fontSize: 13,
    color: '#4b5563',
  },
  oppRole: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 4,
  },
  splitDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentSplitText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7c3aed',
  },
  changeSplitBtn: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeSplitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },

  // Counter inputs
  counterBox: {
    gap: 8,
  },
  counterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  counterInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1f2937',
    backgroundColor: '#fafafa',
  },
  counterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  submitCounterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
  },
  submitCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Unlock visibility item
  unlockItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
  },
  unlockItemLabel: {
    fontSize: 13,
    color: '#4b5563',
  },

  // Decision final
  decisionActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  declineFinalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
  },
  declineFinalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  acceptFinalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#BFB7FD',
    alignItems: 'center',
  },
  acceptFinalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Add Invitation Form
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  addForm: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
  },
  continueButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  continueButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Network cards
  networkCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  networkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brokerAvatarBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  networkArea: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  connectBtn: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  connectBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
  },

  // Success Overlay
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  brokerDetailsBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 20,
  },
  brokerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  brokerDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  brokerDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
  doneButton: {
    backgroundColor: '#BFB7FD',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  // Matches Tab Sub-toggles (Page 17 mock layout)
  matchSubTabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 8,
  },
  matchSubTabPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchSubTabPillActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  matchSubTabPillText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  matchSubTabPillTextActive: {
    color: '#1f2937',
  },
  matchesHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  sectionSubtitleStrong: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4b5563',
  },
  filterLinkText: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '700',
  },
  percentBadgeGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  percentBadgeBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  percentTextGreen: {
    color: '#16a34a',
  },
  percentTextBlue: {
    color: '#1d4ed8',
  },
  matchInnerBox: {
    marginVertical: 4,
    gap: 2,
  },
  // Match Detail Sub-View Styles
  matchDetailHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 25 : 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  matchDetailTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 32,
  },
  matchDetailSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  matchDetailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
  },
  matchDetailCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  matchDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  matchDetailLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  matchDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  matchDetailValueGreen: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  matchDetailValueOrange: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d97706',
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 58,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
});