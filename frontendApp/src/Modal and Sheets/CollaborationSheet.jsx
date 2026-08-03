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
} from 'react-native';
import {
  Check,
  Phone,
  Plus,
  X,
  Calendar,
  DollarSign,
  ArrowLeft,
  Send,
  CheckCircle2,
  Lock,
  Unlock,
  Shield,
} from 'lucide-react-native';
import { showToast } from '../utils/toast';
import WhatsAppIcon from '../Components/WhatsAppIcon';

export default function CollaborationSheet({ isOpen, onClose }) {
  // Main navigation tabs: 'matches' | 'requests' | 'active' | 'network'
  const [activeTab, setActiveTab] = useState('matches');
  const [matchSubTab, setMatchSubTab] = useState('clients'); // 'clients' | 'properties'
  
  // Transition states for sub-views
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [isCountering, setIsCountering] = useState(false);

  // Network add broker form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ name: '', phone: '' });

  // ----------------------------------------------------
  // LOCAL MOCK STATE DATA (FOR HIGHEST FIDELITY CRM FLOW)
  // ----------------------------------------------------
  
  // 1. Matches State
  const [matches, setMatches] = useState([
    {
      id: 201,
      compatibility: 92,
      freshness: 'Fresh today',
      type: 'clients',
      title: '3 BHK Apartment · Nipania',
      budget: '₹82L',
      moveInStatus: 'Ready to move',
      size: '1450 sq.ft.',
      broker: 'Amit Verma',
      verified: true,
      responseRate: '93% response'
    },
    {
      id: 202,
      compatibility: 88,
      freshness: '2 days ago',
      type: 'properties',
      title: 'Commercial Showroom · Vijay Nagar',
      budget: '₹1.5Cr',
      moveInStatus: 'Ready to move',
      size: '2200 sq.ft.',
      broker: 'Deepika Mall',
      verified: true,
      responseRate: '95% response'
    }
  ]);

  // 2. Connection Requests & Negotiations State
  const [requests, setRequests] = useState([
    {
      id: 101,
      full_name: 'Suresh Patel',
      phone_number: '9765432100',
      operating_area: 'Ujjain, MP',
      role: 'Client-side',
      target: 'Gokuldham - Vijay Nagar',
      proposedSplit: '50/50',
      status: 'New',
      version: 1,
      unlocks: { address: true, ownerContact: false, documents: true },
      message: 'Hi, I have a client extremely interested in your Gokuldham property. Let\'s collaborate!'
    },
    {
      id: 102,
      full_name: 'Neha Joshi',
      phone_number: '9654321009',
      operating_area: 'Indore, MP',
      role: 'Property-side',
      target: 'Buyer 3 BHK - Nipania',
      proposedSplit: '40/60',
      status: 'Countered',
      version: 2,
      unlocks: { address: true, ownerContact: true, documents: false },
      message: 'Counter proposal: Property-side broker will handle owner calls and site visits.'
    }
  ]);

  // 3. Active Collaboration Rooms State
  const [activeRooms, setActiveRooms] = useState([
    {
      id: 1,
      full_name: 'Rahul Sharma',
      phone_number: '9876543210',
      operating_area: 'Indore, MP',
      property: 'Gokuldham - Vijay Nagar',
      client: 'Arin Jain (Client of Rahul)',
      yourRole: 'Property-side',
      theirRole: 'Client-side',
      split: '50/50',
      stage: 'Visit', // 'Matched' | 'Accepted' | 'Visit' | 'Deal' | 'Paid'
      commissionStatus: 'Pending', // 'Pending' | 'Paid' | 'Disputed'
      dealId: null,
      unlocked: { address: true, ownerContact: true, documents: false, clientPhone: false }
    },
    {
      id: 2,
      full_name: 'Priya Mehta',
      phone_number: '9812345678',
      operating_area: 'Bhopal, MP',
      property: 'Luxury Villa - Nipania',
      client: 'Karan Singh (Your Client)',
      yourRole: 'Client-side',
      theirRole: 'Property-side',
      split: '60/40',
      stage: 'Deal',
      commissionStatus: 'Pending',
      dealId: 44,
      unlocked: { address: true, ownerContact: true, documents: true, clientPhone: true }
    }
  ]);

  // 4. Broker Network Directory Search List
  const [networkBrokers] = useState([
    { id: 11, full_name: 'Amit Verma', phone_number: '9988776655', operating_area: 'Indore, MP' },
    { id: 12, full_name: 'Deepika Mall', phone_number: '9123456780', operating_area: 'Ujjain, MP' },
    { id: 13, full_name: 'Vikram Seth', phone_number: '9827364510', operating_area: 'Bhopal, MP' },
  ]);

  // 5. Shared Messages / Chat logs
  const [chats, setChats] = useState({
    1: [
      { id: 1, sender: 'them', text: 'Hey, thanks for accepting. Let\'s schedule a site visit for Arin Jain.', time: '11:20 AM' },
      { id: 2, sender: 'you', text: 'Sure! I will check the owner availability for today 4 PM.', time: '11:25 AM' },
    ],
    2: [
      { id: 1, sender: 'them', text: 'Villa papers are verified. Let\'s draft the Token agreement.', time: 'Yesterday' },
      { id: 2, sender: 'you', text: 'Perfect. Generating milestones invoice.', time: 'Yesterday' },
    ]
  });

  // 6. Shared Tasks State
  const [sharedTasks, setSharedTasks] = useState({
    1: [
      { id: 501, title: 'Confirm client visit timing', visibility: 'Shared', completed: true, assignedTo: 'Deepika' },
      { id: 502, title: 'Share Gokuldham layout PDF', visibility: 'Shared', completed: false, assignedTo: 'Rahul' },
      { id: 503, title: 'Call owner regarding price flexibility', visibility: 'Private', completed: false, assignedTo: 'You' },
    ],
    2: [
      { id: 601, title: 'Prepare Token Draft Agreement', visibility: 'Shared', completed: true, assignedTo: 'Priya' },
      { id: 602, title: 'Collect token payment proof', visibility: 'Shared', completed: false, assignedTo: 'You' },
    ]
  });

  // 7. Shared Visits State
  const [sharedVisits, setSharedVisits] = useState({
    1: [
      { id: 701, time: 'Today - 4:00 PM', status: 'Confirmed', client: 'Arin Jain', property: 'Gokuldham', outcome: null },
    ],
    2: [
      { id: 702, time: '3 days ago', status: 'Completed', client: 'Karan Singh', property: 'Luxury Villa', outcome: 'Interested' }
    ]
  });

  // State controls for chat messaging
  const [newMsgText, setNewMsgText] = useState('');
  const scrollViewRef = useRef();

  // State controls for adding a new task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskVisibility, setNewTaskVisibility] = useState('Shared');

  // State controls for scheduling a visit
  const [visitTime, setVisitTime] = useState('Tomorrow - 2:00 PM');
  const [visitClient, setVisitClient] = useState('Arin Jain');

  // State controls for countering split/negotiations
  const [counterSplitVal, setCounterSplitVal] = useState('50/50');
  const [counterMessage, setCounterMessage] = useState('');

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------
  const handleAcceptRequest = (reqId) => {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;

    // Create a new active collaboration room
    const newRoom = {
      id: activeRooms.length + 1,
      full_name: req.full_name,
      phone_number: req.phone_number,
      operating_area: req.operating_area,
      property: req.target,
      client: req.role === 'Client-side' ? 'Client of Suresh (Anonymous)' : 'Your Client',
      yourRole: req.role === 'Client-side' ? 'Property-side' : 'Client-side',
      theirRole: req.role,
      split: req.proposedSplit,
      stage: 'Accepted',
      commissionStatus: 'Pending',
      dealId: null,
      unlocked: { ...req.unlocks, clientPhone: false }
    };

    setActiveRooms((prev) => [newRoom, ...prev]);
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast.success(`Collaboration with ${req.full_name} accepted!`);
  };

  const handleRejectRequest = (reqId) => {
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast.info('Collaboration proposal declined.');
  };

  const handleCounterRequest = (reqId) => {
    const req = requests.find((r) => r.id === reqId);
    if (req) {
      setCounterSplitVal(req.proposedSplit);
      setSelectedRequestId(reqId);
      setIsCountering(true);
    }
  };

  const submitCounterOffer = () => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === selectedRequestId) {
          return {
            ...r,
            proposedSplit: counterSplitVal,
            message: counterMessage || 'Counter proposed with revised commission split.',
            version: r.version + 1,
            status: 'Countered'
          };
        }
        return r;
      })
    );
    setIsCountering(false);
    setSelectedRequestId(null);
    showToast.success('Counter proposal sent successfully!');
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

  // Add Message to Room Chat
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
  const handleToggleTask = (roomId, taskId) => {
    setSharedTasks((prev) => ({
      ...prev,
      [roomId]: prev[roomId].map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  // Add New Task
  const handleAddTask = (roomId) => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      visibility: newTaskVisibility,
      completed: false,
      assignedTo: newTaskVisibility === 'Private' ? 'You' : 'Shared',
    };
    setSharedTasks((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newTask],
    }));
    setNewTaskTitle('');
    showToast.success('Task added successfully!');
  };

  // Schedule New Visit
  const handleScheduleVisit = (roomId) => {
    const newVisit = {
      id: Date.now(),
      time: visitTime,
      status: 'Confirmed',
      client: visitClient,
      property: 'Gokuldham Apartment',
      outcome: null,
    };
    setSharedVisits((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newVisit],
    }));
    showToast.success('Site visit scheduled!');
  };

  // Complete Visit Outcome
  const handleVisitOutcome = (roomId, visitId, outcome) => {
    setSharedVisits((prev) => ({
      ...prev,
      [roomId]: prev[roomId].map((v) => (v.id === visitId ? { ...v, outcome, status: 'Completed' } : v)),
    }));
    
    // Auto advance Room stage if client is interested
    if (outcome === 'Interested') {
      setActiveRooms((prev) =>
        prev.map((room) => (room.id === roomId ? { ...room, stage: 'Deal' } : room))
      );
    }
    showToast.success(`Visit marked complete: ${outcome}`);
  };

  // Close Collab room & Mark Paid
  const handleMarkPaid = (roomId) => {
    setActiveRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, stage: 'Paid', commissionStatus: 'Paid' } : room
      )
    );
    showToast.success('Commission split finalized and settled!');
  };

  // Start Deal flow mock
  const handleStartDeal = (roomId) => {
    setActiveRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, stage: 'Deal', dealId: 99 } : room))
    );
    showToast.success('Deal linkage initialized. Lead moved to In-Process!');
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
                const room = activeRooms.find((r) => r.id === selectedRoomId);
                const roomChats = chats[selectedRoomId] || [];
                const roomTasks = sharedTasks[selectedRoomId] || [];
                const roomVisits = sharedVisits[selectedRoomId] || [];

                return (
                  <View style={styles.flexContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                      <TouchableOpacity
                        onPress={() => setSelectedRoomId(null)}
                        style={styles.backButton}
                      >
                        <ArrowLeft size={18} color="#374151" />
                      </TouchableOpacity>
                      <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{room?.full_name}</Text>
                        <View style={styles.activeIndicatorBox}>
                          <View style={styles.greenDot} />
                          <Text style={styles.activeLabel}>Active Room</Text>
                        </View>
                      </View>
                      <View style={styles.headerActionsRow}>
                        <TouchableOpacity
                          onPress={() => handleWhatsApp(room?.phone_number)}
                          style={[styles.callRoundBtn, { marginRight: 8 }]}
                        >
                          <WhatsAppIcon size={14} color="#25D366" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleCall(room?.phone_number)}
                          style={styles.callRoundBtn}
                        >
                          <Phone size={14} color="#4b5563" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Timeline Tracker */}
                    <View style={styles.pipelineBar}>
                      {['Matched', 'Accepted', 'Visit', 'Deal', 'Paid'].map((stg, i) => {
                        const stages = ['Matched', 'Accepted', 'Visit', 'Deal', 'Paid'];
                        const activeIdx = stages.indexOf(room?.stage);
                        const currentIdx = stages.indexOf(stg);
                        const isDone = currentIdx <= activeIdx;

                        return (
                          <View key={stg} style={styles.pipelineStep}>
                            <View
                              style={[
                                styles.pipelineCircle,
                                isDone && styles.pipelineCircleActive,
                              ]}
                            >
                              {isDone ? (
                                <Check size={10} color="#ffffff" strokeWidth={3} />
                              ) : (
                                <Text style={styles.pipelineNum}>{i + 1}</Text>
                              )}
                            </View>
                            <Text
                              style={[styles.pipelineText, isDone && styles.pipelineTextActive]}
                            >
                              {stg}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* Room Sub-Tabs */}
                    <View style={styles.subTabScrollWrapper}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomTabs}>
                        {['Overview', 'Chat', 'Tasks', 'Visits', 'Deal & Commission'].map((t) => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.roomTab, activeRoomTab === t && styles.activeRoomTab]}
                            onPress={() => setActiveRoomTab(t)}
                          >
                            <Text
                              style={[
                                styles.roomTabText,
                                activeRoomTab === t && styles.activeRoomTabText,
                              ]}
                            >
                              {t}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {/* Sub-Tab Contents */}
                    <ScrollView
                      style={styles.flexContainer}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {activeRoomTab === 'Overview' && (
                        <View style={styles.gap16}>
                          {/* Visibility settings */}
                          <View style={styles.detailCard}>
                            <View style={styles.cardHeaderRow}>
                              <Shield size={16} color="#7c3aed" />
                              <Text style={styles.cardSectionTitle}>Data Disclosure Rules</Text>
                            </View>
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Exact Address</Text>
                              <View style={styles.badgeRow}>
                                <Unlock size={12} color="#16a34a" />
                                <Text style={styles.unlockedText}>Unlocked</Text>
                              </View>
                            </View>
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Owner Contact</Text>
                              <View style={styles.badgeRow}>
                                <Unlock size={12} color="#16a34a" />
                                <Text style={styles.unlockedText}>Unlocked</Text>
                              </View>
                            </View>
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Client Identity</Text>
                              <View style={styles.badgeRow}>
                                <Lock size={12} color="#dc2626" />
                                <Text style={styles.lockedText}>Protected</Text>
                              </View>
                            </View>
                          </View>

                          {/* Split and Roles */}
                          <View style={styles.detailCard}>
                            <Text style={styles.cardSectionTitle}>Commission Agreement</Text>
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Commission Split</Text>
                              <Text style={styles.infoValue}>{room?.split} Split</Text>
                            </View>
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Your Role</Text>
                              <Text style={styles.infoValue}>{room?.yourRole}</Text>
                            </View>
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Associated Listing</Text>
                              <Text style={styles.infoValue}>{room?.property}</Text>
                            </View>
                          </View>

                          {/* Next actions */}
                          <View style={styles.nextActionBox}>
                            <Text style={styles.nextActionTitle}>Suggested Next Action</Text>
                            <Text style={styles.nextActionDesc}>
                              {room?.stage === 'Accepted'
                                ? 'Coordinate with Rahul to set up a site visit time for the buyer client.'
                                : room?.stage === 'Visit'
                                ? 'Complete the site visit check-in and request feedback from the buyer client.'
                                : 'Draft deal tokens and log milestones splits under the Deal tab.'}
                            </Text>
                          </View>
                        </View>
                      )}

                      {activeRoomTab === 'Chat' && (
                        <View style={styles.chatWrapper}>
                          <ScrollView
                            ref={scrollViewRef}
                            style={styles.chatScroll}
                            contentContainerStyle={styles.chatContent}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                          >
                            {roomChats.map((msg) => (
                              <View
                                key={msg.id}
                                style={[
                                  styles.chatBubble,
                                  msg.sender === 'you' ? styles.bubbleYou : styles.bubbleThem,
                                ]}
                              >
                                <Text style={msg.sender === 'you' ? styles.chatTextYou : styles.chatTextThem}>
                                  {msg.text}
                                </Text>
                                <Text style={styles.chatTime}>{msg.time}</Text>
                              </View>
                            ))}
                          </ScrollView>
                          
                          <View style={styles.chatInputRow}>
                            <TextInput
                              style={styles.chatInput}
                              value={newMsgText}
                              onChangeText={setNewMsgText}
                              placeholder="Type message..."
                              placeholderTextColor="#9ca3af"
                            />
                            <TouchableOpacity
                              style={styles.chatSendBtn}
                              onPress={() => handleSendMsg(selectedRoomId)}
                            >
                              <Send size={16} color="#ffffff" />
                            </TouchableOpacity>
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
                                  <Text
                                    style={[
                                      styles.taskItemText,
                                      task.completed && styles.taskItemTextCompleted,
                                    ]}
                                  >
                                    {task.title}
                                  </Text>
                                  <View style={styles.taskMetaRow}>
                                    <View style={styles.tagLabel}>
                                      <Text style={styles.tagLabelText}>{task.visibility}</Text>
                                    </View>
                                    <Text style={styles.taskAssignee}>Owner: {task.assignedTo}</Text>
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
                                <Text style={styles.visibilityToggleText}>Shared with Broker</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.visibilityToggle,
                                  newTaskVisibility === 'Private' && styles.visibilityToggleActive,
                                ]}
                                onPress={() => setNewTaskVisibility('Private')}
                              >
                                <Text style={styles.visibilityToggleText}>Private</Text>
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

                      {activeRoomTab === 'Visits' && (
                        <View style={styles.gap16}>
                          <Text style={styles.cardSectionTitle}>Collaborative Site Visits</Text>
                          {roomVisits.map((visit) => (
                            <View key={visit.id} style={styles.visitCard}>
                              <View style={styles.visitHeaderRow}>
                                <View style={styles.calendarIconBg}>
                                  <Calendar size={16} color="#7c3aed" />
                                </View>
                                <View style={styles.flex1}>
                                  <Text style={styles.visitTimeText}>{visit.time}</Text>
                                  <Text style={styles.visitDetailText}>Client: {visit.client}</Text>
                                </View>
                                <View style={styles.visitStatusBadge}>
                                  <Text style={styles.visitStatusBadgeText}>{visit.status}</Text>
                                </View>
                              </View>

                              {visit.outcome ? (
                                <View style={styles.outcomeReceipt}>
                                  <CheckCircle2 size={16} color="#16a34a" />
                                  <Text style={styles.outcomeReceiptText}>
                                    Outcome: {visit.outcome}
                                  </Text>
                                </View>
                              ) : (
                                <View style={styles.visitActionsRow}>
                                  <TouchableOpacity
                                    style={styles.visitActionOutline}
                                    onPress={() =>
                                      handleVisitOutcome(selectedRoomId, visit.id, 'Hold')
                                    }
                                  >
                                    <Text style={styles.visitActionTextDark}>On Hold</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[styles.visitActionSolid, { backgroundColor: '#16a34a' }]}
                                    onPress={() =>
                                      handleVisitOutcome(selectedRoomId, visit.id, 'Interested')
                                    }
                                  >
                                    <Text style={styles.visitActionTextLight}>Interested (Start Deal)</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          ))}

                          {/* Quick Schedule widget */}
                          <View style={styles.addTaskForm}>
                            <Text style={styles.miniSectionTitle}>Propose Site Visit</Text>
                            <TextInput
                              style={[styles.addTaskInput, { marginBottom: 10 }]}
                              value={visitClient}
                              onChangeText={setVisitClient}
                              placeholder="Client Name (e.g. Arin Jain)"
                              placeholderTextColor="#9ca3af"
                            />
                            <TextInput
                              style={styles.addTaskInput}
                              value={visitTime}
                              onChangeText={setVisitTime}
                              placeholder="Date & Time (e.g. Tomorrow 4 PM)"
                              placeholderTextColor="#9ca3af"
                            />
                            <TouchableOpacity
                              style={styles.addTaskSubmitBtn}
                              onPress={() => handleScheduleVisit(selectedRoomId)}
                            >
                              <Text style={styles.addTaskSubmitText}>Schedule Site Visit</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      {activeRoomTab === 'Deal & Commission' && (
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
                              <Text style={styles.brokerageTotal}>Total Split Split: {room?.split}</Text>
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
                    <View style={styles.header}>
                      <TouchableOpacity
                        onPress={() => setSelectedRequestId(null)}
                        style={styles.backButton}
                      >
                        <ArrowLeft size={18} color="#374151" />
                      </TouchableOpacity>
                      <Text style={styles.headerTitle}>Negotiate Terms</Text>
                      <View style={{ width: 32 }} />
                    </View>

                    <ScrollView style={styles.flexContainer} contentContainerStyle={styles.scrollContent}>
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
                        </View>

                        {/* Split Terms */}
                        <View style={styles.detailCard}>
                          <Text style={styles.cardSectionTitle}>Proposed Commission Split</Text>
                          
                          {isCountering ? (
                            <View style={styles.counterBox}>
                              <Text style={styles.counterLabel}>Edit Split Ratio:</Text>
                              <TextInput
                                style={styles.counterInput}
                                value={counterSplitVal}
                                onChangeText={setCounterSplitVal}
                                placeholder="e.g. 50/50, 40/60"
                                placeholderTextColor="#9ca3af"
                              />
                              <Text style={styles.counterLabel}>Add Counter Note:</Text>
                              <TextInput
                                style={[styles.counterInput, { height: 80 }]}
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
                            <View style={styles.splitDisplayRow}>
                              <Text style={styles.currentSplitText}>{req?.proposedSplit}</Text>
                              <TouchableOpacity
                                style={styles.changeSplitBtn}
                                onPress={() => handleCounterRequest(req.id)}
                              >
                                <Text style={styles.changeSplitBtnText}>Counter split</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>

                        {/* Unlocks information permissions preview */}
                        <View style={styles.detailCard}>
                          <Text style={styles.cardSectionTitle}>Information Visibility Preview</Text>
                          <View style={styles.unlockItemRow}>
                            <Text style={styles.unlockItemLabel}>Exact Property Address</Text>
                            {req?.unlocks.address ? (
                              <Unlock size={14} color="#16a34a" />
                            ) : (
                              <Lock size={14} color="#dc2626" />
                            )}
                          </View>
                          <View style={styles.unlockItemRow}>
                            <Text style={styles.unlockItemLabel}>Owner Contact Name/Phone</Text>
                            {req?.unlocks.ownerContact ? (
                              <Unlock size={14} color="#16a34a" />
                            ) : (
                              <Lock size={14} color="#dc2626" />
                            )}
                          </View>
                        </View>

                        {/* Final Decision row */}
                        {!isCountering && (
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
                    </ScrollView>
                  </View>
                );
              })()
            ) : selectedMatchId ? (
              (() => {
                const match = matches.find((m) => m.id === selectedMatchId);
                return (
                  <View style={styles.flexContainer}>
                    {/* Header */}
                    <View style={styles.matchDetailHeader}>
                      <View style={styles.headerTitleRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.matchDetailTitle}>Match</Text>
                          <Text style={styles.matchDetailTitle}>Detail</Text>
                          <Text style={styles.matchDetailSubtitle}>Explainable compatibility</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedMatchId(null)} style={styles.closeButton} activeOpacity={0.7}>
                          <X size={26} color="#374151" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Scrollable details */}
                    <ScrollView style={styles.flexContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                      {/* Card 1: Overview badge */}
                      <View style={styles.matchDetailCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1, gap: 4 }}>
                            <View style={[styles.percentBadge, styles.percentBadgeGreen, { alignSelf: 'flex-start' }]}>
                              <Text style={[styles.percentText, styles.percentTextGreen]}>92% STRONG MATCH</Text>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
                              {match?.broker === 'Amit Verma' ? 'Arin Jain ↔ Gokuldham' : 'Rahul Sharma ↔ Vijay Nagar'}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                              Client requirement matched with property
                            </Text>
                          </View>
                          
                          <View style={{ 
                            backgroundColor: '#f3e8ff', 
                            width: 60, 
                            height: 60, 
                            borderRadius: 14, 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#7c3aed' }}>{match?.compatibility}%</Text>
                          </View>
                        </View>
                      </View>

                      {/* Card 2: Requirement */}
                      <View style={styles.matchDetailCard}>
                        <Text style={styles.matchDetailCardTitle}>Requirement</Text>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Property</Text>
                          <Text style={styles.matchDetailValue}>2 BHK Apartment</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Location</Text>
                          <Text style={styles.matchDetailValue}>Vijay Nagar / Nipania</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Budget</Text>
                          <Text style={styles.matchDetailValue}>₹40-60L</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Timeline</Text>
                          <Text style={styles.matchDetailValue}>30 days</Text>
                        </View>
                      </View>

                      {/* Card 3: Property */}
                      <View style={styles.matchDetailCard}>
                        <Text style={styles.matchDetailCardTitle}>Property</Text>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Configuration</Text>
                          <Text style={styles.matchDetailValue}>1 BHK Apartment</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Location</Text>
                          <Text style={styles.matchDetailValue}>Vijay Nagar</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Price</Text>
                          <Text style={styles.matchDetailValue}>₹23.33L</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Availability</Text>
                          <Text style={styles.matchDetailValue}>Confirmed today</Text>
                        </View>
                      </View>

                      {/* Card 4: Why it matches */}
                      <View style={styles.matchDetailCard}>
                        <Text style={styles.matchDetailCardTitle}>Why it matches</Text>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Location</Text>
                          <Text style={styles.matchDetailValueGreen}>Excellent</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Budget</Text>
                          <Text style={styles.matchDetailValueGreen}>Within range</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Configuration</Text>
                          <Text style={styles.matchDetailValueOrange}>Flexible</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Text style={styles.matchDetailLabel}>Freshness</Text>
                          <Text style={styles.matchDetailValueGreen}>Confirmed today</Text>
                        </View>
                      </View>

                      {/* Card 5: Broker Info */}
                      <View style={styles.matchDetailCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                            <View style={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: 20, 
                              backgroundColor: '#e0e7ff', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <Text style={{ fontSize: 16, fontWeight: '700', color: '#4f46e5' }}>
                                {match?.broker?.charAt(0)}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937' }}>{match?.broker}</Text>
                              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                                {match?.verified ? 'Verified · 24 completed collaborations' : 'Active Broker'}
                              </Text>
                            </View>
                          </View>
                          <View style={[styles.percentBadge, styles.percentBadgeGreen]}>
                            <Text style={[styles.percentText, styles.percentTextGreen]}>{match?.responseRate}</Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>

                    {/* Bottom Actions */}
                    <View style={{ 
                      flexDirection: 'row', 
                      gap: 12, 
                      paddingHorizontal: 20, 
                      paddingBottom: 24, 
                      paddingTop: 12,
                      backgroundColor: '#ffffff',
                      borderTopWidth: 1,
                      borderColor: '#f3f4f6'
                    }}>
                      <TouchableOpacity 
                        style={{ 
                          flex: 1, 
                          paddingVertical: 14, 
                          borderRadius: 12, 
                          borderWidth: 1.5, 
                          borderColor: '#7c3aed', 
                          alignItems: 'center' 
                        }}
                        onPress={() => {
                          showToast.success('Opportunity added to shortlists!');
                          setSelectedMatchId(null);
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#7c3aed' }}>Shortlist</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={{ 
                          flex: 1.5, 
                          paddingVertical: 14, 
                          borderRadius: 12, 
                          backgroundColor: '#7c3aed', 
                          alignItems: 'center' 
                        }}
                        onPress={() => {
                          const newReq = {
                            id: Date.now(),
                            full_name: match.broker,
                            phone_number: '9876543200',
                            operating_area: match.title.split(' · ')[1] || 'Indore',
                            role: match.type === 'properties' ? 'Client-side' : 'Property-side',
                            target: match.title,
                            proposedSplit: '50/50',
                            status: 'New',
                            version: 1,
                            unlocks: { address: true, ownerContact: false },
                            message: 'Requesting collaboration split on matched property opportunity.'
                          };
                          setRequests(prev => [newReq, ...prev]);
                          setMatches(prev => prev.filter(m => m.id !== match.id));
                          setSelectedMatchId(null);
                          showToast.success(`Collaboration request sent to ${match.broker}!`);
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff' }}>Request Collaboration</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })()
            ) : (
                        /* 3. MAIN COLLABORATION HUB SCREEN */
              <View style={styles.flexContainer}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerTitleRow}>
                    <View style={{ paddingRight: 48 }}>
                      <Text style={styles.collabScreenTitle}>Collaboration</Text>
                      <Text style={styles.collabScreenSubtitle}>Match supply and demand, then close together</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                      <X size={26} color="#374151" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Summary Statistics Section (Overlay card style) */}
                <View style={styles.statsCardGrid}>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatNum}>{matches.length + 9}</Text>
                    <Text style={styles.miniStatLabel}>New Matches</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatNum}>{requests.length + 2}</Text>
                    <Text style={styles.miniStatLabel}>Requests</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatNum}>
                      {activeRooms.filter((r) => r.stage !== 'Paid').length + 1}
                    </Text>
                    <Text style={styles.miniStatLabel}>Active Rooms</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatNum}>
                      {activeRooms.filter((r) => r.stage === 'Paid').length + 2}
                    </Text>
                    <Text style={styles.miniStatLabel}>Closed</Text>
                  </View>
                </View>

                {/* Segmented Tab selectors */}
                <View style={styles.hubTabContainer}>
                  {['matches', 'requests', 'active', 'network'].map((t) => {
                    const isActive = activeTab === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={styles.hubTabLink}
                        onPress={() => setActiveTab(t)}
                      >
                        <Text style={[styles.hubTabLinkText, isActive && styles.activeHubTabLinkText]}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
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
                  {/* MATCHES VIEW */}
                  {activeTab === 'matches' && (
                    <View style={styles.gap12}>
                      {/* Sub-toggle row matching PDF page 17 */}
                      <View style={styles.matchSubTabToggleRow}>
                        <TouchableOpacity
                          style={[
                            styles.matchSubTabPill,
                            matchSubTab === 'clients' && styles.matchSubTabPillActive,
                          ]}
                          onPress={() => setMatchSubTab('clients')}
                        >
                          <Text
                            style={[
                              styles.matchSubTabPillText,
                              matchSubTab === 'clients' && styles.matchSubTabPillTextActive,
                            ]}
                          >
                            For My Clients
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.matchSubTabPill,
                            matchSubTab === 'properties' && styles.matchSubTabPillActive,
                          ]}
                          onPress={() => setMatchSubTab('properties')}
                        >
                          <Text
                            style={[
                              styles.matchSubTabPillText,
                              matchSubTab === 'properties' && styles.matchSubTabPillTextActive,
                            ]}
                          >
                            For My Properties
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.matchesHeaderSection}>
                        <Text style={styles.sectionSubtitleStrong}>Strong Matches</Text>
                        <TouchableOpacity>
                          <Text style={styles.filterLinkText}>Filter</Text>
                        </TouchableOpacity>
                      </View>

                      {matches
                        .filter((item) =>
                          matchSubTab === 'clients'
                            ? item.type === 'clients'
                            : item.type === 'properties'
                        )
                        .map((item) => (
                          <View key={item.id} style={styles.matchCard}>
                            <View style={styles.matchBadgeRow}>
                              <View style={[
                                styles.percentBadge,
                                item.compatibility >= 90 ? styles.percentBadgeGreen : styles.percentBadgeBlue
                              ]}>
                                <Text style={[
                                  styles.percentText,
                                  item.compatibility >= 90 ? styles.percentTextGreen : styles.percentTextBlue
                                ]}>{item.compatibility}% MATCH</Text>
                              </View>
                              <View style={styles.freshnessBadge}>
                                <Text style={styles.freshnessText}>{item.freshness}</Text>
                              </View>
                            </View>
                            
                            <View style={styles.matchInnerBox}>
                              <Text style={styles.matchTitle}>{item.title}</Text>
                              <Text style={styles.matchMeta}>{item.budget} · {item.moveInStatus} · {item.size}</Text>
                              <Text style={styles.matchBroker}>Broker: {item.broker} · {item.verified ? 'Verified' : 'Unverified'} · {item.responseRate}</Text>
                            </View>
                            
                            <View style={styles.matchActions}>
                              <TouchableOpacity
                                style={styles.matchActionOutline}
                                onPress={() => setSelectedMatchId(item.id)}
                              >
                                <Text style={styles.matchActionTextDark}>Details</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.matchActionSolid}
                                onPress={() => {
                                  // Add request proposal locally
                                  const newReq = {
                                    id: Date.now(),
                                    full_name: item.broker,
                                    phone_number: '9876543200',
                                    operating_area: item.title.split(' · ')[1] || 'Indore',
                                    role: item.type === 'properties' ? 'Client-side' : 'Property-side',
                                    target: item.title,
                                    proposedSplit: '50/50',
                                    status: 'New',
                                    version: 1,
                                    unlocks: { address: true, ownerContact: false },
                                    message: 'Requesting collaboration split on matched property opportunity.'
                                  };
                                  setRequests(prev => [newReq, ...prev]);
                                  setMatches(prev => prev.filter(m => m.id !== item.id));
                                  showToast.success(`Collaboration request sent to ${item.broker}!`);
                                }}
                              >
                                <Text style={styles.matchActionTextLight}>Shortlist</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                    </View>
                  )}

                  {/* REQUESTS LIST VIEW */}
                  {activeTab === 'requests' && (
                    <View style={styles.gap12}>
                      <Text style={styles.sectionSubtitle}>Pending Collaboration Proposals</Text>
                      {requests.length > 0 ? (
                        requests.map((req) => (
                          <TouchableOpacity
                            key={req.id}
                            style={styles.requestCard}
                            onPress={() => setSelectedRequestId(req.id)}
                          >
                            <View style={styles.requestHeader}>
                              <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                  {req.full_name?.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.requestMetaInfo}>
                                <Text style={styles.requestName}>{req.full_name}</Text>
                                <Text style={styles.requestStatusLabel}>{req.status} (v{req.version})</Text>
                              </View>
                            </View>
                            <Text style={styles.requestDetailsText}>
                              Wants to collaborate on: <Text style={styles.boldText}>{req.target}</Text>
                            </Text>
                            <Text style={styles.requestDetailsText}>
                              Commission Split: <Text style={styles.boldText}>{req.proposedSplit}</Text>
                            </Text>
                            <Text style={styles.requestMsgSnippet} numberOfLines={2}>
                              &quot;{req.message}&quot;
                            </Text>
                            <View style={styles.tapToReviewRow}>
                              <Text style={styles.tapToReviewText}>Tap to Accept, Decline or Counter</Text>
                            </View>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.emptyState}>
                          <Text style={styles.emptyStateText}>No pending proposals</Text>
                        </View>
                      )}
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
                              setSelectedRoomId(room.id);
                              setActiveRoomTab('Overview');
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
                                <Text style={styles.roomListMeta}>Split split: {room.split} • Pipeline: {room.stage}</Text>
                              </View>
                              <View style={styles.nextActionArrow}>
                                <Text style={styles.nextActionArrowText}>→</Text>
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

                  {/* NETWORK / DIRECTORY SEARCH VIEW */}
                  {activeTab === 'network' && (
                    <View style={styles.gap12}>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddForm(!showAddForm)}
                      >
                        <Plus size={18} color="#6b7280" />
                        <Text style={styles.addButtonText}>Add Connection Request</Text>
                      </TouchableOpacity>

                      {showAddForm && (
                        <View style={styles.addForm}>
                          <Text style={styles.formTitle}>Invite External Broker</Text>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                              style={styles.input}
                              value={formName}
                              onChangeText={setFormName}
                              placeholder="Enter broker name"
                              placeholderTextColor="#9ca3af"
                            />
                          </View>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                              style={styles.input}
                              value={formPhone}
                              onChangeText={setFormPhone}
                              placeholder="Enter phone number"
                              placeholderTextColor="#9ca3af"
                              keyboardType="phone-pad"
                            />
                          </View>
                          <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleSendRequest}
                          >
                            <Text style={styles.continueButtonText}>Send Invite</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <Text style={styles.sectionSubtitle}>Verified Network Directory</Text>
                      {networkBrokers.map((broker) => (
                        <View key={broker.id} style={styles.networkCard}>
                          <View style={styles.networkHeader}>
                            <View style={styles.brokerAvatarBg}>
                              <Text style={styles.avatarText}>
                                {broker.full_name?.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.flex1}>
                              <Text style={styles.networkName}>{broker.full_name}</Text>
                              <Text style={styles.networkArea}>{broker.operating_area}</Text>
                            </View>
                            <TouchableOpacity
                              style={styles.connectBtn}
                              onPress={() => {
                                setSuccessData({ name: broker.full_name, phone: broker.phone_number });
                                setShowSuccessModal(true);
                              }}
                            >
                              <Text style={styles.connectBtnText}>Connect</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 50,
    paddingHorizontal: 20,
    paddingBottom: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 8,
    padding: 12,
    zIndex: 999,
  },
  collabScreenTitle: {
    fontSize: 28,
    //fontFamily: 'Montserrat_700Bold',
    color: '#111827',
    marginTop: 12,
    fontWeight: '600',
  },
  collabScreenSubtitle: {
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
    color: '#6b7280',
    marginTop: 3,
    lineHeight: 16,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
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
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
    paddingVertical: 10,
    marginRight: 24,
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 10,
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
});