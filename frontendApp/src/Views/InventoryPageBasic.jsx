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
  Image,
  Modal,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput
} from 'react-native';
import styles from '../styles/inventoryStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



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

const InventoryPage = ({ properties = [], onSelect, onEdit, onAddProperty }) => {
  const [listingFilter, setListingFilter] = useState('Sell');
  const [activeCategory, setActiveCategory] = useState('Residential');
  const [activeType, setActiveType] = useState('All');
  const [activeBHK, setActiveBHK] = useState('All');
  const [activeCommercialConfig, setActiveCommercialConfig] = useState('All');
  const [activeFurnishing, setActiveFurnishing] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const insets = useSafeAreaInsets();

  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];

    const filtered = properties.filter(p => {
      if (!p || typeof p !== 'object') return false;

      const matchListing = (p.listingType || 'Sell') === listingFilter;
      const matchCategory = (p.category || 'Residential') === activeCategory;
      const matchType = activeType === 'All' || p.type === activeType;
      const matchBHK = activeBHK === 'All' || p.bhk === activeBHK;
      const matchCommercialConfig = activeCommercialConfig === 'All' || p.commercialConfig === activeCommercialConfig;
      const matchFurnishing = activeFurnishing === 'All' || p.furnishing === activeFurnishing;

      return matchListing && matchCategory && matchType && matchBHK && matchCommercialConfig && matchFurnishing;
    });

    return filtered;
  }, [properties, listingFilter, activeCategory, activeType, activeBHK, activeCommercialConfig, activeFurnishing]);

  const getStatusBadgeStyle = (status) => {
    if (status?.toLowerCase() === 'sold') {
      return styles.statusBadgeSold;
    }
    return styles.statusBadge;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* HEADER SECTION */}
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

          {/* CHIPS */}
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
      </View>

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
            <View style={styles.propertyImageContainer}>
              <Image
                source={{ uri: property.image }}
                style={styles.propertyImage}
                resizeMode="cover"
              />
              <View style={styles.propertyImageOverlay}>
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
              </View>
            </View>

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

              {activeCategory === 'Residential' && (activeType === 'All' || activeType === 'Apartment/Flats' || activeType === 'Builder Floor' || activeType === 'House/Villa') && (
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

              {activeCategory === 'Commercial' && (activeType === 'All' || (activeType !== 'Plot/Land' && activeType !== 'Other')) && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Configuration</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      onPress={() => setActiveCommercialConfig('All')}
                      style={[
                        styles.filterOption,
                        activeCommercialConfig === 'All' && styles.filterOptionActive
                      ]}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        activeCommercialConfig === 'All' && styles.filterOptionTextActive
                      ]}>
                        All
                      </Text>
                    </TouchableOpacity>

                    {(() => {
                      let configs = [];
                      if (activeType === 'All' || activeType === 'Office') {
                        configs = [...configs, 'Co-working Space', 'Bareshell Office', 'Ready to Move Office'];
                      }
                      if (activeType === 'All' || activeType === 'Shop/Showroom') {
                        configs = [...configs, 'Shop', 'Showroom', 'Retail Space'];
                      }
                      if (activeType === 'All' || activeType === 'Storage') {
                        configs = [...configs, 'Cold Storage', 'Warehouse', 'Godown'];
                      }
                      if (activeType === 'All' || activeType === 'Industry') {
                        configs = [...configs, 'Manufacturing', 'Factory', 'Industrial Unit'];
                      }
                      if (activeType === 'All' || activeType === 'Hospitality') {
                        configs = [...configs, 'Guesthouse', 'Banquet Halls', 'Hotels/Resorts'];
                      }

                      return configs.map(config => (
                        <TouchableOpacity
                          key={config}
                          onPress={() => setActiveCommercialConfig(config)}
                          style={[
                            styles.filterOption,
                            activeCommercialConfig === config && styles.filterOptionActive
                          ]}
                        >
                          <Text style={[
                            styles.filterOptionText,
                            activeCommercialConfig === config && styles.filterOptionTextActive
                          ]}>
                            {config}
                          </Text>
                        </TouchableOpacity>
                      ));
                    })()}
                  </View>
                </View>
              )}

              {((activeCategory === 'Residential' && (activeType === 'All' || (activeType !== 'Plot' && activeType !== 'Farmhouse'))) ||
                (activeCategory === 'Commercial' && (activeType === 'All' || activeType === 'Office' || activeType === 'Shop/Showroom') && activeCommercialConfig !== 'Bareshell Office')) && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Furnishing</Text>
                    <View style={styles.filterOptions}>
                      <TouchableOpacity
                        onPress={() => setActiveFurnishing('All')}
                        style={[
                          styles.filterOption,
                          activeFurnishing === 'All' && styles.filterOptionActive
                        ]}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          activeFurnishing === 'All' && styles.filterOptionTextActive
                        ]}>
                          All
                        </Text>
                      </TouchableOpacity>

                      {['Unfurnished', 'Semi', 'Furnished'].map(furn => (
                        <TouchableOpacity
                          key={furn}
                          onPress={() => setActiveFurnishing(furn)}
                          style={[
                            styles.filterOption,
                            activeFurnishing === furn && styles.filterOptionActive
                          ]}
                        >
                          <Text style={[
                            styles.filterOptionText,
                            activeFurnishing === furn && styles.filterOptionTextActive
                          ]}>
                            {furn}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => {
                  setActiveCategory('Residential');
                  setActiveType('All');
                  setActiveBHK('All');
                  setActiveCommercialConfig('All');
                  setActiveFurnishing('All');
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

      {onAddProperty && (
        <TouchableOpacity
          onPress={onAddProperty}
          style={[styles.fab, { bottom: 30 + insets.bottom }]}
          activeOpacity={0.8}
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default InventoryPage;