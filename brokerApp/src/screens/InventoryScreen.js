import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  setActiveCategory,
  addProperty,
  togglePropertyStatus,
} from '../redux/slices/inventorySlice';

const InventoryScreen = () => {
  const dispatch = useDispatch();
  const { properties, activeCategory } = useSelector((state) => state.inventory);

  const [modalVisible, setModalVisible] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propType, setPropType] = useState('Apartment');
  const [propBhk, setPropBhk] = useState('');
  const [propArea, setPropArea] = useState('');
  const [propPrice, setPropPrice] = useState('');
  const [propLocation, setPropLocation] = useState('');

  const handleAddNewProperty = () => {
    if (!propTitle.trim() || !propPrice.trim()) {
      Alert.alert('Required Fields', 'Please enter property Title and Price.');
      return;
    }

    const newProperty = {
      id: Date.now().toString(),
      title: propTitle.trim(),
      type: propType,
      bhk: propBhk.trim() || '3 BHK',
      area: propArea.trim() || '1800 sq.ft',
      price: propPrice.trim(),
      location: propLocation.trim() || 'Gurgaon Prime',
      status: 'Available',
    };

    dispatch(addProperty(newProperty));
    setPropTitle('');
    setPropPrice('');
    setPropBhk('');
    setPropArea('');
    setPropLocation('');
    setModalVisible(false);
    Alert.alert('Listing Added', 'Property listing has been saved to Redux inventory!');
  };

  const filteredProperties = properties.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.type.toLowerCase().includes(activeCategory.toLowerCase().slice(0, 4));
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.subtitle}>{properties.length} Properties in inventory</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Property</Text>
          </TouchableOpacity>
        </View>

        {/* Filter categories from Redux */}
        <View style={styles.categoriesRow}>
          {['All', 'Apartments', 'Villas', 'Plots', 'Commercial'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
              onPress={() => dispatch(setActiveCategory(cat))}
            >
              <Text
                style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Property cards from Redux */}
        {filteredProperties.map((item) => (
          <View key={item.id} style={styles.propCard}>
            <View style={styles.propTop}>
              <View>
                <Text style={styles.propTitle}>{item.title}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color="#64748B" />
                  <Text style={styles.propLocation}>{item.location}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => dispatch(togglePropertyStatus(item.id))}
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === 'Available' ? '#ECFDF5' : '#FEF3C7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: item.status === 'Available' ? '#05DF8E' : '#D97706',
                    },
                  ]}
                >
                  {item.status}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.propDetailsRow}>
              <View style={styles.detailBadge}>
                <Ionicons name="home-outline" size={12} color="#475569" />
                <Text style={styles.detailBadgeText}>{item.bhk}</Text>
              </View>
              <View style={styles.detailBadge}>
                <Ionicons name="expand-outline" size={12} color="#475569" />
                <Text style={styles.detailBadgeText}>{item.area}</Text>
              </View>
              <View style={styles.detailBadge}>
                <Ionicons name="pricetag-outline" size={12} color="#475569" />
                <Text style={styles.detailBadgeText}>{item.type}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.askingText}>Asking Price</Text>
                <Text style={styles.priceVal}>{item.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() =>
                  Alert.alert(
                    'Share Listing',
                    `Listing link for "${item.title}" copied to clipboard!`
                  )
                }
              >
                <Ionicons name="share-social-outline" size={16} color="#0F172A" />
                <Text style={styles.shareBtnText}>Share Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredProperties.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyText}>No properties found in this category</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Property Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Property Listing</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Property Name / Society</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. DLF Magnolias"
              value={propTitle}
              onChangeText={setPropTitle}
            />

            <Text style={styles.inputLabel}>Asking Price</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. ₹ 4.5 Cr"
              value={propPrice}
              onChangeText={setPropPrice}
            />

            <Text style={styles.inputLabel}>Configuration (BHK)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 4 BHK Penthouse"
              value={propBhk}
              onChangeText={setPropBhk}
            />

            <Text style={styles.inputLabel}>Carpet Area</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 3200 sq.ft"
              value={propArea}
              onChangeText={setPropArea}
            />

            <Text style={styles.inputLabel}>Location / Sector</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Golf Course Road, Gurgaon"
              value={propLocation}
              onChangeText={setPropLocation}
            />

            <TouchableOpacity style={styles.submitPropBtn} onPress={handleAddNewProperty}>
              <Text style={styles.submitPropBtnText}>Add Property to Redux</Text>
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
    marginBottom: 16,
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
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  propCard: {
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
  propTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  propLocation: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  propDetailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  askingText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
  },
  priceVal: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
    marginTop: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  shareBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
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
    marginTop: 10,
    marginBottom: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 42,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#0F172A',
  },
  submitPropBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitPropBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default InventoryScreen;
