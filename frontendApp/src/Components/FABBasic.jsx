import { Text, TouchableOpacity } from 'react-native';

const FABBasic = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        position: 'absolute',
        right: 20,
        bottom: 80,
        width: 56,
        height: 56,
        backgroundColor: '#111827',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
      }}
    >
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>+</Text>
    </TouchableOpacity>
  );
};

export default FABBasic;