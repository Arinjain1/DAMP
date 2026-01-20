import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const InventoryPageSimple = ({ properties = [], onSelect, onEdit }) => {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-14 px-5">
        <Text className="text-3xl font-black text-gray-900">Inventory</Text>
        <Text className="text-sm text-gray-400 mt-1">Manage your portfolio</Text>
      </View>
      
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 20 }}>
        <Text className="text-gray-600 mb-4">
          {properties.length} Properties found
        </Text>
        
        {properties.length > 0 ? (
          <View className="gap-4">
            {properties.map(p => (
              p && p.id ? (
                <TouchableOpacity 
                  key={p.id} 
                  onPress={() => onSelect && onSelect(p)} 
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <Text className="font-bold text-gray-900 text-lg mb-2">
                    {p.title || 'Property'}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {p.location || 'Location not specified'}
                  </Text>
                  <Text className="text-blue-600 font-bold mt-2">
                    ₹{p.price || '0'}
                  </Text>
                </TouchableOpacity>
              ) : null
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-900 font-bold text-lg">No Properties Found</Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Add some properties to get started.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default InventoryPageSimple;