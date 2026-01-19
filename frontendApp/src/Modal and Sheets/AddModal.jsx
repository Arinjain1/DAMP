import { CloudUpload, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Mock Structure Data
const PROPERTY_STRUCTURE = {
  Residential: { types: ['Apartment/Flats', 'Villa', 'Plot', 'Duplex'] },
  Commercial: { types: ['Office Space', 'Shop', 'Showroom', 'Warehouse'] },
  Agriculture: { types: ['Farm Land', 'Farm House'] },
};

const AddModal = ({
  type,
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editItem,
  properties,
  customers,
  initialCustomer,
}) => {
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const [formData, setFormData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      if (type === 'Property') {
        setFormData({
          status: 'Available',
          listingType: 'Sell',
          category: 'Residential',
          type: 'Apartment/Flats',
          bhk: '2 BHK',
          furnishing: 'Semi',
          image: '',
          location: '',
          price: '',
          size: '',
          owner: '',
          ownerPhone: '',
          title: '',
        });
      } else if (type === 'Customer') {
        setFormData({
          status: 'New Lead',
          type: 'Apartment/Flats',
          budget: '',
          name: '',
          phone: '',
        });
      } else if (type === 'FollowUp') {
        setFormData({
          status: 'Pending',
          type: 'Call',
          date: new Date(),
          customerId: initialCustomer?.id || '',
          propertyId: '',
          note: '',
        });
      }
    }
  }, [editItem, type, initialCustomer]);

  if (!isOpen) return null;

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const processedValue =
        ['price', 'size', 'budget'].includes(name)
          ? value === ''
            ? ''
            : Number(value) || 0
          : value;

      const newData = { ...prev, [name]: processedValue };

      if (name === 'category' && type === 'Property') {
        if (PROPERTY_STRUCTURE[value]) {
          newData.type = PROPERTY_STRUCTURE[value].types[0];
        }
        if (value !== 'Residential') newData.bhk = '';
      }

      return newData;
    });
  };

  const pickImage = () => {
    // Mock image picker
    const mockImage =
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
    handleChange('image', mockImage);
  };

  const handleSubmit = () => {
    if (editItem) {
      onUpdate(formData);
    } else {
      const finalData = { ...formData, id: generateId() };
      if (type === 'Property') {
        if (!finalData.title)
          finalData.title = `${finalData.bhk ? finalData.bhk + ' ' : ''}${finalData.type}`;
        if (!finalData.image)
          finalData.image =
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
      }
      onSave(finalData);
    }
    onClose();
  };

  const Chip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-[4vw] py-[2.5vw] rounded-xl border transition-all mr-[2vw] ${
        selected ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'
      }`}
    >
      <Text className={`text-[3vw] font-bold ${selected ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) handleChange('date', selectedDate);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0" />

          <View className="bg-white w-full h-[90vh] rounded-t-[10vw] flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <View className="p-[6vw] border-b border-gray-100 flex-row justify-between items-center bg-white z-10">
              <View>
                <Text className="font-black text-[6vw] text-gray-900">
                  {editItem ? 'Edit' : 'Add'} {type}
                </Text>
                <Text className="text-[3vw] text-gray-400 font-bold mt-[1vw]">
                  Enter details below
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="bg-gray-50 p-[2vw] rounded-full">
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <ScrollView className="flex-1 p-[6vw]" contentContainerStyle={{ paddingBottom: 150 }}>
              {/* PROPERTY FORM */}
              {type === 'Property' && (
                <View className="gap-[5vw]">
                  {/* Image Picker */}
                  <View>
                    <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide mb-[2vw]">
                      Property Image
                    </Text>
                    <TouchableOpacity
                      onPress={pickImage}
                      className={`w-full h-[40vw] rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden relative ${
                        formData.image ? 'border-gray-300' : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      {formData.image ? (
                        <Image
                          source={{ uri: formData.image }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="items-center">
                          <CloudUpload size={32} color="#9ca3af" />
                          <Text className="text-[3vw] font-bold text-gray-500 mt-[2vw]">
                            Tap to upload image
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Sell / Rent Switch */}
                  <View className="flex-row bg-gray-100 p-[1.5vw] rounded-2xl">
                    {['Sell', 'Rent'].map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => handleChange('listingType', opt)}
                        className={`flex-1 py-[3vw] rounded-xl items-center ${
                          formData.listingType === opt ? 'bg-white shadow-sm' : ''
                        }`}
                      >
                        <Text
                          className={`text-[3.5vw] font-bold ${
                            formData.listingType === opt ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Category Chips */}
                  <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide mb-[2vw]">
                    Category
                  </Text>
                  <View className="flex-row flex-wrap gap-[2vw]">
                    {Object.keys(PROPERTY_STRUCTURE).map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => handleChange('category', cat)}
                        className={`flex-1 py-[3vw] px-[2vw] rounded-xl border items-center ${
                          formData.category === cat ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-[3vw] font-bold ${
                            formData.category === cat ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Type Scroll */}
                  <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide mb-[2vw]">
                    Property Type
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {PROPERTY_STRUCTURE[formData.category]?.types.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        selected={formData.type === t}
                        onPress={() => handleChange('type', t)}
                      />
                    ))}
                  </ScrollView>

                  {/* BHK Selection */}
                  {formData.category === 'Residential' && (
                    <>
                      <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide mb-[2vw]">
                        Bedrooms
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+'].map((opt) => (
                          <Chip key={opt} label={opt} selected={formData.bhk === opt} onPress={() => handleChange('bhk', opt)} />
                        ))}
                      </ScrollView>
                    </>
                  )}

                  {/* Inputs: Location, Price, Size, Furnishing, Owner */}
                  <View className="gap-[1.5vw]">
                    <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Location</Text>
                    <TextInput
                      value={formData.location || ''}
                      onChangeText={(t) => handleChange('location', t)}
                      placeholder="Sector, City"
                      className="w-full p-[4vw] bg-gray-50 rounded-2xl font-bold text-gray-800 text-[3.5vw]"
                    />
                  </View>
                  <View className="flex-row gap-[4vw]">
                    <View className="flex-1 gap-[1.5vw]">
                      <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Price (₹)</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={String(formData.price || '')}
                        onChangeText={(t) => handleChange('price', t)}
                        placeholder="0"
                        className="w-full p-[4vw] bg-gray-50 rounded-2xl font-bold text-gray-800 text-[3.5vw]"
                      />
                    </View>
                    <View className="flex-1 gap-[1.5vw]">
                      <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Size (sqft)</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={String(formData.size || '')}
                        onChangeText={(t) => handleChange('size', t)}
                        className="w-full p-[4vw] bg-gray-50 rounded-2xl font-bold text-gray-800 text-[3.5vw]"
                      />
                    </View>
                  </View>
                  <View className="gap-[1.5vw]">
                    <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Furnishing</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                      {['Semi', 'Full', 'None'].map((f) => (
                        <TouchableOpacity
                          key={f}
                          onPress={() => handleChange('furnishing', f)}
                          className={`mr-2 px-3 py-4 rounded-2xl ${formData.furnishing === f ? 'bg-gray-900' : 'bg-gray-50'}`}
                        >
                          <Text className={`font-bold text-[3vw] ${formData.furnishing === f ? 'text-white' : 'text-gray-800'}`}>{f}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View className="gap-[1.5vw]">
                    <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Owner Details</Text>
                    <View className="flex-row gap-[3vw]">
                      <TextInput
                        value={formData.owner || ''}
                        onChangeText={(t) => handleChange('owner', t)}
                        placeholder="Name"
                        className="flex-1 p-[4vw] bg-gray-50 rounded-2xl font-bold text-gray-800 text-[3.5vw]"
                      />
                      <TextInput
                        value={formData.ownerPhone || ''}
                        onChangeText={(t) => handleChange('ownerPhone', t)}
                        placeholder="Phone"
                        keyboardType="phone-pad"
                        className="flex-1 p-[4vw] bg-gray-50 rounded-2xl font-bold text-gray-800 text-[3.5vw]"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* CUSTOMER / FOLLOWUP FORM */}
              {(type === 'Customer' || type === 'FollowUp') && (
                <View className="gap-[5vw]">
                  {type === 'Customer' && (
                    <>
                      <View className="gap-[1.5vw]">
                        <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Name</Text>
                        <TextInput
                          value={formData.name || ''}
                          onChangeText={(t) => handleChange('name', t)}
                          className="w-full p-[4vw] bg-gray-50 rounded-2xl font-bold text-gray-800 text-[3.5vw]"
                        />
                      </View>
                      <View className="gap-[1.5vw]">
                        <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Phone</Text>
                        <TextInput
                          keyboardType="phone-pad"
                          value={formData.phone || ''}
                          onChangeText={(t) => handleChange('phone', t)}
                          className="w-full p-[4vw] bg-gray-50 rounded-2xl font-bold text-gray-800 text-[3.5vw]"
                        />
                      </View>
                      <View className="gap-[1.5vw]">
                        <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Max Budget</Text>
                        <TextInput
                          keyboardType="numeric"
                          value={String(formData.budget || '')}
                          onChangeText={(t) => handleChange('budget', t)}
                          className="w-full p-[4vw] bg-gray-50 rounded-2xl font-bold text-gray-800 text-[3.5vw]"
                        />
                      </View>
                    </>
                  )}

                  {type === 'FollowUp' && (
                    <>
                      <View className="gap-[1.5vw]">
                        <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Customer</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {customers.map((c) => (
                            <Chip
                              key={c.id}
                              label={c.name}
                              selected={formData.customerId === c.id}
                              onPress={() => !initialCustomer && handleChange('customerId', c.id)}
                            />
                          ))}
                        </ScrollView>
                      </View>

                      <View className="gap-[1.5vw]">
                        <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Type</Text>
                        <View className="flex-row gap-[2vw]">
                          {['Call', 'Meeting', 'Visit'].map((t) => (
                            <Chip key={t} label={t} selected={formData.type === t} onPress={() => handleChange('type', t)} />
                          ))}
                        </View>
                      </View>

                      <View className="gap-[1.5vw]">
                        <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Task Note</Text>
                        <TextInput
                          value={formData.note || ''}
                          onChangeText={(t) => handleChange('note', t)}
                          className="w-full p-[4vw] bg-gray-50 rounded-2xl font-bold text-gray-800 text-[3.5vw]"
                        />
                      </View>

                      <View className="gap-[1.5vw]">
                        <Text className="text-[3vw] font-black text-gray-400 uppercase tracking-wide">Date & Time</Text>
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}
                          className="p-[4vw] bg-gray-50 rounded-2xl"
                        >
                          <Text className="text-gray-800 font-bold text-[3.5vw]">
                            {formData.date ? new Date(formData.date).toLocaleString() : 'Select Date & Time'}
                          </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                          <DateTimePicker
                            value={formData.date ? new Date(formData.date) : new Date()}
                            mode="datetime"
                            display="default"
                            onChange={handleDateChange}
                          />
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                className="w-full py-[4vw] bg-gray-900 rounded-2xl mt-[6vw] shadow-xl items-center active:scale-95"
              >
                <Text className="text-white font-bold text-[4.5vw]">{editItem ? 'Update Details' : 'Save Details'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddModal;
