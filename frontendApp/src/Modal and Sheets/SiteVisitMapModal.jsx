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
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  Linking
} from 'react-native';
import styles from '../styles/siteVisitStyles';

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

export default SiteVisitMapModal;
