import React, { memo } from 'react';
import { Text, TouchableOpacity, View, Linking } from 'react-native';
import { Phone, MessageCircle } from 'lucide-react-native';

const ContactCard = memo(({ customer, styles }) => {
  return (
    <View style={styles.contactCard}>
      <View style={styles.contactInfoSection}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactAvatarText}>{customer.name.charAt(0)}</Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{customer.name}</Text>
          <Text style={styles.contactPhone}>{customer.phone}</Text>
        </View>
      </View>
      <View style={styles.contactButtonRow}>
        <TouchableOpacity
          style={styles.contactActionBtn}
          onPress={() => Linking.openURL(`tel:${customer.phone}`)}
        >
          <Phone size={18} color="#16a34a" />
          <Text style={styles.contactActionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactActionBtn}
          onPress={() => Linking.openURL(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`)}
        >
          <MessageCircle size={18} color="#25D366" />
          <Text style={styles.contactActionText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

ContactCard.displayName = 'ContactCard';

export default ContactCard;
