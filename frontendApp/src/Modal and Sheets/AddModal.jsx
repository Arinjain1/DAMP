import { Calendar, Check, ChevronDown, Clock, CloudUpload, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as LucideIcons from 'lucide-react-native';
import { getAmenitiesForType } from '../MockData/Mockdata';

const PROPERTY_STRUCTURE = {
    Residential: { types: ['Apartment/Flats', 'Builder Floor', 'House/Villa', 'Plot', 'Farmhouse', 'Other'] },
    Commercial: { types: ['Office', 'Shop/Showroom', 'Storage', 'Industry', 'Hospitality', 'Plot/Land', 'Other'] },
    Agriculture: { types: ['Farm Land', 'Farm House'] }
};

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Puducherry', 'Andaman and Nicobar Islands'
];

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
    initialPropertyIds,
    initialTaskType,
}) => {
    const generateId = () => Math.random().toString(36).substring(2, 11);

    const renderIcon = (iconName, size = 12, color = '#6b7280') => {
        const IconComponent = LucideIcons[iconName];
        if (IconComponent) {
            return <IconComponent size={size} color={color} />;
        }
        return <LucideIcons.Star size={size} color={color} />;
    };

    const [formData, setFormData] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showPriceUnitPicker, setShowPriceUnitPicker] = useState(false);
    const [showSizeUnitPicker, setShowSizeUnitPicker] = useState(false);
    const [propertySearchText, setPropertySearchText] = useState('');
    const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);

    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    // Budget range state for customer form
    const [budgetRange, setBudgetRange] = useState({ min: 10000, max: 5000000 }); // 10K to 50L
    const minBudget = 10000; // 10K
    const maxBudget = 100000000; // 10Cr
    const sliderWidth = Dimensions.get('window').width - 80; // Full width minus padding

    // Price range state for property form
    const [priceRange, setPriceRange] = useState({ min: 10000, max: 5000000 }); // 10K to 50L
    const minPrice = 10000; // 10K
    const maxPrice = 100000000; // 10Cr

    const debounceTimer = useRef(null);
    const scrollViewRef = useRef(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // Format currency for display
    const formatBudget = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
        return `₹${amount.toLocaleString()}`;
    };

    // Format price for display (same as budget)
    const formatPrice = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
        return `₹${amount.toLocaleString()}`;
    };

    // Handle budget range changes
    const handleBudgetChange = (type, value) => {
        const newRange = { ...budgetRange };
        if (type === 'min') {
            newRange.min = Math.min(value, budgetRange.max - 10000);
        } else {
            newRange.max = Math.max(value, budgetRange.min + 10000);
        }
        setBudgetRange(newRange);
        handleChange('budgetMin', newRange.min);
        handleChange('budgetMax', newRange.max);
    };

    // Handle price range changes
    const handlePriceChange = (type, value) => {
        const newRange = { ...priceRange };
        if (type === 'min') {
            newRange.min = Math.min(value, priceRange.max - 10000);
        } else {
            newRange.max = Math.max(value, priceRange.min + 10000);
        }
        setPriceRange(newRange);
        handleChange('priceMin', newRange.min);
        handleChange('priceMax', newRange.max);
    };

    // Convert position to budget value
    const positionToBudget = (position) => {
        const percentage = Math.max(0, Math.min(1, position / sliderWidth));
        return minBudget + (percentage * (maxBudget - minBudget));
    };

    // Convert budget value to position
    const budgetToPosition = (budget) => {
        const percentage = (budget - minBudget) / (maxBudget - minBudget);
        return percentage * sliderWidth;
    };

    // Convert position to price value
    const positionToPrice = (position) => {
        const percentage = Math.max(0, Math.min(1, position / sliderWidth));
        return minPrice + (percentage * (maxPrice - minPrice));
    };

    // Convert price value to position
    const priceToPosition = (price) => {
        const percentage = (price - minPrice) / (maxPrice - minPrice);
        return percentage * sliderWidth;
    };

    // Handle track click to move nearest thumb
    const handleTrackPress = (evt, type = 'budget') => {
        const { locationX } = evt.nativeEvent;
        const clickedValue = type === 'budget' ? positionToBudget(locationX) : positionToPrice(locationX);

        if (type === 'budget') {
            const distanceToMin = Math.abs(clickedValue - budgetRange.min);
            const distanceToMax = Math.abs(clickedValue - budgetRange.max);

            if (distanceToMin < distanceToMax) {
                handleBudgetChange('min', clickedValue);
            } else {
                handleBudgetChange('max', clickedValue);
            }
        } else {
            const distanceToMin = Math.abs(clickedValue - priceRange.min);
            const distanceToMax = Math.abs(clickedValue - priceRange.max);

            if (distanceToMin < distanceToMax) {
                handlePriceChange('min', clickedValue);
            } else {
                handlePriceChange('max', clickedValue);
            }
        }
    };

    // Create pan responder for min thumb
    const minThumbPanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const newPosition = budgetToPosition(budgetRange.min) + gestureState.dx;
            const newBudget = positionToBudget(newPosition);
            const clampedBudget = Math.max(minBudget, Math.min(budgetRange.max - 10000, newBudget));
            handleBudgetChange('min', clampedBudget);
        },
    });

    // Create pan responder for max thumb
    const maxThumbPanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const newPosition = budgetToPosition(budgetRange.max) + gestureState.dx;
            const newBudget = positionToBudget(newPosition);
            const clampedBudget = Math.min(maxBudget, Math.max(budgetRange.min + 10000, newBudget));
            handleBudgetChange('max', clampedBudget);
        },
    });

    // Create pan responder for min price thumb
    const minPricePanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const newPosition = priceToPosition(priceRange.min) + gestureState.dx;
            const newPrice = positionToPrice(newPosition);
            const clampedPrice = Math.max(minPrice, Math.min(priceRange.max - 10000, newPrice));
            handlePriceChange('min', clampedPrice);
        },
    });

    // Create pan responder for max price thumb
    const maxPricePanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const newPosition = priceToPosition(priceRange.max) + gestureState.dx;
            const newPrice = positionToPrice(newPosition);
            const clampedPrice = Math.min(maxPrice, Math.max(priceRange.min + 10000, newPrice));
            handlePriceChange('max', clampedPrice);
        },
    });

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardVisible(true);
            setKeyboardHeight(e.endCoordinates?.height ?? 0);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
            setKeyboardHeight(0);
        });

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);

    useEffect(() => {
        if (editItem) {
            const updatedEditItem = { ...editItem };

            // Handle customer editing - set budget range
            if (type === 'Customer') {
                if (editItem.budgetMin !== undefined && editItem.budgetMax !== undefined) {
                    setBudgetRange({
                        min: editItem.budgetMin,
                        max: editItem.budgetMax
                    });
                }
            }

            // Handle property editing - map backend format to form format
            if (type === 'Property') {
                // Check if bhk field contains actual BHK values or commercial config
                const bhkValues = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
                const hasBHK = editItem.bhk && bhkValues.includes(editItem.bhk);

                // If category is Residential and has BHK value, use it
                if (editItem.category === 'Residential' && hasBHK) {
                    updatedEditItem.bhk = editItem.bhk;
                    updatedEditItem.commercialConfig = '';
                }
                // If category is Commercial, use commercialConfig
                else if (editItem.category === 'Commercial') {
                    updatedEditItem.bhk = '';
                    updatedEditItem.commercialConfig = editItem.bhk || editItem.commercialConfig || '';
                }
                // Default case
                else {
                    updatedEditItem.bhk = '';
                    updatedEditItem.commercialConfig = '';
                }

                // Parse price to get value and unit
                if (editItem.price) {
                    const price = parseFloat(editItem.price);
                    if (price >= 10000000) {
                        updatedEditItem.priceValue = (price / 10000000).toString();
                        updatedEditItem.priceUnit = 'Crore';
                    } else if (price >= 100000) {
                        updatedEditItem.priceValue = (price / 100000).toString();
                        updatedEditItem.priceUnit = 'Lakh';
                    } else if (price >= 1000) {
                        updatedEditItem.priceValue = (price / 1000).toString();
                        updatedEditItem.priceUnit = 'Thousands';
                    } else {
                        updatedEditItem.priceValue = price.toString();
                        updatedEditItem.priceUnit = 'Thousands';
                    }
                }

                // Parse size
                if (editItem.size && typeof editItem.size === 'string') {
                    const sizeMatch = editItem.size.match(/^(\d+\.?\d*)\s*(.*)$/);
                    if (sizeMatch) {
                        updatedEditItem.sizeValue = sizeMatch[1];
                        updatedEditItem.sizeUnit = sizeMatch[2] || 'Sq. Ft.';
                    }
                } else {
                    updatedEditItem.sizeValue = '';
                    updatedEditItem.sizeUnit = 'Sq. Ft.';
                }
            }

            // Handle follow-up editing
            if (editItem.propertyId && !editItem.propertyIds) {
                updatedEditItem.propertyIds = [editItem.propertyId];
                delete updatedEditItem.propertyId;
            } else if (!editItem.propertyIds) {
                updatedEditItem.propertyIds = [];
            }

            setFormData(updatedEditItem);
        } else {
            if (type === 'Property') {
                setFormData({
                    status: 'Available',
                    listingType: 'Sell',
                    category: 'Residential',
                    type: 'Apartment/Flats',
                    bhk: '2 BHK',
                    commercialConfig: '',
                    furnishing: 'Semi',
                    image: '',
                    location: '',
                    priceMin: 10000,
                    priceMax: 5000000,
                    priceValue: '',
                    priceUnit: 'Thousands',
                    sizeValue: '',
                    sizeUnit: 'Sq. Ft.',
                    size: '',
                    owner: '',
                    ownerName: '',
                    ownerPhone: '',
                    title: '',
                    amenities: [],
                });
                setPriceRange({ min: 10000, max: 5000000 });
            } else if (type === 'Customer') {
                setFormData({
                    status: 'New Lead',
                    listingType: 'Buy',
                    category: 'Residential',
                    type: 'Apartment/Flats',
                    bhk: '2 BHK',
                    commercialConfig: '',
                    furnishing: 'Semi',
                    name: '',
                    phone: '',
                    budgetMin: 10000,
                    budgetMax: 5000000,
                    preferredLocation: '',
                });
                setBudgetRange({ min: 10000, max: 5000000 });
            } else if (type === 'FollowUp') {
                setFormData({
                    status: 'Pending',
                    type: initialTaskType || 'Call',
                    date: new Date().toISOString(),
                    customerId: initialCustomer?.id || '',
                    propertyIds: initialPropertyIds || [],
                    note: '',
                });
            }
        }
    }, [editItem, type, initialCustomer, initialPropertyIds, initialTaskType, isOpen]);

    if (!isOpen) return null;

    const handleChange = (name, value) => {
        setFormData((prev) => {
            let processedValue;
            if (['price', 'size', 'budget'].includes(name)) {
                processedValue = value === '' ? '' : Number(value) || 0;
            } else if (name === 'date' && value instanceof Date) {
                processedValue = value.toISOString();
            } else {
                processedValue = value;
            }

            const newData = { ...prev, [name]: processedValue };
            if (name === 'category' && type === 'Property') {
                if (PROPERTY_STRUCTURE[value]) {
                    newData.type = PROPERTY_STRUCTURE[value].types[0];
                }
                if (value !== 'Residential') newData.bhk = '';
                if (value !== 'Commercial') newData.commercialConfig = '';
            }
            if (name === 'category' && type === 'Customer') {
                if (PROPERTY_STRUCTURE[value]) {
                    newData.type = PROPERTY_STRUCTURE[value].types[0];
                }
                if (value !== 'Residential') newData.bhk = '';
                if (value !== 'Commercial') newData.commercialConfig = '';
            }
            if (name === 'type' && type === 'Property' && formData.category === 'Commercial') {
                newData.commercialConfig = '';
            }
            if (name === 'type' && type === 'Customer' && formData.category === 'Commercial') {
                newData.commercialConfig = '';
            }
            if (name === 'location' && type === 'Property') {
                searchPlaces(value);
            }
            return newData;
        });
    };

    const searchPlaces = (query) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        if (!query || query.length < 2) {
            setLocationSuggestions([]);
            setShowLocationDropdown(false);
            return;
        }
        debounceTimer.current = setTimeout(async () => {
            setLocationLoading(true);
            try {
                const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
                const url = 'https://places.googleapis.com/v1/places:autocomplete';
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': API_KEY,
                    },
                    body: JSON.stringify({
                        input: query,
                        includedRegionCodes: ['in'],
                    })
                });
                const data = await response.json();
                if (data.suggestions) {
                    const suggestions = data.suggestions.map((item) => {
                        const prediction = item.placePrediction;
                        return {
                            id: prediction.place,
                            description: prediction.text.text,
                            main_text: prediction.structuredFormat?.mainText?.text || prediction.text.text,
                            secondary_text: prediction.structuredFormat?.secondaryText?.text || '',
                        };
                    });
                    setLocationSuggestions(suggestions);
                    setShowLocationDropdown(suggestions.length > 0);
                }
            } catch (error) {
                console.error('Error fetching places:', error);
            } finally {
                setLocationLoading(false);
            }
        }, 500);
    };

    const selectLocation = (location) => {
        setFormData(prev => ({ ...prev, location: location.description }));
        setShowLocationDropdown(false);
        setLocationSuggestions([]);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };

    const pickImage = () => setPhotoSheetVisible(true);

    const openCamera = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) return;
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });
        if (!result.canceled && result.assets) handleChange('image', result.assets[0].uri);
    };

    const openGallery = async () => {
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!mediaPermission.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });
        if (!result.canceled && result.assets) handleChange('image', result.assets[0].uri);
    };

    const handleSubmit = () => {
        if (editItem) {
            const finalData = { ...formData };
            if (type === 'Customer') {
                // Add budget range values to customer data
                finalData.budgetMin = budgetRange.min;
                finalData.budgetMax = budgetRange.max;
            }
            onUpdate(finalData);
        } else {
            const finalData = { ...formData, id: generateId() };
            if (type === 'Property') {
                if (!finalData.title) finalData.title = `${finalData.bhk ? finalData.bhk + ' ' : ''}${finalData.type}`;
                if (!finalData.image) finalData.image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
            }
            if (type === 'Customer') {
                // Add budget range values to customer data
                finalData.budgetMin = budgetRange.min;
                finalData.budgetMax = budgetRange.max;
            }
            onSave(finalData);
            // Don't close immediately - let the save handler close after success
        }
    };

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (event?.type === 'set' && selectedDate) {
                setTempDate(selectedDate);
                setTimeout(() => setShowTimePicker(true), 100);
            }
        } else {
            if (selectedDate) {
                setTempDate(selectedDate);
                handleChange('date', selectedDate);
            }
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (event?.type === 'set' && selectedTime) {
            const combinedDateTime = new Date(tempDate);
            combinedDateTime.setHours(selectedTime.getHours());
            combinedDateTime.setMinutes(selectedTime.getMinutes());
            handleChange('date', combinedDateTime);
        }
    };

    const Chip = ({ label, selected, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.purpleChip, selected ? styles.purpleChipSelected : styles.purpleChipUnselected]}
        >
            <Text style={[styles.purpleChipText, selected ? styles.purpleChipTextSelected : styles.purpleChipTextUnselected]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <View className="flex-1 justify-end bg-black/60">
                    <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0" />
                    <View className="bg-white w-full h-[90vh] rounded-t-3xl overflow-hidden shadow-2xl">
                        {/* Header */}
                        <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white z-10">
                            <View>
                                <Text className="text-gray-800" style={{ fontFamily: 'Montserrat-700Bold', fontSize: 18, fontWeight: '700' }}>
                                    {editItem ? 'Edit' : 'New'} {type}
                                </Text>
                                <Text className="text-xs text-gray-400 font-medium mt-0.5">Fill in the details below</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                                <X size={20} color="#4b5563" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            ref={scrollViewRef}
                            className="flex-1 px-6 pt-4"
                            contentContainerStyle={{ paddingBottom: 100 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true}
                            scrollEventThrottle={16}
                        >
                            {type === 'Property' && (
                                <View style={styles.formContainer}>
                                    {/* Listing Type */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Listing Type</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listingTypeScrollContainer}>
                                            {['Sell', 'Rent'].map((saleType) => {
                                                const isSelected = formData.listingType === saleType;
                                                return (
                                                    <TouchableOpacity key={saleType} onPress={() => handleChange('listingType', saleType)}
                                                        style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                        <View style={[styles.radioButton, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                            {isSelected && <View style={styles.radioButtonInner} />}
                                                        </View>
                                                        <Text style={[styles.radioText, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{saleType}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* Property Category */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Property Category</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContainer}>
                                            {Object.keys(PROPERTY_STRUCTURE).map((cat) => {
                                                const isSelected = formData.category === cat;
                                                return (
                                                    <TouchableOpacity key={cat} onPress={() => handleChange('category', cat)}
                                                        style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                        <View style={[styles.radioButton, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                            {isSelected && <View style={styles.radioButtonInner} />}
                                                        </View>
                                                        <Text style={[styles.radioText, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{cat}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* Property Type */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Property Type</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertyTypeScrollContainer}>
                                            {PROPERTY_STRUCTURE[formData.category]?.types.map((propertyType) => {
                                                const isSelected = formData.type === propertyType;
                                                const getTypeIcon = (t) => {
                                                    const iconMap = { 'Apartment/Flats': 'Building', 'Builder Floor': 'Building2', 'House/Villa': 'Home', 'Plot/Land': 'MapPin', 'Farmhouse': 'TreePine', 'Office': 'Briefcase', 'Shop/Showroom': 'Store', 'Storage': 'Warehouse', 'Industry': 'Factory', 'Hospitality': 'Hotel', 'Farm Land': 'Wheat', 'Farm House': 'Barn', 'Other': 'MoreHorizontal' };
                                                    return iconMap[t] || 'Building';
                                                };
                                                return (
                                                    <TouchableOpacity key={propertyType} onPress={() => handleChange('type', propertyType)}
                                                        style={[styles.propertyTypeCardScroll, isSelected ? styles.propertyTypeCardSelected : styles.propertyTypeCardUnselected]}>
                                                        <View style={styles.propertyTypeIconTop}>{renderIcon(getTypeIcon(propertyType), 20, isSelected ? '#bfb7fd' : '#9ca3af')}</View>
                                                        <Text style={[styles.propertyTypeTextBottom, isSelected ? styles.propertyTypeTextSelected : styles.propertyTypeTextUnselected]} numberOfLines={2}>{propertyType}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* BHK Configuration - UPDATED WITH BORDER */}
                                    {formData.category === 'Residential' && (formData.type === 'Apartment/Flats' || formData.type === 'Builder Floor' || formData.type === 'House/Villa') && (
                                        <View style={styles.section}>
                                            <Text style={styles.inputLabel}>Configuration</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bhkScrollContainer}>
                                                {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map((bhk) => {
                                                    const isSelected = formData.bhk === bhk;
                                                    return (
                                                        <TouchableOpacity key={bhk} onPress={() => handleChange('bhk', bhk)}
                                                            style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                            <View style={[styles.radioButtonSmall, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                                {isSelected && <View style={styles.radioButtonInner} />}
                                                            </View>
                                                            <Text style={[styles.radioTextSmall, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{bhk}</Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {/* Commercial Configuration */}
                                    {formData.category === 'Commercial' && (
                                        <View style={styles.section}>
                                            <Text style={styles.inputLabel}>Configuration</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.commercialScrollContainer}>
                                                {(() => {
                                                    let configs = [];
                                                    if (formData.type === 'Office') {
                                                        configs = ['Co-working Space', 'Bareshell Office', 'Ready to Move Office'];
                                                    } else if (formData.type === 'Shop/Showroom') {
                                                        configs = ['Shop', 'Showroom', 'Retail Space'];
                                                    } else if (formData.type === 'Storage') {
                                                        configs = ['Cold Storage', 'Warehouse', 'Godown'];
                                                    } else if (formData.type === 'Industry') {
                                                        configs = ['Manufacturing', 'Factory', 'Industrial Unit'];
                                                    } else if (formData.type === 'Hospitality') {
                                                        configs = ['Guesthouse', 'Banquet Halls', 'Hotels/Resorts'];
                                                    }

                                                    return configs.map((config) => {
                                                        const isSelected = formData.commercialConfig === config;
                                                        return (
                                                            <TouchableOpacity key={config} onPress={() => handleChange('commercialConfig', config)}
                                                                style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                                <View style={[styles.radioButtonSmall, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                                    {isSelected && <View style={styles.radioButtonInner} />}
                                                                </View>
                                                                <Text style={[styles.radioTextSmall, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{config}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    });
                                                })()}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {/* Furnishing (Residential excluding Plot and Farmhouse, Commercial only for Office and Shop/Showroom excluding Bareshell Office) */}
                                    {((formData.category === 'Residential' && formData.type !== 'Plot' && formData.type !== 'Farmhouse') ||
                                        (formData.category === 'Commercial' && (formData.type === 'Office' || formData.type === 'Shop/Showroom') && formData.commercialConfig !== 'Bareshell Office')) && (
                                            <View style={styles.section}>
                                                <Text style={styles.inputLabel}>Furnishing</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.furnishingScrollContainer}>
                                                    {['Unfurnished', 'Semi', 'Furnished'].map((furn) => {
                                                        const isSelected = formData.furnishing === furn;
                                                        return (
                                                            <TouchableOpacity key={furn} onPress={() => handleChange('furnishing', furn)}
                                                                style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                                <View style={[styles.radioButtonSmall, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                                    {isSelected && <View style={styles.radioButtonInner} />}
                                                                </View>
                                                                <Text style={[styles.radioTextSmall, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{furn}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </ScrollView>
                                            </View>
                                        )}

                                    {/* State Dropdown */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>State*</Text>
                                        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowStateDropdown(!showStateDropdown)}>
                                            <Text style={[styles.dropdownPlaceholder, formData.state && styles.dropdownSelected]}>{formData.state || 'Select state'}</Text>
                                            <ChevronDown size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                        {showStateDropdown && (
                                            <View style={styles.stateDropdown}>
                                                <ScrollView style={styles.stateScrollView} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                                    {INDIAN_STATES.map((state) => (
                                                        <TouchableOpacity key={state} style={styles.stateItem} onPress={() => { handleChange('state', state); setShowStateDropdown(false); }}>
                                                            <Text style={styles.stateText}>{state}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>

                                    {/* City */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>City*</Text>
                                        <TextInput value={formData.city || ''} onChangeText={(t) => handleChange('city', t)} placeholder="Enter city" style={styles.textInputStyled} />
                                    </View>

                                    {/* Location Search */}
                                    <View style={[styles.section, { zIndex: 2000 }]}>
                                        <Text style={styles.inputLabel}>Property Location*</Text>
                                        <View style={styles.locationContainer}>
                                            <TextInput value={formData.location || ''} onChangeText={(text) => handleChange('location', text)} placeholder="Enter property location" style={styles.textInputStyled} />
                                            {showLocationDropdown && locationSuggestions.length > 0 && (
                                                <View style={styles.locationDropdown}>
                                                    {locationLoading && <View style={styles.loadingContainer}><Text style={styles.loadingText}>Searching...</Text></View>}
                                                    {locationSuggestions.map((loc) => (
                                                        <TouchableOpacity key={loc.id} onPress={() => selectLocation(loc)} style={styles.locationItem}>
                                                            <View style={styles.locationIcon}><LucideIcons.MapPin size={16} color="#6b7280" /></View>
                                                            <View style={styles.locationDetails}>
                                                                <Text style={styles.locationMainText}>{loc.main_text}</Text>
                                                                {loc.secondary_text && <Text style={styles.locationSecondaryText}>{loc.secondary_text}</Text>}
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Project Name */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Project or Society Name</Text>
                                        <TextInput value={formData.title || ''} onChangeText={(t) => handleChange('title', t)} placeholder="Name of project/society" style={styles.textInputStyled} />
                                    </View>

                                    {/* Address */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Address*</Text>
                                        <TextInput value={formData.owner || ''} onChangeText={(t) => handleChange('owner', t)} placeholder="Complete address" style={styles.textInputStyled} />
                                    </View>

                                    {/* Price */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Price</Text>
                                        <View style={styles.rowInputs}>
                                            <View style={styles.priceInputContainer}>
                                                <TextInput
                                                    keyboardType="numeric"
                                                    value={String(formData.priceValue || '')}
                                                    onChangeText={(t) => handleChange('priceValue', t)}
                                                    placeholder="Enter price"
                                                    style={styles.textInputStyled}
                                                />
                                            </View>
                                            <View style={styles.priceUnitContainer}>
                                                <TouchableOpacity
                                                    style={styles.dropdownStyled}
                                                    onPress={() => setShowPriceUnitPicker(!showPriceUnitPicker)}
                                                >
                                                    <Text style={formData.priceUnit ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                                                        {formData.priceUnit || 'Unit'}
                                                    </Text>
                                                    <ChevronDown size={18} color="#9ca3af" />
                                                </TouchableOpacity>
                                                {showPriceUnitPicker && (
                                                    <View style={styles.dropdownOptions}>
                                                        {['Thousands', 'Lakh', 'Crore'].map((unit) => (
                                                            <TouchableOpacity
                                                                key={unit}
                                                                style={styles.dropdownOption}
                                                                onPress={() => {
                                                                    handleChange('priceUnit', unit);
                                                                    setShowPriceUnitPicker(false);
                                                                }}
                                                            >
                                                                <Text style={styles.dropdownOptionText}>{unit}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Bond - Only for Rent */}
                                    {formData.listingType === 'Rent' && (
                                        <View style={styles.section}>
                                            <Text style={styles.inputLabel}>Bond</Text>
                                            <TextInput
                                                keyboardType="numeric"
                                                value={String(formData.bond || '')}
                                                onChangeText={(t) => handleChange('bond', t)}
                                                placeholder="Enter bond"
                                                style={styles.textInputStyled}
                                            />
                                        </View>
                                    )}

                                    {/* Size with Unit */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Size</Text>
                                        <View style={styles.rowInputs}>
                                            <View style={styles.priceInputContainer}>
                                                <TextInput
                                                    keyboardType="numeric"
                                                    value={String(formData.sizeValue || '')}
                                                    onChangeText={(t) => handleChange('sizeValue', t)}
                                                    placeholder="Enter size"
                                                    style={styles.textInputStyled}
                                                />
                                            </View>
                                            <View style={styles.priceUnitContainer}>
                                                <TouchableOpacity
                                                    style={styles.dropdownStyled}
                                                    onPress={() => setShowSizeUnitPicker(!showSizeUnitPicker)}
                                                >
                                                    <Text style={formData.sizeUnit ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                                                        {formData.sizeUnit || 'Unit'}
                                                    </Text>
                                                    <ChevronDown size={18} color="#9ca3af" />
                                                </TouchableOpacity>
                                                {showSizeUnitPicker && (
                                                    <View style={styles.dropdownOptions}>
                                                        <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                                            {['Sq. Ft.', 'Sq. M.', 'Sq. Yd.', 'Acre', 'Hectare', 'Bigha', 'Katha', 'Kattha', 'Biswa', 'Guntha', 'Cent', 'Ground', 'Kanal', 'Marla', 'Chatak', 'Dhur', 'Decimal', 'Perch', 'Rood', 'Are', 'Carat'].map((unit) => (
                                                                <TouchableOpacity
                                                                    key={unit}
                                                                    style={styles.dropdownOption}
                                                                    onPress={() => {
                                                                        handleChange('sizeUnit', unit);
                                                                        setShowSizeUnitPicker(false);
                                                                    }}
                                                                >
                                                                    <Text style={styles.dropdownOptionText}>{unit}</Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Length & Width - Only for Plot (Residential) and Plot/Land (Commercial) */}
                                    {(formData.type === 'Plot' || formData.type === 'Plot/Land') && (
                                        <View style={styles.section}>
                                            <View style={styles.rowInputs}>
                                                <View style={styles.halfInput}>
                                                    <Text style={styles.inputLabel}>Length (ft)</Text>
                                                    <TextInput
                                                        keyboardType="numeric"
                                                        value={String(formData.length || '')}
                                                        onChangeText={(t) => handleChange('length', t)}
                                                        placeholder="0"
                                                        style={styles.textInputStyled}
                                                    />
                                                </View>
                                                <View style={styles.halfInput}>
                                                    <Text style={styles.inputLabel}>Width (ft)</Text>
                                                    <TextInput
                                                        keyboardType="numeric"
                                                        value={String(formData.width || '')}
                                                        onChangeText={(t) => handleChange('width', t)}
                                                        placeholder="0"
                                                        style={styles.textInputStyled}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {/* Owner Name */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Owner Name</Text>
                                        <TextInput value={formData.ownerName || ''} onChangeText={(t) => handleChange('ownerName', t)} placeholder="Property Owner Name" style={styles.textInputStyled} />
                                    </View>

                                    {/* Owner Phone */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Owner Phone</Text>
                                        <TextInput keyboardType="phone-pad" value={formData.ownerPhone || ''} onChangeText={(t) => handleChange('ownerPhone', t)} placeholder="Owner Phone Number" style={styles.textInputStyled} />
                                    </View>

                                    {/* Image Upload */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Property Image</Text>
                                        <TouchableOpacity onPress={pickImage} style={[styles.imageUpload, formData.image ? styles.imageUploaded : styles.imageEmpty]}>
                                            {formData.image ? <Image source={{ uri: formData.image }} style={styles.uploadedImage} /> : (
                                                <View style={styles.uploadPlaceholder}>
                                                    <View style={styles.uploadIconContainer} >
                                                        <CloudUpload size={24} color="#9ca3af" />
                                                    </View>
                                                    <Text style={styles.uploadText}>Upload Image</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {/* Amenities */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Amenities</Text>
                                        {(() => {
                                            const typeAmenities = getAmenitiesForType(formData.type);
                                            if (typeAmenities.length === 0) return <View style={styles.noAmenitiesContainer}><Text style={styles.noAmenitiesText}>No amenities available.</Text></View>;
                                            return (
                                                <View style={styles.amenityGrid}>
                                                    {typeAmenities.map((amenity) => {
                                                        const isSelected = formData.amenities?.includes(amenity.id);
                                                        return (
                                                            <TouchableOpacity key={amenity.id} onPress={() => {
                                                                const current = formData.amenities || [];
                                                                handleChange('amenities', isSelected ? current.filter(id => id !== amenity.id) : [...current, amenity.id]);
                                                            }} style={[styles.amenityChipCompact, isSelected ? styles.amenityChipSelected : styles.amenityChipUnselected]}>
                                                                {renderIcon(amenity.icon, 12, isSelected ? 'white' : '#6b7280')}
                                                                <Text style={[styles.amenityTextCompact, isSelected ? styles.amenityTextSelected : styles.amenityTextUnselected]}>{amenity.name}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            );
                                        })()}
                                    </View>
                                </View>
                            )}

                            {/* Customer Form */}
                            {type === 'Customer' && (
                                <View style={styles.formContainer}>
                                    {/* Property Requirements */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Property Requirements</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listingTypeScrollContainer}>
                                            {['Buy', 'Rent/Lease'].map((requirement) => {
                                                const isSelected = formData.listingType === requirement;
                                                return (
                                                    <TouchableOpacity key={requirement} onPress={() => handleChange('listingType', requirement)}
                                                        style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                        <View style={[styles.radioButton, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                            {isSelected && <View style={styles.radioButtonInner} />}
                                                        </View>
                                                        <Text style={[styles.radioText, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{requirement}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* Property Category */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>What Kind of Property?</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContainer}>
                                            {Object.keys(PROPERTY_STRUCTURE).map((cat) => {
                                                const isSelected = formData.category === cat;
                                                return (
                                                    <TouchableOpacity key={cat} onPress={() => handleChange('category', cat)}
                                                        style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                        <View style={[styles.radioButton, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                            {isSelected && <View style={styles.radioButtonInner} />}
                                                        </View>
                                                        <Text style={[styles.radioText, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{cat}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* Property Type */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Property Type</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertyTypeScrollContainer}>
                                            {PROPERTY_STRUCTURE[formData.category]?.types.map((propertyType) => {
                                                const isSelected = formData.type === propertyType;
                                                const getTypeIcon = (t) => {
                                                    const iconMap = { 'Apartment/Flats': 'Building', 'Builder Floor': 'Building2', 'House/Villa': 'Home', 'Plot/Land': 'MapPin', 'Farmhouse': 'TreePine', 'Office': 'Briefcase', 'Shop/Showroom': 'Store', 'Storage': 'Warehouse', 'Industry': 'Factory', 'Hospitality': 'Hotel', 'Farm Land': 'Wheat', 'Farm House': 'Barn', 'Other': 'MoreHorizontal' };
                                                    return iconMap[t] || 'Building';
                                                };
                                                return (
                                                    <TouchableOpacity key={propertyType} onPress={() => handleChange('type', propertyType)}
                                                        style={[styles.propertyTypeCardScroll, isSelected ? styles.propertyTypeCardSelected : styles.propertyTypeCardUnselected]}>
                                                        <View style={styles.propertyTypeIconTop}>{renderIcon(getTypeIcon(propertyType), 20, isSelected ? '#bfb7fd' : '#9ca3af')}</View>
                                                        <Text style={[styles.propertyTypeTextBottom, isSelected ? styles.propertyTypeTextSelected : styles.propertyTypeTextUnselected]} numberOfLines={2}>{propertyType}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* BHK Configuration for Residential */}
                                    {formData.category === 'Residential' && (formData.type === 'Apartment/Flats' || formData.type === 'Builder Floor' || formData.type === 'House/Villa') && (
                                        <View style={styles.section}>
                                            <Text style={styles.inputLabel}>Configuration</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bhkScrollContainer}>
                                                {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map((bhk) => {
                                                    const isSelected = formData.bhk === bhk;
                                                    return (
                                                        <TouchableOpacity key={bhk} onPress={() => handleChange('bhk', bhk)}
                                                            style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                            <View style={[styles.radioButtonSmall, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                                {isSelected && <View style={styles.radioButtonInner} />}
                                                            </View>
                                                            <Text style={[styles.radioTextSmall, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{bhk}</Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {/* Commercial Configuration */}
                                    {formData.category === 'Commercial' && (
                                        <View style={styles.section}>
                                            <Text style={styles.inputLabel}>Configuration</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.commercialScrollContainer}>
                                                {(() => {
                                                    let configs = [];
                                                    if (formData.type === 'Office') {
                                                        configs = ['Co-working Space', 'Bareshell Office', 'Ready to Move Office'];
                                                    } else if (formData.type === 'Shop/Showroom') {
                                                        configs = ['Shop', 'Showroom', 'Retail Space'];
                                                    } else if (formData.type === 'Storage') {
                                                        configs = ['Cold Storage', 'Warehouse', 'Godown'];
                                                    } else if (formData.type === 'Industry') {
                                                        configs = ['Manufacturing', 'Factory', 'Industrial Unit'];
                                                    } else if (formData.type === 'Hospitality') {
                                                        configs = ['Guesthouse', 'Banquet Halls', 'Hotels/Resorts'];
                                                    }

                                                    return configs.map((config) => {
                                                        const isSelected = formData.commercialConfig === config;
                                                        return (
                                                            <TouchableOpacity key={config} onPress={() => handleChange('commercialConfig', config)}
                                                                style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                                <View style={[styles.radioButtonSmall, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                                    {isSelected && <View style={styles.radioButtonInner} />}
                                                                </View>
                                                                <Text style={[styles.radioTextSmall, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{config}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    });
                                                })()}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {/* Furnishing (Residential excluding Plot and Farmhouse, Commercial only for Office and Shop/Showroom excluding Bareshell Office) */}
                                    {((formData.category === 'Residential' && formData.type !== 'Plot' && formData.type !== 'Farmhouse') ||
                                        (formData.category === 'Commercial' && (formData.type === 'Office' || formData.type === 'Shop/Showroom') && formData.commercialConfig !== 'Bareshell Office')) && (
                                            <View style={styles.section}>
                                                <Text style={styles.inputLabel}>Furnishing</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.furnishingScrollContainer}>
                                                    {['Unfurnished', 'Semi', 'Furnished'].map((furn) => {
                                                        const isSelected = formData.furnishing === furn;
                                                        return (
                                                            <TouchableOpacity key={furn} onPress={() => handleChange('furnishing', furn)}
                                                                style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                                <View style={[styles.radioButtonSmall, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                                    {isSelected && <View style={styles.radioButtonInner} />}
                                                                </View>
                                                                <Text style={[styles.radioTextSmall, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{furn}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </ScrollView>
                                            </View>
                                        )}

                                    {/* Customer Name */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Customer Name</Text>
                                        <TextInput value={formData.name || ''} onChangeText={(t) => handleChange('name', t)} placeholder="Enter customer name" style={styles.textInputStyled} />
                                    </View>

                                    {/* Contact Number */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Contact Number</Text>
                                        <TextInput keyboardType="phone-pad" value={formData.phone || ''} onChangeText={(t) => handleChange('phone', t)} placeholder="Enter contact number" style={styles.textInputStyled} />
                                    </View>

                                    {/* Preferred Location */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Preferred Location</Text>
                                        <TextInput value={formData.preferredLocation || ''} onChangeText={(t) => handleChange('preferredLocation', t)} placeholder="Select preferred location" style={styles.textInputStyled} />
                                    </View>

                                    {/* Budget Range */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Budget Range</Text>
                                        <View style={styles.budgetContainer}>
                                            <Text style={styles.budgetLabel}>
                                                {formatBudget(budgetRange.min)} - {formatBudget(budgetRange.max)}
                                            </Text>

                                            {/* Draggable Range Slider */}
                                            <View style={styles.budgetSliderContainer}>
                                                <TouchableOpacity
                                                    style={styles.budgetSlider}
                                                    activeOpacity={1}
                                                    onPress={(evt) => handleTrackPress(evt, 'budget')}
                                                >
                                                    {/* Background track */}
                                                    <View style={styles.budgetSliderTrack} />

                                                    {/* Active range track */}
                                                    <View style={[styles.budgetTrack, {
                                                        left: budgetToPosition(budgetRange.min),
                                                        width: budgetToPosition(budgetRange.max) - budgetToPosition(budgetRange.min)
                                                    }]} />

                                                    {/* Min thumb (draggable) */}
                                                    <View
                                                        style={[styles.budgetThumb, {
                                                            left: budgetToPosition(budgetRange.min) - 8
                                                        }]}
                                                        {...minThumbPanResponder.panHandlers}
                                                    />

                                                    {/* Max thumb (draggable) */}
                                                    <View
                                                        style={[styles.budgetThumb, {
                                                            left: budgetToPosition(budgetRange.max) - 8
                                                        }]}
                                                        {...maxThumbPanResponder.panHandlers}
                                                    />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.budgetRangeLabels}>
                                                <Text style={styles.budgetRangeText}>{formatBudget(minBudget)}</Text>
                                                <Text style={styles.budgetRangeText}>{formatBudget(maxBudget)}+</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Details */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Details</Text>
                                        <TextInput
                                            value={formData.details || ''}
                                            onChangeText={(t) => handleChange('details', t)}
                                            placeholder="Add property detail here..."
                                            style={[styles.textInputStyled, styles.textAreaInput]}
                                            multiline={true}
                                            numberOfLines={4}
                                        />
                                    </View>
                                </View>
                            )}

                            {/* FollowUp Form */}
                            {type === 'FollowUp' && (
                                <View style={styles.formContainer}>
                                    {/* Customer Selection */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Customer</Text>
                                        <TouchableOpacity
                                            style={[styles.dropdownButton, initialCustomer && { backgroundColor: '#f9fafb' }]}
                                            onPress={() => !initialCustomer && setShowCustomerDropdown(!showCustomerDropdown)}
                                        >
                                            <Text style={formData.customerId ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                                                {customers.find(c => c.id === formData.customerId)?.name || 'Select Customer'}
                                            </Text>
                                            {!initialCustomer && <ChevronDown size={18} color="#9ca3af" />}
                                        </TouchableOpacity>

                                        {showCustomerDropdown && (
                                            <View style={styles.customerDropdown}>
                                                <ScrollView style={styles.customerScrollView} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                                    {customers.map((customer) => (
                                                        <TouchableOpacity
                                                            key={customer.id}
                                                            style={styles.customerItem}
                                                            onPress={() => {
                                                                handleChange('customerId', customer.id);
                                                                setShowCustomerDropdown(false);
                                                            }}
                                                        >
                                                            <View style={styles.customerItemContent}>
                                                                <Text style={styles.customerText}>{customer.name}</Text>
                                                                {customer.phone && (
                                                                    <Text style={styles.customerSubText}>{customer.phone}</Text>
                                                                )}
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>

                                    {/* Task Type */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Task Type</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listingTypeScrollContainer}>
                                            {['Call', 'Meeting', 'Site Visit', 'Follow-up'].map((taskType) => {
                                                const isSelected = formData.type === taskType;
                                                return (
                                                    <TouchableOpacity key={taskType} onPress={() => handleChange('type', taskType)}
                                                        style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}>
                                                        <View style={[styles.radioButton, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                                                            {isSelected && <View style={styles.radioButtonInner} />}
                                                        </View>
                                                        <Text style={[styles.radioText, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{taskType}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* Date and Time */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Schedule</Text>
                                        <View style={styles.rowContainer}>
                                            <TouchableOpacity
                                                style={[styles.halfWidth, styles.dropdownButton]}
                                                onPress={() => setShowDatePicker(true)}
                                            >
                                                <Text style={styles.dropdownSelected}>
                                                    {new Date(formData.date).toLocaleDateString()}
                                                </Text>
                                                <Calendar size={16} color="#bfb7fd" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.halfWidth, styles.dropdownButton]}
                                                onPress={() => setShowTimePicker(true)}
                                            >
                                                <Text style={styles.dropdownSelected}>
                                                    {new Date(formData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                                <Clock size={16} color="#bfb7fd" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Properties (Optional) */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Related Properties (Optional)</Text>
                                        <TouchableOpacity
                                            style={styles.dropdownButton}
                                            onPress={() => setShowPropertyDropdown(!showPropertyDropdown)}
                                        >
                                            <Text style={formData.propertyIds?.length > 0 ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                                                {formData.propertyIds?.length > 0
                                                    ? `${formData.propertyIds.length} ${formData.propertyIds.length === 1 ? 'property' : 'properties'} selected`
                                                    : 'Select properties'}
                                            </Text>
                                            <ChevronDown size={18} color="#9ca3af" />
                                        </TouchableOpacity>

                                        {showPropertyDropdown && (
                                            <View style={styles.propertyDropdown}>
                                                <ScrollView style={styles.propertyScrollView} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                                    {properties.map((property) => {
                                                        const isSelected = formData.propertyIds?.includes(property.id);
                                                        return (
                                                            <TouchableOpacity
                                                                key={property.id}
                                                                style={styles.propertyItem}
                                                                onPress={() => {
                                                                    const currentIds = formData.propertyIds || [];
                                                                    const newIds = isSelected
                                                                        ? currentIds.filter(id => id !== property.id)
                                                                        : [...currentIds, property.id];
                                                                    handleChange('propertyIds', newIds);
                                                                }}
                                                            >
                                                                <View style={styles.propertyItemContent}>
                                                                    <Text style={styles.propertyText}>{property.title}</Text>
                                                                    {isSelected && <Check size={16} color="#bfb7fd" />}
                                                                </View>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </ScrollView>
                                            </View>
                                        )}

                                        {/* Selected Properties Grid */}
                                        {formData.propertyIds?.length > 0 && (
                                            <View style={{ marginTop: 12, gap: 8 }}>
                                                {properties.filter(p => formData.propertyIds.includes(p.id)).map((property) => (
                                                    <View key={property.id} style={{
                                                        backgroundColor: '#f9fafb',
                                                        borderRadius: 12,
                                                        padding: 12,
                                                        borderWidth: 1,
                                                        borderColor: '#e5e7eb',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 2 }}>
                                                                {property.title}
                                                            </Text>
                                                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                                                {property.location}
                                                            </Text>
                                                        </View>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const newIds = formData.propertyIds.filter(id => id !== property.id);
                                                                handleChange('propertyIds', newIds);
                                                            }}
                                                            style={{
                                                                backgroundColor: '#fee2e2',
                                                                borderRadius: 8,
                                                                padding: 6
                                                            }}
                                                        >
                                                            <X size={16} color="#dc2626" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>

                                    {/* Notes */}
                                    <View style={styles.section}>
                                        <Text style={styles.inputLabel}>Notes</Text>
                                        <TextInput
                                            value={formData.note || ''}
                                            onChangeText={(t) => handleChange('note', t)}
                                            placeholder="Add task details..."
                                            style={[styles.textInputStyled, styles.textAreaInput]}
                                            multiline={true}
                                            numberOfLines={4}
                                        />
                                    </View>
                                </View>
                            )}

                            {/* Date Time Pickers */}
                            {(showDatePicker || showTimePicker) && (
                                <DateTimePicker
                                    value={new Date(formData.date)}
                                    mode={showDatePicker ? 'date' : 'time'}
                                    onChange={showDatePicker ? handleDateChange : handleTimeChange}
                                />
                            )}

                            <TouchableOpacity onPress={handleSubmit} style={styles.purpleSubmitButton}>
                                <Text style={styles.purpleSubmitButtonText}>{editItem ? 'Update' : 'Save'} {type === 'FollowUp' ? 'Task' : type}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Photo Sheet */}
            <Modal visible={photoSheetVisible} transparent animationType="slide">
                <TouchableOpacity activeOpacity={1} style={styles.sheetOverlay} onPress={() => setPhotoSheetVisible(false)}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Select Photo</Text>
                        <TouchableOpacity style={styles.sheetBtn} onPress={() => { setPhotoSheetVisible(false); openCamera(); }}><Text style={styles.sheetBtnText}>📷 Camera</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.sheetBtn} onPress={() => { setPhotoSheetVisible(false); openGallery(); }}><Text style={styles.sheetBtnText}>🖼️ Gallery</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.sheetBtn, styles.cancelBtn]} onPress={() => setPhotoSheetVisible(false)}><Text style={[styles.sheetBtnText, styles.cancelText]}>Cancel</Text></TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </Modal>
    );
};

import styles from '../styles/addModalStyles';

export default AddModal;