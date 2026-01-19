import { Plus } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FAB = ({ onPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute right-[5vw] w-[15vw] h-[15vw] bg-gray-900 rounded-full items-center justify-center"
      style={{ bottom: 80 + insets.bottom }}
    >
      <Plus size={28} color="white" />
    </TouchableOpacity>
  );
};

export default FAB;
