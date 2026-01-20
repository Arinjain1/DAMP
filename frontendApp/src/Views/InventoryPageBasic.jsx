import { LinearGradient } from 'expo-linear-gradient';
import {
    Building,
    Edit3,
    Filter,
    Layout,
    MapPin,
    Search
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PROPERTY_STRUCTURE = {
  Residential: { types: ['Apartment/Flats', 'Villa', 'Plot', 'Duplex'] },
  Commercial: { types: ['Office Space', 'Shop', 'Showroom', 'Warehouse'] },
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

const InventoryPage = ({ properties = [], onSelect, onEdit }) => {
  const [listingFilter, setListingFilter] = useState('Sell');
  const [activeCategory, setActiveCategory] = useState('Residential');
  const [activeType, setActiveType] = useState('All');

  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];
    return properties.filter(p => {
      if (!p || typeof p !== 'object') return false;
      const matchListing = (p.listingType || 'Sell') === listingFilter;
      const matchCategory = (p.category || 'Residential') === activeCategory;
      const matchType = activeType === 'All' || p.type === activeType;
      return matchListing && matchCategory && matchType;
    });
  }, [properties, listingFilter, activeCategory, activeType]);

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
          <TouchableOpacity style={styles.filterButton}>
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
                    <View style={styles.statusBadge}>
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
    color: '#ffffff', // White text for active state
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
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
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
});

export default InventoryPage;
