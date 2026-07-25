import { Check, ChevronDown, ChevronUp, Phone, Plus, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import { showToast } from '../utils/toast';
import WhatsAppIcon from '../Components/WhatsAppIcon';
import Skeleton from '../Components/Skeleton';

const CollaborationSheet = ({ isOpen, onClose }) => {
  const myProperties = useSelector(state => state.properties.properties);

  const [activeTab, setActiveTab] = useState('collab');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [expandedCollaborator, setExpandedCollaborator] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ name: '', phone: '' });

  // Network data
  const [myNetwork, setMyNetwork] = useState([]);
  const [networkLoading, setNetworkLoading] = useState(false);

  // Collab property modal state
  const [showCollabPropertyModal, setShowCollabPropertyModal] = useState(false);
  const [collabTargetBroker, setCollabTargetBroker] = useState(null);
  // { collaboratorId -> [propertyId, ...] }
  const [collaboratedProperties, setCollaboratedProperties] = useState({});

  // Mock pending requests
  const [pendingRequests] = useState([
    { id: 101, full_name: 'Suresh Patel', phone_number: '9765432100', operating_area: 'Ujjain, MP' },
    { id: 102, full_name: 'Neha Joshi', phone_number: '9654321009', operating_area: 'Indore, MP' },
  ]);

  // Fetch my network when sheet opens
  useEffect(() => {
    if (isOpen && activeTab === 'collab') {
      fetchMyNetwork();
    }
  }, [isOpen, activeTab]);

  const fetchMyNetwork = async () => {
    setNetworkLoading(true);
    setTimeout(() => {
      setMyNetwork([
        { id: 1, full_name: 'Rahul Sharma', phone_number: '9876543210', operating_area: 'Indore, MP' },
        { id: 2, full_name: 'Priya Mehta', phone_number: '9812345678', operating_area: 'Bhopal, MP' },
        { id: 3, full_name: 'Amit Verma', phone_number: '9988776655', operating_area: 'Indore, MP' },
      ]);
      setNetworkLoading(false);
    }, 500);
  };

  const openCollabPropertyModal = (collaborator) => {
    setCollabTargetBroker(collaborator);
    setShowCollabPropertyModal(true);
  };

  const handleCollabProperty = (property) => {
    const brokerId = collabTargetBroker.id;
    const already = (collaboratedProperties[brokerId] || []).find(p => p.id === property.id);
    if (already) {
      showToast.info('Property already collaborated with this broker');
      return;
    }
    setCollaboratedProperties(prev => ({
      ...prev,
      [brokerId]: [...(prev[brokerId] || []), property],
    }));
    setShowCollabPropertyModal(false);
    showToast.success(`"${property.title}" collaborated with ${collabTargetBroker.full_name}`);
  };

  const handleRemoveCollab = (brokerId, propertyId) => {
    setCollaboratedProperties(prev => ({
      ...prev,
      [brokerId]: (prev[brokerId] || []).filter(p => p.id !== propertyId),
    }));
    showToast.info('Collaboration removed');
  };


  const handleSendRequest = () => {
    if (!formName.trim() || !formPhone.trim()) {
      showToast.error('Please fill in both name and phone number');
      return;
    }
    // TODO: re-enable backend integration
    setSuccessData({ name: formName.trim(), phone: formPhone.trim() });
    setShowSuccessModal(true);
    setFormName('');
    setFormPhone('');
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setShowAddForm(false);
  };

  const handleAcceptRequest = (_requestId) => {
    showToast.success('Collaboration request accepted successfully!');
  };

  const handleRejectRequest = (_requestId) => {
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
                      <Text style={styles.formTitle}>Send Connection Request</Text>

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
                        <Text style={styles.continueButtonText}>Send Connection Request</Text>
                      </TouchableOpacity>
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
                                  <Text style={styles.contactLabel}>Phone:</Text>
                                  <Text style={styles.contactValue}>{collaborator.phone_number}</Text>
                                </View>

                                {/* Call / Message */}
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

                                {/* Collab a Property Button */}
                                <TouchableOpacity
                                  style={styles.collabPropertyBtn}
                                  onPress={() => openCollabPropertyModal(collaborator)}
                                >
                                  <Plus size={14} color="#6d28d9" />
                                  <Text style={styles.collabPropertyBtnText}>Collab a Property</Text>
                                </TouchableOpacity>

                                {/* Collaborated Properties */}
                                {(collaboratedProperties[collaborator.id] || []).length > 0 && (
                                  <View style={styles.collabedSection}>
                                    <Text style={styles.collabedTitle}>Collaborated Properties</Text>
                                    {(collaboratedProperties[collaborator.id] || []).map(prop => (
                                      <View key={prop.id} style={styles.collabedCard}>
                                        <View style={styles.collabedInfo}>
                                          <Text style={styles.collabedPropTitle}>{prop.title}</Text>
                                          <Text style={styles.collabedPropAddress}>{prop.address}</Text>
                                        </View>
                                        <TouchableOpacity
                                          style={styles.removeCollabBtn}
                                          onPress={() => handleRemoveCollab(collaborator.id, prop.id)}
                                        >
                                          <X size={12} color="#ef4444" />
                                          <Text style={styles.removeCollabText}>Remove</Text>
                                        </TouchableOpacity>
                                      </View>
                                    ))}
                                  </View>
                                )}
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
                    {pendingRequests.length > 0 ? (
                      pendingRequests.map(req => (
                        <View key={req.id} style={styles.requestCard}>
                          <View style={styles.requestInfo}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>
                                {req.full_name?.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.collaboratorInfo}>
                              <Text style={styles.collaboratorName}>{req.full_name}</Text>
                              <Text style={styles.collaboratorLocation}>{req.operating_area || 'N/A'}</Text>
                            </View>
                          </View>
                          <View style={styles.requestActions}>
                            <TouchableOpacity
                              style={styles.rejectButton}
                              onPress={() => handleRejectRequest(req.id)}
                            >
                              <X size={14} color="#ef4444" />
                              <Text style={styles.rejectButtonText}>Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.acceptButton}
                              onPress={() => handleAcceptRequest(req.id)}
                            >
                              <Check size={14} color="#22c55e" />
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

      {/* Collab Property Picker Modal */}
      <Modal
        visible={showCollabPropertyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCollabPropertyModal(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowCollabPropertyModal(false)}
            style={styles.backdrop}
          />
          <View style={[styles.sheetContainer, { height: '60%' }]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowCollabPropertyModal(false)} style={styles.backButton}>
                <X size={20} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Select Property</Text>
              <View style={{ width: 32 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              <Text style={styles.collabPickerSubtitle}>
                Collaborating with {collabTargetBroker?.full_name}
              </Text>
              {myProperties.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No properties found</Text>
                </View>
              ) : (
                myProperties.map(prop => {
                  const alreadyCollabed = (collaboratedProperties[collabTargetBroker?.id] || []).find(p => p.id === prop.id);
                  return (
                    <TouchableOpacity
                      key={prop.id}
                      style={[styles.propPickerCard, alreadyCollabed && styles.propPickerCardDisabled]}
                      onPress={() => !alreadyCollabed && handleCollabProperty(prop)}
                      activeOpacity={alreadyCollabed ? 1 : 0.7}
                    >
                      <View style={styles.propPickerInfo}>
                        <Text style={styles.propPickerTitle}>{prop.title}</Text>
                        <Text style={styles.propPickerAddress}>{prop.address || prop.locality || prop.city}</Text>
                        <Text style={styles.propPickerPrice}>
                          ₹{prop.price >= 100000 ? `${(prop.price / 100000).toFixed(1)}L` : prop.price?.toLocaleString()}
                        </Text>
                      </View>
                      {alreadyCollabed ? (
                        <View style={styles.alreadyCollabBadge}>
                          <Check size={12} color="#6d28d9" />
                          <Text style={styles.alreadyCollabText}>Added</Text>
                        </View>
                      ) : (
                        <View style={styles.addCollabBadge}>
                          <Plus size={12} color="#6d28d9" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
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
                <Text style={styles.brokerDetailLabel}>Name:</Text>
                <Text style={styles.brokerDetailValue}>{successData.name}</Text>
              </View>
              <View style={styles.brokerDetailRow}>
                <Text style={styles.brokerDetailLabel}>Phone:</Text>
                <Text style={styles.brokerDetailValue}>{successData.phone}</Text>
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
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },
  contactValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Montserrat_600SemiBold',
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

  // Collab a Property button
  collabPropertyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ede9fe',
    borderWidth: 1,
    borderColor: '#c4b5fd',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  collabPropertyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6d28d9',
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Collaborated properties section
  collabedSection: {
    marginTop: 14,
    backgroundColor: '#faf5ff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  collabedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6d28d9',
    marginBottom: 10,
    fontFamily: 'Montserrat_700Bold',
  },
  collabedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  collabedInfo: {
    flex: 1,
  },
  collabedPropTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Montserrat_600SemiBold',
  },
  collabedPropAddress: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
    marginTop: 2,
  },
  removeCollabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 3,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeCollabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Property picker modal
  collabPickerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
    marginBottom: 16,
  },
  propPickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  propPickerCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  propPickerInfo: {
    flex: 1,
  },
  propPickerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 2,
  },
  propPickerAddress: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },
  propPickerPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6d28d9',
    fontFamily: 'Montserrat_700Bold',
    marginTop: 4,
  },
  addCollabBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  alreadyCollabBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 3,
  },
  alreadyCollabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6d28d9',
    fontFamily: 'Montserrat_600SemiBold',
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
  emptyStateSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Lato_400Regular',
    marginTop: 4,
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