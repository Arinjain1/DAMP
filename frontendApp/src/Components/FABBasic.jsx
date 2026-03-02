import { Text, TouchableOpacity } from 'react-native';
import styles from '../styles/fabBasicStyles';

const FABBasic = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.fab}
    >
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
  );
};

export default FABBasic;