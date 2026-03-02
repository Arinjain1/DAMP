import { Check, ChevronDown, ChevronUp, Phone, Plus, X } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import styles from '../styles/collaborationStyles';
import { showToast } from '../utils/toast';
import WhatsAppIcon from '../Components/WhatsAppIcon';
import { collabAPI } from '../config/api';

const CollaborationSheet = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('collab'); // 'collab' or 'requests'
  const [showAddForm, setShowAddForm] = useState(false);
  const [brokerId, setBrokerId] = useState('');
  const [brokerNo, setBrokerNo] = useState('');
  const [expandedCollaborator, setExpandedCollaborator] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ id: '', number: '' });

  // API State
  const [network, setNetwork] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNetworkData = useCallback(async () => {
    try {
      setLoading(true);
      const [networkRes, requestsRes] = await Promise.all([
        collabAPI.getNetwork(),
        collabAPI.getRequests()
      ]);

      if (networkRes.data.success) {
        setNetwork(networkRes.data.data);
      }
      if (requestsRes.data.success) {
        setRequests(requestsRes.data.data);
      }
    } catch (_err) {
      console.error('Error fetching collab data:', _err);
      showToast.error('Failed to load collaboration data');
    } finally {
      setLoading(false);
    }
  }, []);

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setBrokerId('');
    setBrokerNo('');
    setShowAddForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchNetworkData();
    }
  }, [isOpen, fetchNetworkData]);

  if (!isOpen) return null;

  const handleAddCollaborator = async () => {
    if (!brokerId.trim() || !brokerNo.trim()) {
      showToast.info('Please fill in both Broker ID and Broker Number.');
      return;
    }

    try {
      const response = await collabAPI.sendRequest({
        receiver_id: brokerId,
      });

      if (response.data.success) {
        setSuccessData({ id: brokerId, number: brokerNo });
        setShowSuccessModal(true);
        fetchNetworkData(); // Refresh
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send request';
      showToast.error(msg);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await collabAPI.updateStatus(requestId, 'accepted');
      if (response.data.success) {
        showToast.success('Collaboration request accepted!');
        fetchNetworkData(); // Refresh network and requests
      }
    } catch (_err) {
      showToast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await collabAPI.updateStatus(requestId, 'rejected');
      if (response.data.success) {
        showToast.info('Request declined');
        fetchNetworkData(); // Refresh requests
      }
    } catch (_err) {
      showToast.error('Failed to decline request');
    }
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

                  {loading ? (
                    <ActivityIndicator size="large" color="#C4B5FD" style={{ marginVertical: 20 }} />
                  ) : (
                    <View style={styles.collaboratorList}>
                      {network && network.length > 0 ? (
                        network.map(collaborator => (
                          <TouchableOpacity
                            key={collaborator.id}
                            style={styles.collaboratorCard}
                            onPress={() => handleCollaboratorClick(collaborator.id)}
                          >
                            <View style={styles.collaboratorHeader}>
                              <Image
                                source={{ uri: collaborator.avatar_url || 'https://via.placeholder.com/150' }}
                                style={styles.avatar}
                              />
                              <View style={styles.collaboratorInfo}>
                                <Text style={styles.collaboratorName}>{collaborator.full_name}</Text>
                                <Text style={styles.collaboratorLocation}>{collaborator.operating_area}</Text>
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
                                    <Text style={styles.statText}>Phone <Text style={styles.statValue}>{collaborator.phone_number}</Text></Text>
                                  </View>
                                </View>
                                <View style={styles.statsGrid}>
                                  <View style={styles.statBox}>
                                    <Text style={styles.statText}>Email <Text style={styles.statValue}>{collaborator.email}</Text></Text>
                                  </View>
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

                  {loading ? (
                    <ActivityIndicator size="large" color="#C4B5FD" style={{ marginVertical: 20 }} />
                  ) : (
                    <View style={styles.collaboratorList}>
                      {requests && requests.length > 0 ? (
                        requests.map(request => (
                          <View
                            key={request.request_id}
                            style={styles.requestCard}
                          >
                            <View style={styles.requestInfo}>
                              <Image
                                source={{ uri: request.avatar_url || 'https://via.placeholder.com/150' }}
                                style={styles.avatar}
                              />
                              <View style={styles.collaboratorInfo}>
                                <Text style={styles.collaboratorName}>{request.full_name}</Text>
                                <Text style={styles.collaboratorLocation}>{request.operating_area}</Text>
                                <Text style={styles.brokerId}>ID: {request.user_id}</Text>
                              </View>
                            </View>

                            <View style={styles.requestActions}>
                              <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={() => handleRejectRequest(request.request_id)}
                              >
                                <X size={16} color="#ef4444" />
                                <Text style={styles.rejectButtonText}>Reject</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={() => handleAcceptRequest(request.request_id)}
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
                  )}
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

export default CollaborationSheet;