import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

const CustomerHeader = ({ name, phone, onClose }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onClose} style={styles.backButton}>
      <ArrowLeft size={24} color="#111827" />
    </TouchableOpacity>
    <View style={styles.headerContentCentered}>
      <Text style={styles.customerNameCentered}>{name}</Text>
      {phone ? <Text style={styles.customerPhoneCentered}>{phone}</Text> : null}
    </View>
    <View style={{ width: 44 }} />
  </View>
);

const styles = {
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 99,
  },
  headerContentCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerNameCentered: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  customerPhoneCentered: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
};

export default CustomerHeader;
