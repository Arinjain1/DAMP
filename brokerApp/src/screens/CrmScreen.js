import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter, setSearchQuery, addLead, updateLeadStatus } from '../redux/slices/crmSlice';

const CrmScreen = () => {
  const dispatch = useDispatch();
  const { leads, filter, searchQuery } = useSelector((state) => state.crm);

  const [modalVisible, setModalVisible] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadProperty, setNewLeadProperty] = useState('');
  const [newLeadBudget, setNewLeadBudget] = useState('');

  const handleAddNewLead = () => {
    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter Name and Phone number.');
      return;
    }

    const createdLead = {
      id: Date.now().toString(),
      name: newLeadName.trim(),
      phone: newLeadPhone.trim(),
      type: 'Buyer',
      budget: newLeadBudget.trim() || '₹ 1.5 Cr',
      status: 'Hot Leads',
      statusColor: '#EF4444',
      property: newLeadProperty.trim() || 'Central Park Heights',
    };

    dispatch(addLead(createdLead));
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadProperty('');
    setNewLeadBudget('');
    setModalVisible(false);
    Alert.alert('Lead Created', 'New lead added to your CRM pipeline successfully!');
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter =
      filter === 'All' ? true : lead.status.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone.includes(searchQuery) ||
          lead.property.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>CRM & Leads</Text>
            <Text style={styles.subtitle}>{leads.length} Active prospects in pipeline</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>New Lead</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads, phone, property..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={(txt) => dispatch(setSearchQuery(txt))}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => dispatch(setSearchQuery(''))}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {['All', 'Follow Up', 'Site Visit', 'Hot Leads'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterPill, filter === item && styles.filterPillActive]}
              onPress={() => dispatch(setFilter(item))}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lead Cards from Redux */}
        {filteredLeads.map((lead) => (
          <View key={lead.id} style={styles.leadCard}>
            <View style={styles.leadTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{lead.name[0]}</Text>
              </View>
              <View style={styles.leadInfo}>
                <Text style={styles.leadName}>{lead.name}</Text>
                <Text style={styles.leadPhone}>{lead.phone}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const nextStatus =
                    lead.status === 'Follow Up'
                      ? 'Site Visit Scheduled'
                      : lead.status === 'Site Visit Scheduled'
                      ? 'Negotiation'
                      : 'Follow Up';
                  const nextColor =
                    nextStatus === 'Site Visit Scheduled'
                      ? '#05DF8E'
                      : nextStatus === 'Negotiation'
                      ? '#3B82F6'
                      : '#F59E0B';
                  dispatch(
                    updateLeadStatus({ id: lead.id, status: nextStatus, statusColor: nextColor })
                  );
                }}
                style={[styles.statusBadge, { backgroundColor: `${lead.statusColor}1A` }]}
              >
                <Text style={[styles.statusText, { color: lead.statusColor }]}>{lead.status}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.leadBottom}>
              <View>
                <Text style={styles.metaLabel}>Looking for</Text>
                <Text style={styles.metaVal}>{lead.property}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>Budget</Text>
                <Text style={styles.metaVal}>{lead.budget}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Alert.alert('Calling Lead', `Dialing ${lead.phone}...`)}
              >
                <Ionicons name="call-outline" size={16} color="#05DF8E" />
                <Text style={styles.actionBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Alert.alert('WhatsApp', `Opening WhatsApp chat with ${lead.name}...`)}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                <Text style={styles.actionBtnText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Alert.alert('Schedule', `Site visit scheduled with ${lead.name}`)}
              >
                <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
                <Text style={styles.actionBtnText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredLeads.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyText}>No leads found</Text>
          </View>
        )}
      </ScrollView>

      {/* New Lead Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Lead</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Lead Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Ramesh Chandra"
              value={newLeadName}
              onChangeText={setNewLeadName}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. +91 98765 00000"
              keyboardType="phone-pad"
              value={newLeadPhone}
              onChangeText={setNewLeadPhone}
            />

            <Text style={styles.inputLabel}>Target Property / Location</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. DLF Cyber Park"
              value={newLeadProperty}
              onChangeText={setNewLeadProperty}
            />

            <Text style={styles.inputLabel}>Approx Budget</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. ₹ 2.5 Cr"
              value={newLeadBudget}
              onChangeText={setNewLeadBudget}
            />

            <TouchableOpacity style={styles.submitLeadBtn} onPress={handleAddNewLead}>
              <Text style={styles.submitLeadBtnText}>Save Lead to Redux</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1E293B',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  leadTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
  },
  leadPhone: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  leadBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metaLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
  },
  metaVal: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E293B',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#334155',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Inter_500Medium',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#0F172A',
  },
  submitLeadBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  submitLeadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default CrmScreen;
