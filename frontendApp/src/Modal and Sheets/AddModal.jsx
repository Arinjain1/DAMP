import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { X } from 'lucide-react-native';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import Skeleton from '../Components/Skeleton';
import PropertyForm from './PropertyForm';
import CustomerForm from './CustomerForm';
import FollowUpForm from './FollowUpForm';

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



// ==========================================
// MAIN COMPONENT
// ==========================================

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
    const generateId = useCallback(() => Math.random().toString(36).substring(2, 11), []);

    const [formData, setFormData] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showPriceUnitPicker, setShowPriceUnitPicker] = useState(false);
    const [showSizeUnitPicker, setShowSizeUnitPicker] = useState(false);
    const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);

    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const [budgetRange, setBudgetRange] = useState({ min: 10000, max: 5000000 });
    
    const debounceTimer = useRef(null);
    const scrollViewRef = useRef(null);
    const [isContentReady, setIsContentReady] = useState(false);

    // Visibility logic
    useEffect(() => {
        if (isOpen) {
            setIsContentReady(false);
            const timer = setTimeout(() => setIsContentReady(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsContentReady(false);
        }
    }, [isOpen]);

    // Form initialization logic
    useEffect(() => {
        if (!isOpen) return; 

        if (editItem) {
            const updatedEditItem = { ...editItem };
            if (type === 'Customer' && editItem.budgetMin !== undefined) {
                setBudgetRange({ min: editItem.budgetMin, max: editItem.budgetMax });
            }
            if (type === 'Property') {
                const configVal = editItem.configuration || editItem.bhk || '';
                const bhkValues = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
                const hasBHK = configVal && bhkValues.includes(configVal);
                if (editItem.category === 'Residential' && hasBHK) {
                    updatedEditItem.bhk = configVal;
                    updatedEditItem.commercialConfig = '';
                } else if (editItem.category === 'Commercial') {
                    updatedEditItem.bhk = '';
                    updatedEditItem.commercialConfig = configVal;
                } else {
                    updatedEditItem.bhk = '';
                    updatedEditItem.commercialConfig = '';
                }

                // Map furnishingStatus (from Redux/DB) to furnishing (form state)
                updatedEditItem.furnishing = editItem.furnishing || editItem.furnishingStatus || 'Semi';

                // Map address (from Redux/DB) to owner (form state)
                updatedEditItem.owner = editItem.owner || editItem.address || '';

                if (editItem.price) {
                    const price = parseFloat(editItem.price);
                    if (price >= 10000000) { updatedEditItem.priceValue = (price / 10000000).toString(); updatedEditItem.priceUnit = 'Crore'; }
                    else if (price >= 100000) { updatedEditItem.priceValue = (price / 100000).toString(); updatedEditItem.priceUnit = 'Lakh'; }
                    else { updatedEditItem.priceValue = (price / 1000).toString(); updatedEditItem.priceUnit = 'Thousands'; }
                }
                
                if (editItem.size !== undefined && editItem.size !== null) {
                    updatedEditItem.sizeValue = String(editItem.size);
                    updatedEditItem.sizeUnit = editItem.sizeUnit || 'Sq. Ft.';
                } else {
                    updatedEditItem.sizeValue = ''; updatedEditItem.sizeUnit = 'Sq. Ft.';
                }
            }
            if (editItem.propertyId && !editItem.propertyIds) {
                updatedEditItem.propertyIds = [editItem.propertyId];
                delete updatedEditItem.propertyId;
            } else if (!editItem.propertyIds) {
                updatedEditItem.propertyIds = [];
            }
            setFormData(updatedEditItem);
        } else {
            if (type === 'Property') {
                setFormData({ status: 'Available', listingType: 'Sell', category: 'Residential', type: 'Apartment/Flats', bhk: '2 BHK', commercialConfig: '', furnishing: 'Semi', image: '', location: '', priceValue: '', priceUnit: 'Thousands', sizeValue: '', sizeUnit: 'Sq. Ft.', owner: '', ownerName: '', ownerPhone: '', title: '', amenities: [] });
            } else if (type === 'Customer') {
                setFormData({ status: 'New Lead', listingType: 'Buy', category: 'Residential', type: 'Apartment/Flats', bhk: '2 BHK', commercialConfig: '', furnishing: 'Semi', name: '', phone: '', preferredLocation: '' });
                setBudgetRange({ min: 10000, max: 5000000 });
            } else if (type === 'FollowUp') {
                setFormData({ status: 'Pending', type: initialTaskType || 'Call', date: new Date().toISOString(), customerId: initialCustomer?.id || '', propertyIds: initialPropertyIds || [], note: '' });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, editItem?.id, type]);

    const searchPlaces = useCallback((query) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        if (!query || query.length < 2) { setLocationSuggestions([]); setShowLocationDropdown(false); return; }
        debounceTimer.current = setTimeout(async () => {
            setLocationLoading(true);
            try {
                const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
                const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY },
                    body: JSON.stringify({ input: query, includedRegionCodes: ['in'] })
                });
                const data = await response.json();
                if (data.suggestions) {
                    const suggestions = data.suggestions.map((item) => ({
                        id: item.placePrediction.place,
                        description: item.placePrediction.text.text,
                        main_text: item.placePrediction.structuredFormat?.mainText?.text || item.placePrediction.text.text,
                        secondary_text: item.placePrediction.structuredFormat?.secondaryText?.text || '',
                    }));
                    setLocationSuggestions(suggestions);
                    setShowLocationDropdown(suggestions.length > 0);
                }
            } catch (_error) {
                // Ignore API Errors visually
            } finally { 
                setLocationLoading(false); 
            }
        }, 500);
    }, []);

    const handleChange = useCallback((name, value) => {
        setFormData((prev) => {
            let processedValue = value;
            if (['price', 'size', 'budget'].includes(name)) processedValue = value === '' ? '' : Number(value) || 0;
            else if (name === 'date' && value instanceof Date) processedValue = value.toISOString();

            const newData = { ...prev, [name]: processedValue };
            if (name === 'category') {
                if (PROPERTY_STRUCTURE[value]) newData.type = PROPERTY_STRUCTURE[value].types[0];
                if (value !== 'Residential') newData.bhk = '';
                if (value !== 'Commercial') newData.commercialConfig = '';
            }
            if (name === 'type' && prev.category === 'Commercial') newData.commercialConfig = '';
            return newData;
        });
        if (name === 'location' && type === 'Property') searchPlaces(value);
    }, [type, searchPlaces]);
    
    const selectLocation = useCallback((location) => {
        setFormData(prev => ({ ...prev, location: location.description }));
        setShowLocationDropdown(false);
        setLocationSuggestions([]);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
    }, []);

    const pickImage = useCallback(() => setPhotoSheetVisible(true), []);
    const openCamera = useCallback(async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) return;
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.8 });
        if (!result.canceled && result.assets) handleChange('image', result.assets[0].uri);
    }, [handleChange]);

    const openGallery = useCallback(async () => {
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!mediaPermission.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.8 });
        if (!result.canceled && result.assets) handleChange('image', result.assets[0].uri);
    }, [handleChange]);

    const handleSubmit = useCallback(() => {
        const finalData = { ...formData };
        if (type === 'Customer') { finalData.budgetMin = budgetRange.min; finalData.budgetMax = budgetRange.max; }
        if (editItem) {
            onUpdate(finalData);
        } else {
            finalData.id = generateId();
            if (type === 'Property') {
                if (!finalData.title) finalData.title = `${finalData.bhk ? finalData.bhk + ' ' : ''}${finalData.type}`;
                if (!finalData.image) finalData.image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
            }
            onSave(finalData);
        }
    }, [editItem, formData, type, budgetRange, onUpdate, generateId, onSave]);

    const handleDateChange = useCallback((event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (event?.type === 'set' && selectedDate) { setTempDate(selectedDate); setTimeout(() => setShowTimePicker(true), 100); }
        } else if (selectedDate) { setTempDate(selectedDate); handleChange('date', selectedDate); }
    }, [handleChange]);

    const handleTimeChange = useCallback((event, selectedTime) => {
        setShowTimePicker(false);
        if (event?.type === 'set' && selectedTime) {
            const combinedDateTime = new Date(tempDate);
            combinedDateTime.setHours(selectedTime.getHours()); combinedDateTime.setMinutes(selectedTime.getMinutes());
            handleChange('date', combinedDateTime);
        }
    }, [tempDate, handleChange]);

    if (!isOpen) return null;

    return (
        <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent hardwareAccelerated>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
                <View className="flex-1 justify-end bg-black/60">
                    <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0" />
                    <View className="bg-white w-full h-[90vh] rounded-t-3xl overflow-hidden shadow-2xl">
                        {!isContentReady ? (
                            <View style={{ flex: 1, backgroundColor: 'white', padding: 24 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                                    <View><Skeleton width={150} height={24} borderRadius={6} style={{ marginBottom: 8 }} /><Skeleton width={120} height={14} borderRadius={4} /></View>
                                    <Skeleton width={36} height={36} circle />
                                </View>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={{ marginBottom: 20 }}><Skeleton width={100} height={16} borderRadius={4} style={{ marginBottom: 12 }} /><View style={{ flexDirection: 'row', gap: 8 }}><Skeleton width={100} height={44} borderRadius={12} /><Skeleton width={100} height={44} borderRadius={12} /></View></View>
                                    <View style={{ marginBottom: 20 }}><Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 12 }} /><View style={{ flexDirection: 'row', gap: 8 }}><Skeleton width={90} height={44} borderRadius={12} /><Skeleton width={90} height={44} borderRadius={12} /><Skeleton width={90} height={44} borderRadius={12} /></View></View>
                                    <View style={{ marginBottom: 20 }}><Skeleton width={80} height={16} borderRadius={4} style={{ marginBottom: 12 }} /><Skeleton width="100%" height={52} borderRadius={12} /></View>
                                    <View style={{ marginBottom: 20 }}><Skeleton width={90} height={16} borderRadius={4} style={{ marginBottom: 12 }} /><Skeleton width="100%" height={52} borderRadius={12} /></View>
                                </ScrollView>
                            </View>
                        ) : (
                            <>
                                {/* Header */}
                                <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white z-10">
                                    <View>
                                        <Text className="text-gray-800" style={{ fontFamily: 'Montserrat-700Bold', fontSize: 18, fontWeight: '700' }}>{editItem ? 'Edit' : 'New'} {type}</Text>
                                        <Text className="text-xs text-gray-400 font-medium mt-0.5">Fill in the details below</Text>
                                    </View>
                                    <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full"><X size={20} color="#4b5563" /></TouchableOpacity>
                                </View>

                                <ScrollView ref={scrollViewRef} className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                    {type === 'Property' && (
                                        <PropertyForm
                                            formData={formData}
                                            handleChange={handleChange}
                                            styles={styles}
                                            PROPERTY_STRUCTURE={PROPERTY_STRUCTURE}
                                            INDIAN_STATES={INDIAN_STATES}
                                            showStateDropdown={showStateDropdown}
                                            setShowStateDropdown={setShowStateDropdown}
                                            showPriceUnitPicker={showPriceUnitPicker}
                                            setShowPriceUnitPicker={setShowPriceUnitPicker}
                                            showSizeUnitPicker={showSizeUnitPicker}
                                            setShowSizeUnitPicker={setShowSizeUnitPicker}
                                            pickImage={pickImage}
                                            locationSuggestions={locationSuggestions}
                                            locationLoading={locationLoading}
                                            showLocationDropdown={showLocationDropdown}
                                            selectLocation={selectLocation}
                                        />
                                    )}

                                    {type === 'Customer' && (
                                        <CustomerForm
                                            formData={formData}
                                            handleChange={handleChange}
                                            styles={styles}
                                            PROPERTY_STRUCTURE={PROPERTY_STRUCTURE}
                                            budgetRange={budgetRange}
                                            setBudgetRange={setBudgetRange}
                                        />
                                    )}

                                    {type === 'FollowUp' && (
                                        <FollowUpForm
                                            formData={formData}
                                            handleChange={handleChange}
                                            styles={styles}
                                            customers={customers}
                                            properties={properties}
                                            showCustomerDropdown={showCustomerDropdown}
                                            setShowCustomerDropdown={setShowCustomerDropdown}
                                            showPropertyDropdown={showPropertyDropdown}
                                            setShowPropertyDropdown={setShowPropertyDropdown}
                                            setShowDatePicker={setShowDatePicker}
                                            setShowTimePicker={setShowTimePicker}
                                            initialCustomer={initialCustomer}
                                        />
                                    )}

                                    {/* Date Time Pickers */}
                                    {(showDatePicker || showTimePicker) && (
                                        <DateTimePicker value={new Date(formData.date || Date.now())} mode={showDatePicker ? 'date' : 'time'} onChange={showDatePicker ? handleDateChange : handleTimeChange} />
                                    )}

                                    <TouchableOpacity onPress={handleSubmit} style={styles.purpleSubmitButton}>
                                        <Text style={styles.purpleSubmitButtonText}>{editItem ? 'Update' : 'Save'} {type === 'FollowUp' ? 'Task' : type}</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </>
                        )}
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
    listingTypeScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    categoryScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    bhkScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    commercialScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    furnishingScrollContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
    propertyTypeScrollContainer: { flexDirection: 'row', paddingRight: 16 },
    radioOption: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, marginRight: 8 },
    radioOptionSelected: { borderColor: '#bfb7fd', backgroundColor: '#f8f7ff' },
    radioButton: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    radioButtonSelected: { borderColor: '#bfb7fd' },
    radioButtonUnselected: { borderColor: '#d1d5db' },
    radioButtonInner: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#bfb7fd' },
    radioText: { fontSize: 12, fontFamily: 'Montserrat_500Medium' },
    radioTextSelected: { color: '#6b46c1', fontWeight: '600' },
    radioTextUnselected: { color: '#6b7280' },
    radioButtonSmall: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    radioTextSmall: { fontSize: 11, fontFamily: 'Montserrat_500Medium' },
    propertyTypeCardScroll: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, marginRight: 8, alignItems: 'flex-start', minWidth: 95 },
    propertyTypeCardSelected: { backgroundColor: '#f8f7ff', borderColor: '#bfb7fd' },
    propertyTypeCardUnselected: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
    propertyTypeIconTop: { marginBottom: 6 },
    propertyTypeTextBottom: { fontSize: 11, fontWeight: '500', fontFamily: 'Montserrat_500Medium', lineHeight: 14 },
    propertyTypeTextSelected: { color: '#6b46c1' },
    propertyTypeTextUnselected: { color: '#6b7280' },
    dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
    dropdownPlaceholder: { fontSize: 14, color: '#9ca3af' },
    dropdownSelected: { color: '#374151', fontWeight: '600' },
    textInputStyled: { padding: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, fontSize: 14 },
    rowInputs: { flexDirection: 'row', gap: 12 },
    priceInputContainer: { flex: 1.5 },
    priceUnitContainer: { flex: 1, position: 'relative' },
    dropdownStyled: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
    dropdownOptions: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 1000 },
    dropdownOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    dropdownOptionText: { fontSize: 14, color: '#374151', fontWeight: '500' },
    imageUpload: { width: '100%', height: 160, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#d1d5db', backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    uploadedImage: { width: '100%', height: '100%' },
    uploadPlaceholder: { alignItems: 'center', justifyContent: 'center', flexDirection: 'column' },
    uploadIconContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    uploadText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
    purpleSubmitButton: { width: '100%', padding: 16, backgroundColor: '#bfb7fd', borderRadius: 12, marginTop: 24, alignItems: 'center' },
    purpleSubmitButtonText: { color: 'white', fontSize: 14, fontWeight: '700' },
    amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    amenityChipCompact: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
    amenityChipSelected: { backgroundColor: '#bfb7fd', borderColor: '#bfb7fd' },
    amenityChipUnselected: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
    amenityTextCompact: { fontSize: 11, marginLeft: 6 },
    amenityTextSelected: { color: 'white' },
    amenityTextUnselected: { color: '#6b7280' },
    noAmenitiesContainer: { padding: 20, alignItems: 'center' },
    noAmenitiesText: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
    budgetContainer: { marginTop: 8 },
    budgetLabel: { fontSize: 16, fontWeight: '700', color: '#bfb7fd', textAlign: 'center', marginBottom: 5 },
    budgetSliderContainer: { marginBottom: 2, paddingHorizontal: 10 },
    budgetSlider: { height: 40, justifyContent: 'center', position: 'relative', width: '100%' },
    budgetSliderTrack: { position: 'absolute', width: '100%', height: 3, backgroundColor: '#e5e7eb', borderRadius: 1.5, top: '50%', marginTop: -1.5 },
    budgetTrack: { position: 'absolute', height: 3, backgroundColor: '#111827', borderRadius: 1.5, top: '50%', marginTop: -1.5 },
    budgetThumbTouchArea: { position: 'absolute', top: '50%', width: 40, height: 40, marginTop: -20, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    budgetThumb: { width: 20, height: 20, backgroundColor: '#111827', borderRadius: 10, borderWidth: 3, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 5 },
    budgetRangeLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
    budgetRangeText: { fontSize: 11, color: '#6b7280' },
    textAreaInput: { height: 100, textAlignVertical: 'top', paddingTop: 14 },
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
    cancelText: { color: '#b91c1c' },
    customerDropdown: { position: 'relative', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, maxHeight: 200, zIndex: 5000, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    customerScrollView: { maxHeight: 160 },
    customerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    customerItemContent: { flexDirection: 'column' },
    customerText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
    customerSubText: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    propertyDropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, maxHeight: 200, zIndex: 5000 },
    propertyScrollView: { maxHeight: 200 },
    propertyItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    propertyItemContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    propertyText: { fontSize: 14, fontWeight: '600', flex: 1 },
    rowContainer: { flexDirection: 'row', gap: 12 },
    halfWidth: { flex: 1 }
});

export default memo(AddModal);