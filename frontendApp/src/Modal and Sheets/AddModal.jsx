import { ChevronDown, CloudUpload, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as LucideIcons from 'lucide-react-native';
import { getAmenitiesForType } from '../MockData/Mockdata';

const PROPERTY_STRUCTURE = {
    Residential: { types: ['Apartment/Flats', 'Builder Floor', 'House/Villa', 'Plot/Land', 'Farmhouse', 'Other'] },
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
    const [customerSearchText, setCustomerSearchText] = useState('');
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [propertySearchText, setPropertySearchText] = useState('');
    const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);

    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const debounceTimer = useRef(null);

    useEffect(() => {
        if (editItem) {
            const updatedEditItem = { ...editItem };
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
                    price: '',
                    size: '',
                    owner: '',
                    ownerName: '',
                    ownerPhone: '',
                    title: '',
                    amenities: [],
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
                    date: new Date().toISOString(),
                    customerId: initialCustomer?.id || '',
                    propertyIds: [],
                    note: '',
                });
            }
        }
    }, [editItem, type, initialCustomer, isOpen]);

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
            if (name === 'type' && type === 'Property' && formData.category === 'Commercial') {
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
                const API_KEY = 'AIzaSyBh6QaQefnuItu6ntz4Z3xiH4pLt4b48pA';
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });
        if (!result.canceled && result.assets) handleChange('image', result.assets[0].uri);
    };

    const handleSubmit = () => {
        if (editItem) {
            onUpdate(formData);
        } else {
            const finalData = { ...formData, id: generateId() };
            if (type === 'Property') {
                if (!finalData.title) finalData.title = `${finalData.bhk ? finalData.bhk + ' ' : ''}${finalData.type}`;
                if (!finalData.image) finalData.image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
            }
            onSave(finalData);
        }
        onClose();
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

    return (
        <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
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

                        <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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

                                    {/* Furnishing - UPDATED WITH BORDER */}
                                    {formData.category === 'Residential' && (
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

                                    {/* Price & Size */}
                                    <View style={styles.section}>
                                        <View style={styles.rowContainer}>
                                            <View style={styles.halfWidth}>
                                                <Text style={styles.inputLabel}>Price (₹)</Text>
                                                <TextInput keyboardType="numeric" value={String(formData.price || '')} onChangeText={(t) => handleChange('price', t)} placeholder="0" style={styles.textInputStyled} />
                                            </View>
                                            <View style={styles.halfWidth}>
                                                <Text style={styles.inputLabel}>Size (sqft)</Text>
                                                <TextInput keyboardType="numeric" value={String(formData.size || '')} onChangeText={(t) => handleChange('size', t)} placeholder="0" style={styles.textInputStyled} />
                                            </View>
                                        </View>
                                    </View>

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
                                                <View style={styles.uploadPlaceholder}><CloudUpload size={24} color="#9ca3af" /><Text style={styles.uploadText}>Upload Image</Text></View>
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

                            {/* Customer / FollowUp Forms (Keeping standard Tailwind classes as per original) */}
                            {(type === 'Customer' || type === 'FollowUp') && (
                                <View className="gap-5">
                                    {type === 'Customer' && (
                                        <>
                                            <View><Text className="text-xs font-bold text-gray-400 mb-2">Name</Text>
                                                <TextInput value={formData.name || ''} onChangeText={(t) => handleChange('name', t)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" placeholder="Client Name" /></View>
                                            <View><Text className="text-xs font-bold text-gray-400 mb-2">Phone</Text>
                                                <TextInput keyboardType="phone-pad" value={formData.phone || ''} onChangeText={(t) => handleChange('phone', t)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" placeholder="Phone Number" /></View>
                                            <View><Text className="text-xs font-bold text-gray-400 mb-2">Max Budget</Text>
                                                <TextInput keyboardType="numeric" value={String(formData.budget || '')} onChangeText={(t) => handleChange('budget', t)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" placeholder="0" /></View>
                                        </>
                                    )}
                                    {type === 'FollowUp' && (
                                        <View><Text className="text-sm">FollowUp UI placeholder</Text></View>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity onPress={handleSubmit} style={styles.purpleSubmitButton}>
                                <Text style={styles.purpleSubmitButtonText}>{editItem ? 'Update' : 'Save'} {type}</Text>
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

const styles = StyleSheet.create({
    formContainer: { gap: 16 },
    section: { marginBottom: 4, position: 'relative' },
    inputLabel: { fontSize: 12, fontWeight: '500', color: '#6b7280', marginBottom: 8, fontFamily: 'Montserrat_500Medium' },
    
    // SCROLL CONTAINERS FOR RADIO BUTTONS
    listingTypeScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    categoryScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    bhkScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    commercialScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    furnishingScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    propertyTypeScrollContainer: { flexDirection: 'row', paddingRight: 16 },
    
    categoryRadioContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    
    // UPDATED RADIO OPTION STYLE (PILL BORDER) - SMALLER PADDING
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 99,
        marginRight: 8,
    },
    radioOptionSelected: {
        borderColor: '#bfb7fd',
        backgroundColor: '#f8f7ff',
    },
    radioButton: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    radioButtonSelected: { borderColor: '#bfb7fd' },
    radioButtonUnselected: { borderColor: '#d1d5db' },
    radioButtonInner: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#bfb7fd' },
    radioText: { fontSize: 12, fontFamily: 'Montserrat_500Medium' },
    radioTextSelected: { color: '#6b46c1', fontWeight: '600' },
    radioTextUnselected: { color: '#6b7280' },

    // BHK & FURNISHING CONTAINERS
    bhkRadioContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    furnishingRadioContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    radioButtonSmall: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    radioTextSmall: { fontSize: 11, fontFamily: 'Montserrat_500Medium' },

    // PROPERTY TYPE CARDS - BIGGER SIZE
    propertyTypeCardScroll: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 8,
        alignItems: 'flex-start',
        minWidth: 95,
    },
    propertyTypeCardSelected: { backgroundColor: '#f8f7ff', borderColor: '#bfb7fd' },
    propertyTypeCardUnselected: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
    propertyTypeIconTop: { marginBottom: 6 },
    propertyTypeTextBottom: { fontSize: 11, fontWeight: '500', fontFamily: 'Montserrat_500Medium', lineHeight: 14 },
    propertyTypeTextSelected: { color: '#6b46c1' },
    propertyTypeTextUnselected: { color: '#6b7280' },

    // SHARED STYLES
    toggleContainer: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 4, borderRadius: 12 },
    toggleButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    toggleButtonActive: { backgroundColor: 'white', elevation: 2, shadowOpacity: 0.1 },
    toggleText: { fontSize: 14, fontWeight: 'bold' },
    toggleTextActive: { color: '#111827' },
    toggleTextInactive: { color: '#9ca3af' },
    dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
    dropdownPlaceholder: { fontSize: 14, color: '#9ca3af' },
    dropdownSelected: { color: '#374151', fontWeight: '600' },
    textInputStyled: { padding: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, fontSize: 14 },
    
    // ROW LAYOUT STYLES
    rowContainer: { flexDirection: 'row', gap: 12 },
    halfWidth: { flex: 1 },
    
    imageUpload: { width: '100%', height: 160, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#d1d5db', backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    uploadedImage: { width: '100%', height: '100%' },
    uploadText: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
    purpleSubmitButton: { width: '100%', padding: 16, backgroundColor: '#bfb7fd', borderRadius: 12, marginTop: 24, alignItems: 'center' },
    purpleSubmitButtonText: { color: 'white', fontSize: 14, fontWeight: '700' },
    
    // AMENITIES STYLES
    amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    amenityChipCompact: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
    amenityChipSelected: { backgroundColor: '#bfb7fd', borderColor: '#bfb7fd' },
    amenityChipUnselected: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
    amenityTextCompact: { fontSize: 11, marginLeft: 6 },
    amenityTextSelected: { color: 'white' },
    amenityTextUnselected: { color: '#6b7280' },
    noAmenitiesContainer: { padding: 20, alignItems: 'center' },
    noAmenitiesText: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
    stateDropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, maxHeight: 200, zIndex: 5000 },
    stateItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    locationDropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, maxHeight: 200, zIndex: 5000 },
    locationItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    locationMainText: { fontSize: 14, fontWeight: '600' },
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    bottomSheet: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#d1d5db', alignSelf: 'center', marginBottom: 12 },
    sheetTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
    sheetBtn: { padding: 14, borderRadius: 12, backgroundColor: '#f3f4f6', marginBottom: 10, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#fee2e2' },
    cancelText: { color: '#b91c1c' }
});

export default AddModal;