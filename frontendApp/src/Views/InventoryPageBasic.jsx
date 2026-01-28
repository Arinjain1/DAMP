import { LinearGradient } from 'expo-linear-gradient';
import {
    Building,
    Edit3,
    Filter,
    Layout,
    MapPin,
    Plus,
    Search,
    X
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';


const SCREEN_WIDTH = Dimensions.get('window').width;

const PROPERTY_STRUCTURE = {
  Residential: { types: ['Apartment/Flats', 'Builder Floor', 'House/Villa', 'Plot/Land', 'Farmhouse', 'Other'] },
  Commercial: { types: ['Office', 'Shop/Showroom', 'Storage', 'Industry', 'Hospitality', 'Plot/Land', 'Other'] },
  Agriculture: { types: ['Farm Land', 'Farm House'] }
};

const formatCurrency = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numAmount || 0);
};

const InventoryPage = ({ properties = [], onSelect, onEdit, onAddProperty }) => {
  const [listingFilter, setListingFilter] = useState('Sell');
  const [activeCategory, setActiveCategory] = useState('Residential');
  const [activeType, setActiveType] = useState('All');
  const [activeBHK, setActiveBHK] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const insets = useSafeAreaInsets();

  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];
    return properties.filter(p => {
      if (!p || typeof p !== 'object') return false;
      const matchListing = (p.listingType || 'Sell') === listingFilter;
      const matchCategory = (p.category || 'Residential') === activeCategory;
      const matchType = activeType === 'All' || p.type === activeType;
      const matchBHK = activeBHK === 'All' || p.bhk === activeBHK;
      return matchListing && matchCategory && matchType && matchBHK;
    });
  }, [properties, listingFilter, activeCategory, activeType, activeBHK]);

  const getStatusBadgeStyle = (status) => {
    if (status?.toLowerCase() === 'sold') {
      return styles.statusBadgeSold;
    }
    return styles.statusBadge;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* 🔥 PURPLE TOP SHADE (NO BOX FEEL) */}
      <LinearGradient
        colors={['#BFB7FD', '#E5E1FF', '#f9fafb']} 
        locations={[0, 0.7, 1]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerTitle}>Properties</Text>
              <Text style={styles.headerSubtitle}>Manage your portfolio</Text>
            </View>

            <View style={styles.toggleContainer}>
              {['Sell', 'Rent'].map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setListingFilter(f)}
                  style={[
                    styles.toggleButton,
                    listingFilter === f && styles.toggleButtonActive
                  ]}
                >
                  <Text style={[
                    styles.toggleText,
                    listingFilter === f && styles.toggleTextActive
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.keys(PROPERTY_STRUCTURE).map(cat => {
                const isActive = activeCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setActiveCategory(cat);
                      setActiveType('All');
                      setActiveBHK('All');
                    }}
                    style={styles.categoryTab}
                  >
                    <Text style={[
                      styles.categoryText,
                      isActive && styles.categoryTextActive
                    ]}>
                      {cat}
                    </Text>
                    {isActive && <View style={styles.activeUnderline} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setActiveType('All')}
                style={[
                  styles.chip,
                  activeType === 'All' ? styles.chipActive : styles.chipInactive
                ]}
              >
                <Text style={[
                  styles.chipText,
                  activeType === 'All' ? styles.chipTextActive : styles.chipTextInactive
                ]}>All</Text>
              </TouchableOpacity>

              {PROPERTY_STRUCTURE[activeCategory]?.types.map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setActiveType(t)}
                  style={[
                    styles.chip,
                    activeType === t ? styles.chipActive : styles.chipInactive
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    activeType === t ? styles.chipTextActive : styles.chipTextInactive
                  ]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </LinearGradient>

      {/* CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultCountText}>
            {filteredProperties.length} Properties found
          </Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={14} color="#111827" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {filteredProperties.length === 0 && (
          <View style={styles.emptyState}>
            <Search size={48} color="#e5e7eb" />
            <Text style={styles.emptyTitle}>No Matches Found</Text>
            <Text style={styles.emptySubtitle}>Try changing filters</Text>
          </View>
        )}

        {/* PROPERTY CARDS */}
        {filteredProperties.map(property => (
          <TouchableOpacity
            key={property.id}
            onPress={() => onSelect && onSelect(property)}
            style={styles.propertyCard}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={{ uri: property.image }}
              style={styles.propertyImage}
              imageStyle={styles.propertyImageStyle}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.propertyImageOverlay}
              >
                <View style={styles.propertyImageContent}>
                  <View style={styles.propertyBadges}>
                    <View style={getStatusBadgeStyle(property.status)}>
                      <Text style={styles.statusBadgeText}>{property.status}</Text>
                    </View>
                    {property.bhk && (
                      <View style={styles.bhkBadge}>
                        <Text style={styles.bhkBadgeText}>{property.bhk}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => onEdit && onEdit(property, 'Property')}
                    style={styles.editButton}
                  >
                    <Edit3 size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </ImageBackground>

            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {property.title}
              </Text>
              <View style={styles.propertyLocation}>
                <MapPin size={12} color="#6b7280" />
                <Text style={styles.propertyLocationText} numberOfLines={1}>
                  {property.location}
                </Text>
              </View>
              
              <View style={styles.propertyDetails}>
                <View style={styles.propertyDetailItem}>
                  <Layout size={12} color="#6b7280" />
                  <Text style={styles.propertyDetailText}>{property.size} sqft</Text>
                </View>
                <View style={styles.propertyDetailItem}>
                  <Building size={12} color="#6b7280" />
                  <Text style={styles.propertyDetailText}>{property.type}</Text>
                </View>
              </View>

              <View style={styles.propertyFooter}>
                <Text style={styles.propertyPrice}>
                  {formatCurrency(property.price)}
                </Text>
                <Text style={styles.propertyListingType}>
                  For {property.listingType}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity 
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Property Category */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Property Category</Text>
                <View style={styles.filterOptions}>
                  {Object.keys(PROPERTY_STRUCTURE).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        setActiveCategory(cat);
                        setActiveType('All');
                        setActiveBHK('All');
                      }}
                      style={[
                        styles.filterOption,
                        activeCategory === cat && styles.filterOptionActive
                      ]}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        activeCategory === cat && styles.filterOptionTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Property Type */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Property Type</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    onPress={() => setActiveType('All')}
                    style={[
                      styles.filterOption,
                      activeType === 'All' && styles.filterOptionActive
                    ]}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      activeType === 'All' && styles.filterOptionTextActive
                    ]}>
                      All Types
                    </Text>
                  </TouchableOpacity>
                  
                  {PROPERTY_STRUCTURE[activeCategory]?.types.map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setActiveType(type)}
                      style={[
                        styles.filterOption,
                        activeType === type && styles.filterOptionActive
                      ]}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        activeType === type && styles.filterOptionTextActive
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* BHK Configuration (Only for Residential) */}
              {activeCategory === 'Residential' && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Configuration</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      onPress={() => setActiveBHK('All')}
                      style={[
                        styles.filterOption,
                        activeBHK === 'All' && styles.filterOptionActive
                      ]}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        activeBHK === 'All' && styles.filterOptionTextActive
                      ]}>
                        All BHK
                      </Text>
                    </TouchableOpacity>
                    
                    {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map(bhk => (
                      <TouchableOpacity
                        key={bhk}
                        onPress={() => setActiveBHK(bhk)}
                        style={[
                          styles.filterOption,
                          activeBHK === bhk && styles.filterOptionActive
                        ]}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          activeBHK === bhk && styles.filterOptionTextActive
                        ]}>
                          {bhk}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => {
                  setActiveCategory('Residential');
                  setActiveType('All');
                  setActiveBHK('All');
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      {onAddProperty && (
        <TouchableOpacity
          onPress={onAddProperty}
          className="absolute right-[5vw] w-[15vw] h-[15vw] bg-gray-900 rounded-full items-center justify-center"
          style={{ bottom: 30 + insets.bottom }}
          activeOpacity={0.8}
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#3E3E3E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },

  toggleContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 4,
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#000000', 
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#ffffff',
  },

  categoryContainer: {
    marginBottom: 16,
  },
  categoryTab: {
    marginRight: 24,
    paddingBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
  },
  categoryTextActive: {
    color: '#111827',
  },
  activeUnderline: {
    height: 2,
    backgroundColor: '#111827',
    marginTop: 6,
    borderRadius: 2,
  },

  chipsContainer: { paddingBottom: 8 },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  chipInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#ffffff' },
  chipTextInactive: { color: '#6b7280' },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
  },
  filterButton: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },

  // Property Cards
  propertyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  propertyImage: {
    height: 200,
    width: '100%',
  },
  propertyImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  propertyImageOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  propertyImageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)', // Green for Available
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeSold: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red for Sold
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  bhkBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bhkBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 8,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  propertyLocationText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  propertyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyDetailText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  propertyListingType: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  filterOptionActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterOptionTextActive: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default InventoryPage;