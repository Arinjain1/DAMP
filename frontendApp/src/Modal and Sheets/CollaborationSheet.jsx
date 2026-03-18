import { Check, ChevronDown, ChevronUp, Phone, Plus, Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { showToast } from '../utils/toast';
import WhatsAppIcon from '../Components/WhatsAppIcon';
import { collabAPI } from '../config/api';
import Skeleton from '../Components/Skeleton';

const CollaborationSheet = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('collab'); // 'collab' or 'requests'
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expandedCollaborator, setExpandedCollaborator] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ name: '', id: '' });
  
  // Network data
  const [myNetwork, setMyNetwork] = useState([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Fetch my network when sheet opens
  useEffect(() => {
    if (isOpen && activeTab === 'collab') {
      fetchMyNetwork();
    }
  }, [isOpen, activeTab]);

  const fetchMyNetwork = async () => {
    try {
      setNetworkLoading(true);
      const response = await collabAPI.getMyNetwork();
      if (response.data.success) {
        setMyNetwork(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch network:', error);
      showToast.error('Failed to load collaboration network');
    } finally {
      setNetworkLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await collabAPI.searchBrokers(query);
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
      showToast.error('Failed to search brokers');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (broker) => {
    try {
      setSendingRequest(true);
      const response = await collabAPI.sendRequest(broker.id);
      
      if (response.data.success) {
        setSuccessData({ 
          name: broker.full_name, 
          id: broker.id 
        });
        setShowSuccessModal(true);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Failed to send request:', error);
      const errorMsg = error.response?.data?.message || 'Failed to send connection request';
      showToast.error(errorMsg);
    } finally {
      setSendingRequest(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setShowAddForm(false);
  };

  const handleAcceptRequest = (requestId) => {
    showToast.success('Collaboration request accepted successfully!');
  };

  const handleRejectRequest = (requestId) => {
    showToast.info('The collaboration request has been declined.');
  };

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone) => {
    if (phone) Linking.openURL(`https://wa.me/${phone}`);
  };

  const handleCollaboratorClick = (collaboratorId) => {
    setExpandedCollaborator(expandedCollaborator === collaboratorId ? null : collaboratorId);
  };

  if (!isOpen) return null;

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
                      <Text style={styles.formTitle}>Search & Connect</Text>

                      <View style={styles.searchInputContainer}>
                        <Search size={18} color="#9ca3af" />
                        <TextInput
                          style={styles.searchInput}
                          value={searchQuery}
                          onChangeText={handleSearch}
                          placeholder="Search by name or area..."
                          placeholderTextColor="#9ca3af"
                        />
                      </View>

                      {/* Search Results */}
                      {searchLoading ? (
                        <View style={styles.searchResults}>
                          {[1, 2, 3].map((item) => (
                            <View key={item} style={styles.searchResultItem}>
                              <Skeleton circle width={40} height={40} />
                              <View style={{ flex: 1, marginLeft: 12 }}>
                                <Skeleton width="60%" height={16} borderRadius={6} style={{ marginBottom: 6 }} />
                                <Skeleton width="40%" height={14} borderRadius={6} />
                              </View>
                              <Skeleton width={80} height={32} borderRadius={8} />
                            </View>
                          ))}
                        </View>
                      ) : searchResults.length > 0 ? (
                        <ScrollView style={styles.searchResults} nestedScrollEnabled>
                          {searchResults.map((broker) => (
                            <View key={broker.id} style={styles.searchResultItem}>
                              <View style={styles.brokerAvatar}>
                                <Text style={styles.brokerAvatarText}>
                                  {broker.full_name?.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.brokerInfo}>
                                <Text style={styles.brokerName}>{broker.full_name}</Text>
                                <Text style={styles.brokerArea}>{broker.operating_area || 'N/A'}</Text>
                              </View>
                              <TouchableOpacity
                                style={styles.connectButton}
                                onPress={() => handleSendRequest(broker)}
                                disabled={sendingRequest}
                              >
                                {sendingRequest ? (
                                  <ActivityIndicator size="small" color="#111827" />
                                ) : (
                                  <Text style={styles.connectButtonText}>Connect</Text>
                                )}
                              </TouchableOpacity>
                            </View>
                          ))}
                        </ScrollView>
                      ) : searchQuery.trim().length >= 2 ? (
                        <View style={styles.noResults}>
                          <Text style={styles.noResultsText}>No brokers found</Text>
                        </View>
                      ) : null}
                    </View>
                  )}

                  {/* My Collaboration Network Section */}
                  <Text style={styles.sectionTitle}>My Collaboration Network</Text>

                  {networkLoading ? (
                    <View style={styles.collaboratorList}>
                      {[1, 2, 3].map((item) => (
                        <View key={item} style={styles.collaboratorCard}>
                          <View style={styles.collaboratorHeader}>
                            <Skeleton circle width={48} height={48} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Skeleton width="60%" height={16} borderRadius={6} style={{ marginBottom: 6 }} />
                              <Skeleton width="40%" height={14} borderRadius={6} />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.collaboratorList}>
                      {myNetwork && myNetwork.length > 0 ? (
                        myNetwork.map(collaborator => (
                          <TouchableOpacity
                            key={collaborator.id}
                            style={styles.collaboratorCard}
                            onPress={() => handleCollaboratorClick(collaborator.id)}
                          >
                            <View style={styles.collaboratorHeader}>
                              <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                  {collaborator.full_name?.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.collaboratorInfo}>
                                <Text style={styles.collaboratorName}>{collaborator.full_name}</Text>
                                <Text style={styles.collaboratorLocation}>{collaborator.operating_area || 'N/A'}</Text>
                              </View>
                              <View style={styles.expandIcon}>
                                {expandedCollaborator === collaborator.id ? (
                                  <ChevronUp size={20} color="#6b7280" />
                                ) : (
                                  <ChevronDown size={20} color="#6b7280" />
                                )}
                              </View>
                            </View>

                            {/* Expanded Contact Section */}
                            {expandedCollaborator === collaborator.id && (
                              <View style={styles.statsContainer}>
                                <View style={styles.contactInfo}>
                                  <Text style={styles.contactLabel}>Email:</Text>
                                  <Text style={styles.contactValue}>{collaborator.email}</Text>
                                </View>
                                <View style={styles.contactInfo}>
                                  <Text style={styles.contactLabel}>Phone:</Text>
                                  <Text style={styles.contactValue}>{collaborator.phone_number}</Text>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionButtons}>
                                  <TouchableOpacity
                                    style={styles.callButton}
                                    onPress={() => handleCall(collaborator.phone_number)}
                                  >
                                    <Phone size={14} color="#4f46e5" />
                                    <Text style={styles.callButtonText}>Call</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.messageButton}
                                    onPress={() => handleWhatsApp(collaborator.phone_number)}
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
                  )}
                </>
              )}

              {/* Requests Tab Content */}
              {activeTab === 'requests' && (
                <>
                  <Text style={styles.sectionTitle}>Pending Requests</Text>

                  <View style={styles.collaboratorList}>
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No pending requests</Text>
                      <Text style={styles.emptyStateSubtext}>Coming soon...</Text>
                    </View>
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
                <Text style={styles.brokerDetailLabel}>Broker Name:</Text>
                <Text style={styles.brokerDetailValue}>{successData.name}</Text>
              </View>
              <View style={styles.brokerDetailRow}>
                <Text style={styles.brokerDetailLabel}>Broker ID:</Text>
                <Text style={styles.brokerDetailValue}>{successData.id}</Text>
              </View>
            </View>

            {/* Additional Info */}
            <Text style={styles.additionalInfo}>
              You&apos;ll receive a notification once they accept your request.
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
    borderStyle: 'dashed',
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Lato_400Regular',
  },
  searchResults: {
    maxHeight: 250,
    marginTop: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  brokerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#C4B5FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brokerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
  },
  brokerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  brokerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Montserrat_600SemiBold',
  },
  brokerArea: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },
  connectButton: {
    backgroundColor: '#C4B5FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Montserrat_600SemiBold',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
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
    backgroundColor: '#C4B5FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
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