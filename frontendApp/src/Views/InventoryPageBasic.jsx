import {
  Building,
  Edit3,
  Filter,
  Layout,
  MapPin,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react-native';
import { useMemo, useState, memo, useCallback, useEffect } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../Components/Skeleton'; // Make sure this path is correct

const PROPERTY_STRUCTURE = {
  Residential: { types: ['Apartment/Flats', 'Builder Floor', 'House/Villa', 'Plot', 'Farmhouse', 'Other'] },
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

// ==========================================
// 🚀 MEMOIZED PROPERTY CARD
// ==========================================
const PropertyCard = memo(({ property, onSelect, onEdit, onDelete }) => {
  const getStatusBadgeStyle = (status) => {
    if (status?.toLowerCase() === 'sold') return styles.statusBadgeSold;
    return styles.statusBadge;
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${property.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete && onDelete(property.id) },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={() => onSelect && onSelect(property)}
      style={styles.propertyCard}
      activeOpacity={0.9}
    >
      <View style={styles.propertyImageContainer}>
        <Image source={{ uri: property.image }} style={styles.propertyImage} resizeMode="cover" />
        <View style={styles.propertyImageOverlay}>
          <View style={styles.propertyImageContent}>
            <View style={styles.propertyBadges}>
              <View style={getStatusBadgeStyle(property.status)}>
                <Text style={styles.statusBadgeText}>{property.status}</Text>
              </View>
              {property.configuration && (
                <View style={styles.bhkBadge}>
                  <Text style={styles.bhkBadgeText}>{property.configuration}</Text>
                </View>
              )}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(property, 'Property');
                }}
                style={styles.editButton}
              >
                <Edit3 size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Trash2 size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
        <View style={styles.propertyLocation}>
          <MapPin size={12} color="#6b7280" />
          <Text style={styles.propertyLocationText} numberOfLines={1}>{property.location}</Text>
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
          <Text style={styles.propertyPrice}>{formatCurrency(property.price)}</Text>
          <Text style={styles.propertyListingType}>For {property.listingType}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
PropertyCard.displayName = 'PropertyCard';

// ==========================================
// 🚀 MEMOIZED FILTER MODAL (ISOLATED STATE)
// ==========================================
const FilterModal = memo(({ visible, onClose, onApply, currentFilters }) => {
  const [isReady, setIsReady] = useState(false);
  
  // Local state so main list doesn't lag while clicking filters
  const [localCategory, setLocalCategory] = useState(currentFilters.category);
  const [localType, setLocalType] = useState(currentFilters.type);
  const [localBHK, setLocalBHK] = useState(currentFilters.bhk);
  const [localConfig, setLocalConfig] = useState(currentFilters.commercialConfig);
  const [localFurnishing, setLocalFurnishing] = useState(currentFilters.furnishing);

  useEffect(() => {
    if (visible) {
      setIsReady(false);
      // Sync local state with parent state when opening
      setLocalCategory(currentFilters.category);
      setLocalType(currentFilters.type);
      setLocalBHK(currentFilters.bhk);
      setLocalConfig(currentFilters.commercialConfig);
      setLocalFurnishing(currentFilters.furnishing);

      const timer = setTimeout(() => setIsReady(true), 50); // Skeleton delay
      return () => clearTimeout(timer);
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    onApply({
      category: localCategory,
      type: localType,
      bhk: localBHK,
      commercialConfig: localConfig,
      furnishing: localFurnishing
    });
  };

  const handleClearAll = () => {
    setLocalCategory('Residential');
    setLocalType('All');
    setLocalBHK('All');
    setLocalConfig('All');
    setLocalFurnishing('All');
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {!isReady ? (
              // --- SKELETON LOADER ---
              <View style={{ gap: 24, paddingTop: 10 }}>
                {[1, 2, 3].map((section) => (
                  <View key={section} style={styles.filterSection}>
                    <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 12 }} />
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      <Skeleton width={90} height={36} borderRadius={20} />
                      <Skeleton width={100} height={36} borderRadius={20} />
                      <Skeleton width={80} height={36} borderRadius={20} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              // --- ACTUAL FILTERS ---
              <>
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Property Category</Text>
                  <View style={styles.filterOptions}>
                    {Object.keys(PROPERTY_STRUCTURE).map(cat => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => {
                          setLocalCategory(cat);
                          setLocalType('All');
                          setLocalBHK('All');
                        }}
                        style={[styles.filterOption, localCategory === cat && styles.filterOptionActive]}
                      >
                        <Text style={[styles.filterOptionText, localCategory === cat && styles.filterOptionTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Property Type</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      onPress={() => setLocalType('All')}
                      style={[styles.filterOption, localType === 'All' && styles.filterOptionActive]}
                    >
                      <Text style={[styles.filterOptionText, localType === 'All' && styles.filterOptionTextActive]}>All Types</Text>
                    </TouchableOpacity>
                    
                    {PROPERTY_STRUCTURE[localCategory]?.types.map(type => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setLocalType(type)}
                        style={[styles.filterOption, localType === type && styles.filterOptionActive]}
                      >
                        <Text style={[styles.filterOptionText, localType === type && styles.filterOptionTextActive]}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {localCategory === 'Residential' && (localType === 'All' || localType === 'Apartment/Flats' || localType === 'Builder Floor' || localType === 'House/Villa') && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Configuration</Text>
                    <View style={styles.filterOptions}>
                      <TouchableOpacity
                        onPress={() => setLocalBHK('All')}
                        style={[styles.filterOption, localBHK === 'All' && styles.filterOptionActive]}
                      >
                        <Text style={[styles.filterOptionText, localBHK === 'All' && styles.filterOptionTextActive]}>All BHK</Text>
                      </TouchableOpacity>
                      
                      {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map(bhk => (
                        <TouchableOpacity
                          key={bhk}
                          onPress={() => setLocalBHK(bhk)}
                          style={[styles.filterOption, localBHK === bhk && styles.filterOptionActive]}
                        >
                          <Text style={[styles.filterOptionText, localBHK === bhk && styles.filterOptionTextActive]}>{bhk}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {localCategory === 'Commercial' && (localType === 'All' || (localType !== 'Plot/Land' && localType !== 'Other')) && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Configuration</Text>
                    <View style={styles.filterOptions}>
                      <TouchableOpacity
                        onPress={() => setLocalConfig('All')}
                        style={[styles.filterOption, localConfig === 'All' && styles.filterOptionActive]}
                      >
                        <Text style={[styles.filterOptionText, localConfig === 'All' && styles.filterOptionTextActive]}>All</Text>
                      </TouchableOpacity>
                      
                      {(() => {
                        let configs = [];
                        if (localType === 'All' || localType === 'Office') configs = [...configs, 'Co-working Space', 'Bareshell Office', 'Ready to Move Office'];
                        if (localType === 'All' || localType === 'Shop/Showroom') configs = [...configs, 'Shop', 'Showroom', 'Retail Space'];
                        if (localType === 'All' || localType === 'Storage') configs = [...configs, 'Cold Storage', 'Warehouse', 'Godown'];
                        if (localType === 'All' || localType === 'Industry') configs = [...configs, 'Manufacturing', 'Factory', 'Industrial Unit'];
                        if (localType === 'All' || localType === 'Hospitality') configs = [...configs, 'Guesthouse', 'Banquet Halls', 'Hotels/Resorts'];
                        
                        return configs.map(config => (
                          <TouchableOpacity
                            key={config}
                            onPress={() => setLocalConfig(config)}
                            style={[styles.filterOption, localConfig === config && styles.filterOptionActive]}
                          >
                            <Text style={[styles.filterOptionText, localConfig === config && styles.filterOptionTextActive]}>{config}</Text>
                          </TouchableOpacity>
                        ));
                      })()}
                    </View>
                  </View>
                )}

                {((localCategory === 'Residential' && (localType === 'All' || (localType !== 'Plot' && localType !== 'Farmhouse'))) || 
                  (localCategory === 'Commercial' && (localType === 'All' || localType === 'Office' || localType === 'Shop/Showroom') && localConfig !== 'Bareshell Office')) && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Furnishing</Text>
                    <View style={styles.filterOptions}>
                      <TouchableOpacity
                        onPress={() => setLocalFurnishing('All')}
                        style={[styles.filterOption, localFurnishing === 'All' && styles.filterOptionActive]}
                      >
                        <Text style={[styles.filterOptionText, localFurnishing === 'All' && styles.filterOptionTextActive]}>All</Text>
                      </TouchableOpacity>
                      
                      {['Unfurnished', 'Semi', 'Furnished'].map(furn => (
                        <TouchableOpacity
                          key={furn}
                          onPress={() => setLocalFurnishing(furn)}
                          style={[styles.filterOption, localFurnishing === furn && styles.filterOptionActive]}
                        >
                          <Text style={[styles.filterOptionText, localFurnishing === furn && styles.filterOptionTextActive]}>{furn}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});
FilterModal.displayName = 'FilterModal';


// ==========================================
// 🚀 MAIN INVENTORY PAGE
// ==========================================
const InventoryPage = ({ properties = [], onSelect, onEdit, onDelete, onAddProperty }) => {
  const [listingFilter, setListingFilter] = useState('Sell');
  const [activeCategory, setActiveCategory] = useState('Residential');
  const [activeType, setActiveType] = useState('All');
  const [activeBHK, setActiveBHK] = useState('All');
  const [activeCommercialConfig, setActiveCommercialConfig] = useState('All');
  const [activeFurnishing, setActiveFurnishing] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];
    
    return properties.filter(p => {
      if (!p || typeof p !== 'object') return false;
      
      const matchListing = (p.listingType || 'Sell') === listingFilter;
      const matchCategory = (p.category || 'Residential') === activeCategory;
      const matchType = activeType === 'All' || p.type === activeType;
      const matchBHK = activeBHK === 'All' || p.configuration === activeBHK;
      const matchCommercialConfig = activeCommercialConfig === 'All' || p.commercialConfig === activeCommercialConfig;
      const matchFurnishing = activeFurnishing === 'All' || p.furnishingStatus === activeFurnishing;
      
      const matchSearch = searchQuery === '' || 
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.configuration && p.configuration.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.ownerName && p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchListing && matchCategory && matchType && matchBHK && matchCommercialConfig && matchFurnishing && matchSearch;
    });
  }, [properties, listingFilter, activeCategory, activeType, activeBHK, activeCommercialConfig, activeFurnishing, searchQuery]);

  const renderPropertyCard = useCallback(({ item }) => (
    <PropertyCard property={item} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} />
  ), [onSelect, onEdit, onDelete]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const handleApplyFilters = useCallback((newFilters) => {
    setActiveCategory(newFilters.category);
    setActiveType(newFilters.type);
    setActiveBHK(newFilters.bhk);
    setActiveCommercialConfig(newFilters.commercialConfig);
    setActiveFurnishing(newFilters.furnishing);
    setShowFilterModal(false);
  }, []);

  const ListHeaderComponent = useMemo(() => (
    <View style={styles.searchAndFilterContainer}>
      <View style={styles.searchWrapper}>
        {!isSearchExpanded ? (
          <TouchableOpacity style={styles.searchButtonCompact} onPress={() => setIsSearchExpanded(true)}>
            <Search size={16} color="#6b7280" />
            <Text style={styles.searchButtonText}>Search...</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#9ca3af" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search properties..."
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchQuery(''); setIsSearchExpanded(false); }}>
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
        <Filter size={16} color="#111827" />
        {!isSearchExpanded && <Text style={styles.filterButtonText}>Filters</Text>}
      </TouchableOpacity>
    </View>
  ), [searchQuery, isSearchExpanded]);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyState}>
      <Search size={48} color="#e5e7eb" />
      <Text style={styles.emptyTitle}>No Matches Found</Text>
      <Text style={styles.emptySubtitle}>Try changing filters</Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.headerContainer}>
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
                  style={[styles.toggleButton, listingFilter === f && styles.toggleButtonActive]}
                >
                  <Text style={[styles.toggleText, listingFilter === f && styles.toggleTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Tabs */}
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
                      setActiveCommercialConfig('All');
                      setActiveFurnishing('All');
                    }}
                    style={styles.categoryTab}
                  >
                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat}</Text>
                    {isActive && <View style={styles.activeUnderline} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* CHIPS */}
          <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setActiveType('All')}
                style={[styles.chip, activeType === 'All' ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, activeType === 'All' ? styles.chipTextActive : styles.chipTextInactive]}>All</Text>
              </TouchableOpacity>

              {PROPERTY_STRUCTURE[activeCategory]?.types.map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setActiveType(t)}
                  style={[styles.chip, activeType === t ? styles.chipActive : styles.chipInactive]}
                >
                  <Text style={[styles.chipText, activeType === t ? styles.chipTextActive : styles.chipTextInactive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredProperties}
        keyExtractor={keyExtractor}
        renderItem={renderPropertyCard}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      <FilterModal 
        visible={showFilterModal} 
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={{
          category: activeCategory,
          type: activeType,
          bhk: activeBHK,
          commercialConfig: activeCommercialConfig,
          furnishing: activeFurnishing
        }}
      />

      {onAddProperty && (
        <TouchableOpacity onPress={onAddProperty} style={[styles.fab, { bottom: 30 + insets.bottom }]} activeOpacity={0.8}>
          <Plus size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  // --- HEADER SECTION ---
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', 
  },
  headerContent: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '900', fontFamily: 'Montserrat_700Bold', color: '#3E3E3E' },
  headerSubtitle: { fontSize: 14, fontFamily: 'Montserrat_400Regular', color: '#6b7280', marginTop: 2 },
  
  toggleContainer: { backgroundColor: '#F3F4F6', padding: 4, borderRadius: 12, flexDirection: 'row' },
  toggleButton: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10, minWidth: 60, alignItems: 'center' },
  toggleButtonActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '700', fontFamily: 'Montserrat_700Bold', color: '#6b7280' },
  toggleTextActive: { color: '#111827', fontFamily: 'Montserrat_700Bold' },

  categoryContainer: { marginBottom: 6 },
  categoryTab: { marginRight: 24, paddingBottom: 8 },
  categoryText: { fontSize: 14, fontWeight: '700', fontFamily: 'Montserrat_700Bold', color: '#9ca3af' },
  categoryTextActive: { color: '#111827', fontFamily: 'Montserrat_700Bold' },
  activeUnderline: { height: 2, backgroundColor: '#111827', marginTop: 6, borderRadius: 2 },

  chipsContainer: { paddingBottom: 1 },
  chip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  chipActive: { backgroundColor: '#9A8CFC', borderWidth: 0, shadowColor: '#B0A6F8' },
  chipInactive: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E5E7EB' },
  chipText: { fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },
  chipTextActive: { color: '#ffffff', fontWeight: '600' },
  chipTextInactive: { color: '#6B7280', fontWeight: '500' },

  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 100 },

  searchAndFilterContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  searchWrapper: { flex: 1 },
  searchButtonCompact: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, gap: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  searchButtonText: { fontSize: 13, fontFamily: 'Montserrat_400Regular', color: '#9ca3af' },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 2, gap: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Montserrat_400Regular', color: '#111827' },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  filterButtonText: { fontSize: 13, fontWeight: '700', fontFamily: 'Montserrat_700Bold', color: '#374151' },

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Montserrat_700Bold', marginTop: 12 },
  emptySubtitle: { fontSize: 14, fontFamily: 'Montserrat_400Regular', color: '#9ca3af', marginTop: 4 },

  propertyCard: { backgroundColor: '#ffffff', marginBottom: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  propertyImageContainer: { height: 200, width: '100%', position: 'relative', backgroundColor: '#f3f4f6' },
  propertyImage: { height: 200, width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  propertyImageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'space-between', padding: 16 },
  propertyImageContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  propertyBadges: { flexDirection: 'row', gap: 8 },
  statusBadge: { backgroundColor: 'rgba(34, 197, 94, 0.95)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeSold: { backgroundColor: 'rgba(239, 68, 68, 0.95)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { color: 'white', fontSize: 10, fontWeight: '700', fontFamily: 'Montserrat_700Bold' },
  bhkBadge: { backgroundColor: 'rgba(59, 130, 246, 0.95)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  bhkBadgeText: { color: 'white', fontSize: 10, fontWeight: '700', fontFamily: 'Montserrat_700Bold' },
  editButton: { backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: 8, borderRadius: 8 },
  deleteButton: { backgroundColor: 'rgba(239, 68, 68, 0.75)', padding: 8, borderRadius: 8 },
  cardActions: { flexDirection: 'row', gap: 8 },
  propertyInfo: { padding: 16 },
  propertyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Montserrat_700Bold', color: '#111827', marginBottom: 8 },
  propertyLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  propertyLocationText: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: '#6b7280', flex: 1 },
  propertyDetails: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  propertyDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  propertyDetailText: { fontSize: 11, color: '#6b7280', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  propertyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  propertyPrice: { fontSize: 18, fontWeight: '900', fontFamily: 'Montserrat_700Bold', color: '#111827' },
  propertyListingType: { fontSize: 12, color: '#6b7280', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },

  // --- MODAL ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Montserrat_700Bold', color: '#111827' },
  closeButton: { padding: 8, borderRadius: 8, backgroundColor: '#f9fafb' },
  modalContent: { flex: 1, padding: 20 },
  filterSection: { marginBottom: 24 },
  filterSectionTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Montserrat_700Bold', color: '#374151', marginBottom: 12 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white' },
  filterOptionActive: { backgroundColor: '#111827', borderColor: '#111827' },
  filterOptionText: { fontSize: 12, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', color: '#6b7280' },
  filterOptionTextActive: { color: 'white', fontFamily: 'Montserrat_600SemiBold' },
  modalFooter: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 12 },
  clearButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  clearButtonText: { fontSize: 14, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', color: '#6b7280' },
  applyButton: { flex: 2, paddingVertical: 12, borderRadius: 8, backgroundColor: '#111827', alignItems: 'center' },
  applyButtonText: { fontSize: 14, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', color: 'white' },
  fab: { position: 'absolute', right: '5%', width: 60, height: 60, backgroundColor: '#111827', borderRadius: 30, alignItems: 'center', justifyContent: 'center' }
});

export default InventoryPage;