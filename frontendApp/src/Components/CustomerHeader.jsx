import { View, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

const CustomerHeader = ({ name, phone, onClose }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
      </View>
      <View>
        <Text style={styles.customerName}>{name}</Text>
        <Text style={styles.customerPhone}>{phone}</Text>
      </View>
    </View>
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <X size={24} color="#6b7280" />
    </TouchableOpacity>
  </View>
);

const styles = {
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    height: 44,
    width: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#374151',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  customerPhone: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 99,
  },
};

export default CustomerHeader;
