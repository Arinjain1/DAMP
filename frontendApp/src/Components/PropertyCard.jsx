import React, { memo } from 'react';
import { Image, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { MapPin, CircleCheckBig } from 'lucide-react-native';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const PropertyCard = memo(({ 
  property, 
  customer, 
  hasDeal, 
  onStartDeal, 
  onUpdateStage, 
  onOpenDeal,
  styles 
}) => {
  const handlePress = () => {
    if (customer.stage === 'Interested') {
      Alert.alert(
        '🤝 Start Deal',
        `Are you sure you want to start a deal for "${property.title}" with ${customer.name}?\n\nThis will move the customer to In-Process stage.`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Yes, Start Deal',
            onPress: () => {
              onStartDeal(customer, property);
              if (onUpdateStage) {
                onUpdateStage(customer.id, 'In-Process');
              }
              if (onOpenDeal) {
                const newDeal = {
                  customerId: customer.id,
                  propertyId: property.id,
                  stage: 'In-Process'
                };
                onOpenDeal(newDeal);
              }
            }
          }
        ]
      );
    } else {
      const queryStr = (property.latitude && property.longitude)
        ? `${property.latitude},${property.longitude}`
        : property.location;
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`);
    }
  };

  return (
    <View style={styles.matchCard}>
      <Image source={{ uri: property.image }} style={styles.matchImg} />
      <View style={styles.matchContent}>
        <View style={{ marginRight: 8, marginBottom: 6 }}>
          <Text style={styles.matchTitle} numberOfLines={1}>{property.title}</Text>
          <View style={[styles.rowCenter, { alignItems: 'flex-start', marginTop: 2 }]}>
            <MapPin size={12} color="#9ca3af" style={{ marginTop: 2 }} />
            <Text style={[styles.matchLoc, { flex: 1 }]} numberOfLines={2}>{property.address || property.location}</Text>
          </View>
        </View>

        <View style={styles.matchFooter}>
          <Text style={styles.matchPrice}>{formatCurrency(property.price)}</Text>
          {!hasDeal ? (
            <TouchableOpacity onPress={handlePress} style={styles.visitBtn}>
              {customer.stage !== 'Interested' && (
                <MapPin size={14} color="white" />
              )}
              <Text style={styles.visitBtnText}>
                {customer.stage === 'Interested' ? 'Start Deal' : 'Visit'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.dealStartedBadge}>
              <CircleCheckBig size={12} color="#059669" />
              <Text style={styles.dealStartedText}>Deal Started</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
