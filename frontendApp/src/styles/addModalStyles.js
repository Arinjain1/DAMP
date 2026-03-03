import { StyleSheet } from 'react-native';

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
    rowInputs: { flexDirection: 'row', gap: 12 },
    halfInput: { flex: 1 },
    priceInputContainer: { flex: 1.5 },
    priceUnitContainer: { flex: 1, position: 'relative' },
    dropdownStyled: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8
    },
    dropdownOptions: {
        position: 'absolute',
        top: 52,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1000,
    },
    dropdownOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    dropdownOptionText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },

    imageUpload: { width: '100%', height: 160, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#d1d5db', backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    uploadedImage: { width: '100%', height: '100%' },
    uploadPlaceholder: { alignItems: 'center', justifyContent: 'center', flexDirection: 'column' },
    uploadIconContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    uploadText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
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

    // BUDGET SLIDER STYLES
    budgetContainer: { marginTop: 8 },
    budgetLabel: { fontSize: 16, fontWeight: '700', color: '#bfb7fd', textAlign: 'center', marginBottom: 5 },

    budgetSliderContainer: { marginBottom: 2, paddingHorizontal: 10 },
    budgetSlider: {
        height: 40,
        justifyContent: 'center',
        position: 'relative',
        width: '100%'
    },
    budgetSliderTrack: {
        position: 'absolute',
        width: '100%',
        height: 3,
        backgroundColor: '#e5e7eb',
        borderRadius: 1.5,
        top: '50%',
        marginTop: -1.5
    },
    budgetTrack: {
        position: 'absolute',
        height: 3,
        backgroundColor: '#111827',
        borderRadius: 1.5,
        top: '50%',
        marginTop: -1.5
    },
    budgetThumb: {
        position: 'absolute',
        top: '50%',
        width: 16,
        height: 16,
        backgroundColor: '#111827',
        borderRadius: 8,
        marginTop: -8,
        zIndex: 10
    },
    budgetRangeLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
    budgetRangeText: { fontSize: 11, color: '#6b7280' },

    // TEXT AREA INPUT
    textAreaInput: { height: 100, textAlignVertical: 'top', paddingTop: 14 },

    // DROPDOWN STYLES FOR FOLLOWUP
    customerDropdown: {
        position: 'relative', // Part of the flow normally
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        maxHeight: 200,
        zIndex: 5000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    customerDropdownOverlay: {
        position: 'absolute',
        left: 24,
        right: 24,
        zIndex: 10000,
        elevation: 20,
    },
    customerScrollView: { maxHeight: 160 },
    customerScrollViewKeyboard: { maxHeight: 200 },
    customerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    customerItemContent: { flexDirection: 'column' },
    customerText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
    customerSubText: { fontSize: 12, color: '#6b7280', marginTop: 2 },

    // SEARCH STYLES
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#f9fafb'
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1f2937',
        paddingVertical: 4
    },
    noResultsContainer: {
        padding: 20,
        alignItems: 'center'
    },
    noResultsText: {
        fontSize: 14,
        color: '#9ca3af',
        fontStyle: 'italic'
    },

    propertyDropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, maxHeight: 200, zIndex: 5000 },
    propertyScrollView: { maxHeight: 200 },
    propertyItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    propertyItemContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    propertyText: { fontSize: 14, fontWeight: '600', flex: 1 },

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

export default styles;
