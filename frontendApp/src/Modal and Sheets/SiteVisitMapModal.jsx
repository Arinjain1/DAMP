import {
  Clock,
  MapPin,
  Phone,
  ThumbsDown,
  ThumbsUp,
  X
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const SiteVisitMapModal = ({ 
  visible, 
  onClose, 
  properties = [], 
  customer,
  onPropertyInterested,
  onPropertyNotInterested,
  onPropertyHold
}) => {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [isPropertyExpanded, setIsPropertyExpanded] = useState(true);

  if (!visible || properties.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.mapViewContainer}>
        {/* Background Map Image */}
        <Image 
          source={require('../../assets/images/Rectangle.png')} 
          style={styles.mapImage}
          resizeMode="cover"
        />
        
        {/* Header with Close Button */}
        <View style={styles.mapHeader}>
          <TouchableOpacity 
            style={styles.mapCloseButton}
            onPress={onClose}
          >
            <X size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Properties Horizontal Scroll - Small Cards */}
        {!isPropertyExpanded && (
          <View style={styles.collapsedModalCard}>
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => {
                if (properties.length > 0) {
                  setCurrentPropertyIndex(0);
                  setIsPropertyExpanded(true);
                }
              }}
            >
              <View style={styles.handleBar} />
              <Text style={styles.propertiesToShowLabel}>Visit Sites</Text>
            </TouchableOpacity>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.propertiesScrollContent}
            >
              {properties.map((prop, index) => (
                <TouchableOpacity 
                  key={prop.id} 
                  style={styles.propertyScrollCard}
                  onPress={() => {
                    setCurrentPropertyIndex(index);
                    setIsPropertyExpanded(true);
                  }}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: prop.image }} style={styles.propertyScrollImageSmall} />
                  <View style={styles.propertyScrollInfo}>
                    <Text style={styles.propertyScrollTitle} numberOfLines={2}>{prop.title}</Text>
                    <View style={styles.propertyScrollLocation}>
                      <MapPin size={14} color="#6b7280" />
                      <Text style={styles.propertyScrollLocationText} numberOfLines={1}>{prop.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Expanded Property Details */}
        {isPropertyExpanded && properties.length > 0 && (
          <View style={styles.expandedModalCard}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setIsPropertyExpanded(false)}
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.handleBar} />
            <Text style={styles.propertiesToShowLabel}>Properties to Visit</Text>

            <View style={styles.scrollWrapper}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.expandedPropertiesScroll}
                pagingEnabled={false}
                snapToInterval={322}
                decelerationRate="fast"
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / 322);
                  setCurrentPropertyIndex(index);
                }}
              >
                {properties.map((prop, index) => {
                  const isActive = currentPropertyIndex === index;
                  return (
                    <View 
                      key={prop.id} 
                      style={[
                        styles.expandedPropertyCard,
                        isActive && styles.expandedPropertyCardActive
                      ]}
                    >
                      <Image source={{ uri: prop.image }} style={styles.expandedPropertyCardImage} />
                      <View style={styles.expandedPropertyCardInfo}>
                        <View style={styles.propertyCardHeader}>
                          <Text style={styles.expandedPropertyCardTitle} numberOfLines={1}>
                            {prop.title}
                          </Text>
                        </View>
                        <View style={styles.expandedPropertyCardLocation}>
                          <MapPin size={12} color="#6b7280" />
                          <Text style={styles.expandedPropertyCardLocationText} numberOfLines={1}>
                            {prop.location}
                          </Text>
                        </View>
                        <Text style={styles.propertyPrice}>{formatCurrency(prop.price)}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Feedback Buttons */}
            <View style={styles.feedbackButtonsRow}>
              <TouchableOpacity 
                style={styles.feedbackBtn}
                onPress={() => {
                  const propId = properties[currentPropertyIndex]?.id;
                  if (propId && onPropertyInterested) {
                    onPropertyInterested(propId);
                  }
                }}
              >
                <ThumbsUp size={20} color="#374151" />
                <Text style={styles.feedbackTextHorizontal}>Interested</Text>
              </TouchableOpacity>
              <View style={styles.verticalDivider} />
              <TouchableOpacity 
                style={styles.feedbackBtn}
                onPress={() => {
                  const propId = properties[currentPropertyIndex]?.id;
                  if (propId && onPropertyNotInterested) {
                    onPropertyNotInterested(propId);
                  }
                }}
              >
                <ThumbsDown size={20} color="#374151" />
                <Text style={styles.feedbackTextHorizontal}>Not-Interested</Text>
              </TouchableOpacity>
              <View style={styles.verticalDivider} />
              <TouchableOpacity 
                style={styles.feedbackBtn}
                onPress={() => {
                  const propId = properties[currentPropertyIndex]?.id;
                  if (propId && onPropertyHold) {
                    onPropertyHold(propId);
                  }
                }}
              >
                <Clock size={20} color="#374151" />
                <Text style={styles.feedbackTextHorizontal}>Hold</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Owner Button */}
            <TouchableOpacity 
              style={styles.contactOwnerButton}
              onPress={() => {
                const prop = properties[currentPropertyIndex];
                if (prop && prop.ownerPhone) {
                  Linking.openURL(`tel:${prop.ownerPhone}`);
                }
              }}
            >
              <Phone size={18} color="#374151" />
              <Text style={styles.contactOwnerText}>Call Owner</Text>
            </TouchableOpacity>

            {/* Navigate Button */}
            <TouchableOpacity 
              style={styles.navigateButtonExpanded}
              onPress={() => {
                const prop = properties[currentPropertyIndex];
                if (prop) {
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.location)}`);
                }
              }}
            >
              <Text style={styles.navigateButtonExpandedText}>Navigate to Property</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mapViewContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  mapCloseButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collapsedModalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  propertiesScrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  propertyScrollCard: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginHorizontal: 6,
  },
  propertyScrollImageSmall: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  propertyScrollInfo: {
    flex: 1,
    gap: 6,
  },
  propertyScrollTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  propertyScrollLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyScrollLocationText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  expandedModalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 36,
    height: 36,
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  handleBar: {
    width: 70,
    height: 5,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  propertiesToShowLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 23,
    textAlign: 'center',
  },
  scrollWrapper: {
    marginBottom: 20,
  },
  expandedPropertiesScroll: {
    paddingHorizontal: 0,
    gap: 10,
    marginBottom: 20,
  },
  expandedPropertyCard: {
    width: 310,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginHorizontal: 6,
  },
  expandedPropertyCardActive: {
    borderColor: '#bfb7fd',
    backgroundColor: '#faf9ff',
  },
  expandedPropertyCardImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  expandedPropertyCardInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  propertyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  expandedPropertyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  expandedPropertyCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandedPropertyCardLocationText: {
    fontSize: 13,
    color: '#313131',
    flex: 1,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9f95f2',
    marginTop: 2,
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 16,
    alignItems: 'center',
  },
  feedbackBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 18,
  },
  verticalDivider: {
    width: 1.5,
    height: '60%',
    backgroundColor: '#e5e7eb',
  },
  feedbackTextHorizontal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  contactOwnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  contactOwnerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  navigateButtonExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a9a0f5',
    paddingVertical: 16,
    borderRadius: 14,
  },
  navigateButtonExpandedText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default SiteVisitMapModal;
