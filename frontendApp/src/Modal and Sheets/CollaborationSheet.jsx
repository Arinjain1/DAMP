import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native';
import { X, Search, MapPin, Users, Send } from 'lucide-react-native';

// Mock Data
const INITIAL_BROKERS = [
  { id: 1, name: 'Rahul Sharma', location: 'Indore, MP', properties: 12, connected: false },
  { id: 2, name: 'Priya Verma', location: 'Bhopal, MP', properties: 8, connected: true },
  { id: 3, name: 'Amit Singh', location: 'Dewas, MP', properties: 15, connected: false },
  { id: 4, name: 'Sneha Gupta', location: 'Ujjain, MP', properties: 10, connected: false },
  { id: 5, name: 'Vikram Patel', location: 'Indore, MP', properties: 20, connected: true },
  { id: 6, name: 'Anjali Mehta', location: 'Bhopal, MP', properties: 6, connected: false },
];

const CollaborationSheet = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter brokers based on search
  const filteredBrokers = INITIAL_BROKERS.filter(broker =>
    broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedCount = INITIAL_BROKERS.filter(b => b.connected).length;

  return (
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
            <View style={styles.headerLeft}>
              <View style={styles.headerTitleRow}>
                <Users size={20} color="#111827" />
                <Text style={styles.headerTitle}>Broker Network</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {connectedCount} Connected · {INITIAL_BROKERS.length} Total
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Search size={16} color="#9ca3af" />
                <TextInput 
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search brokers by name or location..."
                  placeholderTextColor="#9ca3af"
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={16} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Results Info */}
            {searchQuery && (
              <Text style={styles.resultsText}>
                {filteredBrokers.length} broker{filteredBrokers.length !== 1 ? 's' : ''} found
              </Text>
            )}

            {/* Broker List */}
            <View style={styles.brokerList}>
              {filteredBrokers.length > 0 ? (
                filteredBrokers.map(broker => (
                  <View 
                    key={broker.id} 
                    style={styles.brokerCard}
                  >
                    <View style={styles.brokerCardLeft}>
                      {/* Avatar */}
                      <View style={[
                        styles.avatar,
                        broker.connected && styles.avatarConnected
                      ]}>
                        <Text style={styles.avatarText}>
                          {broker.name.charAt(0)}
                        </Text>
                        {broker.connected && (
                          <View style={styles.connectedDot} />
                        )}
                      </View>
                      
                      {/* Info */}
                      <View style={styles.brokerInfo}>
                        <Text style={styles.brokerName}>{broker.name}</Text>
                        <View style={styles.locationRow}>
                          <MapPin size={11} color="#6b7280" />
                          <Text style={styles.locationText}>{broker.location}</Text>
                        </View>
                        <Text style={styles.propertiesText}>
                          {broker.properties} properties
                        </Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity 
                      style={[
                        styles.actionButton,
                        broker.connected && styles.actionButtonConnected
                      ]}
                    >
                      <Text style={[
                        styles.actionButtonText,
                        broker.connected && styles.actionButtonTextConnected
                      ]}>
                        {broker.connected ? 'Connected' : 'Connect'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No brokers found</Text>
                  <Text style={styles.emptyStateSubtext}>Try adjusting your search</Text>
                </View>
              )}
            </View>

            {/* Invite Banner */}
            <View style={styles.inviteBanner}>
              <View style={styles.inviteIconContainer}>
                <Send size={18} color="#4f46e5" />
              </View>
              <View style={styles.inviteContent}>
                <Text style={styles.inviteTitle}>Expand Your Network</Text>
                <Text style={styles.inviteSubtitle}>
                  Invite fellow brokers to collaborate and grow together
                </Text>
              </View>
              <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: 'white',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Search Bar
  searchContainer: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    padding: 0,
  },

  // Results Text
  resultsText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 12,
  },

  // Broker List
  brokerList: {
    gap: 10,
  },

  // Broker Card
  brokerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  brokerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  // Avatar
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarConnected: {
    backgroundColor: '#dcfce7',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  connectedDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    borderWidth: 1.5,
    borderColor: 'white',
  },

  // Broker Info
  brokerInfo: {
    flex: 1,
  },
  brokerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  propertiesText: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },

  // Action Button
  actionButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  actionButtonConnected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  actionButtonTextConnected: {
    color: '#16a34a',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Invite Banner
  inviteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
    gap: 10,
  },
  inviteIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteContent: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  inviteSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 14,
  },
  inviteButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inviteButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CollaborationSheet;