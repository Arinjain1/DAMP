import { Check, ChevronDown, ChevronUp, Phone, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import WhatsAppIcon from '../Components/WhatsAppIcon';
import { INITIAL_COLLABORATORS, PENDING_REQUESTS } from '../MockData/Mockdata';

const CollaborationSheet = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('collab'); // 'collab' or 'requests'
  const [showAddForm, setShowAddForm] = useState(false);
  const [brokerId, setBrokerId] = useState('');
  const [brokerNo, setBrokerNo] = useState('');
  const [expandedCollaborator, setExpandedCollaborator] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ id: '', number: '' });

  if (!isOpen) return null;

  const handleAddCollaborator = () => {
    if (!brokerId.trim() || !brokerNo.trim()) {
      Alert.alert(
        'Missing Information', 
        'Please fill in both Broker ID and Broker Number to send connection request.',
        [
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
      return;
    }

    // Show custom success modal
    setSuccessData({ id: brokerId, number: brokerNo });
    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setBrokerId('');
    setBrokerNo('');
    setShowAddForm(false);
  };

  const handleAcceptRequest = (requestId) => {
    Alert.alert(
      'Welcome to Your Network!',
      'Collaboration request accepted successfully!\n\nYou can now start collaborating and sharing deals together.',
      [
        { 
          text: 'Great!',
          style: 'default'
        }
      ]
    );
  };

  const handleRejectRequest = (requestId) => {
    Alert.alert(
      'Request Declined',
      'The collaboration request has been declined.\n\nNo worries, you can always reconsider in the future!',
      [
        { 
          text: 'Understood',
          style: 'default'
        }
      ]
    );
  };

  const handleCall = (phone) => {
    if(phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone) => {
    if(phone) Linking.openURL(`https://wa.me/${phone}`);
  };

  const handleCollaboratorClick = (collaboratorId) => {
    setExpandedCollaborator(expandedCollaborator === collaboratorId ? null : collaboratorId);
  };

  return (
    <>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          
          {/* Backdrop Tap to Close */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={onClose}
            style={styles.backdrop}
          />

          {/* Sheet Container */}
          <View style={styles.sheetContainer}>
            
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <X size={20} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Collab</Text>
              <View style={{ width: 20 }} />
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              
              {/* Tab Toggle */}
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'collab' && styles.activeTab]}
                  onPress={() => setActiveTab('collab')}
                >
                  <Text style={[styles.tabText, activeTab === 'collab' && styles.activeTabText]}>
                    Collab
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                  onPress={() => setActiveTab('requests')}
                >
                  <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                    Requests
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Collab Tab Content */}
              {activeTab === 'collab' && (
                <>
                  {/* Add Collaborator Button */}
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowAddForm(!showAddForm)}
                  >
                    <Plus size={18} color="#6b7280" />
                    <Text style={styles.addButtonText}>Add Collaborator</Text>
                  </TouchableOpacity>

                  {/* Add Collaborator Form */}
                  {showAddForm && (
                    <View style={styles.addForm}>
                      <Text style={styles.formTitle}>Send Connection Request</Text>
                      
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Broker ID</Text>
                        <TextInput
                          style={styles.input}
                          value={brokerId}
                          onChangeText={setBrokerId}
                          placeholder="Enter Broker ID"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Broker Number</Text>
                        <TextInput
                          style={styles.input}
                          value={brokerNo}
                          onChangeText={setBrokerNo}
                          placeholder="Enter Broker Number"
                          placeholderTextColor="#9ca3af"
                          keyboardType="phone-pad"
                        />
                      </View>

                      <TouchableOpacity 
                        style={styles.continueButton}
                        onPress={handleAddCollaborator}
                      >
                        <Text style={styles.continueButtonText}>Send Request</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* My Collaboration Network Section */}
                  <Text style={styles.sectionTitle}>My Collaboration Network</Text>
                  
                  <View style={styles.collaboratorList}>
                    {INITIAL_COLLABORATORS && INITIAL_COLLABORATORS.length > 0 ? (
                      INITIAL_COLLABORATORS.map(collaborator => (
                        <TouchableOpacity 
                          key={collaborator.id}
                          style={styles.collaboratorCard}
                          onPress={() => handleCollaboratorClick(collaborator.id)}
                        >
                          <View style={styles.collaboratorHeader}>
                            <Image 
                              source={{ uri: collaborator.avatar }} 
                              style={styles.avatar}
                            />
                            <View style={styles.collaboratorInfo}>
                              <Text style={styles.collaboratorName}>{collaborator.name}</Text>
                              <Text style={styles.collaboratorLocation}>{collaborator.location}</Text>
                            </View>
                            <View style={styles.expandIcon}>
                              {expandedCollaborator === collaborator.id ? (
                                <ChevronUp size={20} color="#6b7280" />
                              ) : (
                                <ChevronDown size={20} color="#6b7280" />
                              )}
                            </View>
                          </View>
                          
                          {/* Expanded Stats Section */}
                          {expandedCollaborator === collaborator.id && (
                            <View style={styles.statsContainer}>
                              <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                  <Text style={styles.statText}>Total Properties <Text style={styles.statValue}>{collaborator.properties}</Text></Text>
                                </View>
                                <View style={styles.statBox}>
                                  <Text style={styles.statText}>Total Deals <Text style={styles.statValue}>{collaborator.deals}</Text></Text>
                                </View>
                              </View>
                              <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                  <Text style={styles.statText}>Total Clients <Text style={styles.statValue}>{collaborator.collaboratedDeals * 15}</Text></Text>
                                </View>
                                <View style={styles.statBox}>
                                  <Text style={styles.statText}>Collaborations <Text style={styles.statValue}>{collaborator.collaboratedDeals}</Text></Text>
                                </View>
                              </View>
                              
                              {/* Action Buttons */}
                              <View style={styles.actionButtons}>
                                <TouchableOpacity 
                                  style={styles.callButton}
                                  onPress={() => handleCall(collaborator.phone)}
                                >
                                  <Phone size={14} color="#4f46e5" />
                                  <Text style={styles.callButtonText}>Call</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                  style={styles.messageButton}
                                  onPress={() => handleWhatsApp(collaborator.phone)}
                                >
                                  <WhatsAppIcon size={14} color="#25D366" />
                                  <Text style={styles.messageButtonText}>Message</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No collaborators yet</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* Requests Tab Content */}
              {activeTab === 'requests' && (
                <>
                  <Text style={styles.sectionTitle}>Pending Requests</Text>
                  
                  <View style={styles.collaboratorList}>
                    {PENDING_REQUESTS && PENDING_REQUESTS.length > 0 ? (
                      PENDING_REQUESTS.map(request => (
                        <View 
                          key={request.id} 
                          style={styles.requestCard}
                        >
                          <View style={styles.requestInfo}>
                            <Image 
                              source={{ uri: request.avatar }} 
                              style={styles.avatar}
                            />
                            <View style={styles.collaboratorInfo}>
                              <Text style={styles.collaboratorName}>{request.name}</Text>
                              <Text style={styles.collaboratorLocation}>{request.location}</Text>
                              <Text style={styles.brokerId}>ID: {request.brokerId}</Text>
                            </View>
                          </View>
                          
                          <View style={styles.requestActions}>
                            <TouchableOpacity 
                              style={styles.rejectButton}
                              onPress={() => handleRejectRequest(request.id)}
                            >
                              <X size={16} color="#ef4444" />
                              <Text style={styles.rejectButtonText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.acceptButton}
                              onPress={() => handleAcceptRequest(request.id)}
                            >
                              <Check size={16} color="#22c55e" />
                              <Text style={styles.acceptButtonText}>Accept</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No pending requests</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Check size={40} color="#22c55e" strokeWidth={3} />
              </View>
            </View>

            {/* Success Title */}
            <Text style={styles.successTitle}>Request Sent!</Text>
            
            {/* Success Message */}
            <Text style={styles.successMessage}>
              Your connection request has been sent to:
            </Text>

            {/* Broker Details */}
            <View style={styles.brokerDetailsBox}>
              <View style={styles.brokerDetailRow}>
                <Text style={styles.brokerDetailLabel}>Broker ID:</Text>
                <Text style={styles.brokerDetailValue}>{successData.id}</Text>
              </View>
              <View style={styles.brokerDetailRow}>
                <Text style={styles.brokerDetailLabel}>Broker Number:</Text>
                <Text style={styles.brokerDetailValue}>{successData.number}</Text>
              </View>
            </View>

            {/* Additional Info */}
            <Text style={styles.additionalInfo}>
              You'll receive a notification once they accept your request.
            </Text>

            {/* Done Button */}
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={closeSuccessModal}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Tab Toggle
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#C4B5FD',
    borderRadius: 25,
    padding: 2,
    marginBottom: 25,
    alignSelf: 'center',
    width: 240,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Montserrat_500Medium',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderStyle:'dashed',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Add Form
  addForm: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Lato_400Regular',
  },
  continueButton: {
    backgroundColor: '#C4B5FD',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Collaborator List
  collaboratorList: {
    gap: 12,
  },

  // Collaborator Card
  collaboratorCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
    marginBottom: 12,
  },
  collaboratorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  collaboratorLocation: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },
  expandIcon: {
    padding: 4,
  },

  // Stats Container
  statsContainer: {
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
    fontFamily: 'Montserrat_600SemiBold',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  messageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#25D366',
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },

  // Request Card
  requestCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  brokerId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
    fontFamily: 'Montserrat_600SemiBold',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Success Modal Styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#bbf7d0',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  successMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Lato_400Regular',
    lineHeight: 20,
  },
  brokerDetailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  brokerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  brokerDetailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    fontFamily: 'Montserrat_500Medium',
  },
  brokerDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Montserrat_600SemiBold',
  },
  additionalInfo: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Lato_400Regular',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  doneButton: {
    backgroundColor: '#C4B5FD',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
  },
});

export default CollaborationSheet;