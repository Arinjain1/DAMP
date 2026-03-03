import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },

    // --- HEADER SECTION ---
    headerContainer: {
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        fontFamily: 'Montserrat_700Bold',
        color: '#3E3E3E',
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#6b7280',
        marginTop: 4,
    },

    toggleContainer: {
        backgroundColor: '#F3F4F6',
        padding: 4,
        borderRadius: 12,
        flexDirection: 'row',
    },
    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 10,
        minWidth: 60,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        color: '#6b7280',
    },
    toggleTextActive: {
        color: '#111827',
        fontFamily: 'Montserrat_700Bold',
    },

    categoryContainer: {
        marginBottom: 12,
    },
    categoryTab: {
        marginRight: 24,
        paddingBottom: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        color: '#9ca3af',
    },
    categoryTextActive: {
        color: '#111827',
        fontFamily: 'Montserrat_700Bold',
    },
    activeUnderline: {
        height: 2,
        backgroundColor: '#111827',
        marginTop: 6,
        borderRadius: 2,
    },

    // --- NEW CHIP DESIGN ---
    chipsContainer: { paddingBottom: 1 },

    chip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipActive: {
        backgroundColor: '#9A8CFC',
        borderWidth: 0,
        shadowColor: '#B0A6F8',
    },
    chipInactive: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipText: {
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    chipTextActive: {
        color: '#ffffff',
        fontWeight: '600',

    },
    chipTextInactive: {
        color: '#6B7280',

        fontWeight: '500',
    },

    // --- SCROLL CONTENT ---
    scrollView: { flex: 1 },
    scrollContent: {
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 100,
    },

    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    resultCountText: {
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        color: '#9ca3af',
    },
    filterButton: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        color: '#374151',
    },

    emptyState: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#9ca3af',
        marginTop: 4,
    },

    // --- PROPERTY CARDS ---
    propertyCard: {
        backgroundColor: '#ffffff',
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    propertyImageContainer: {
        height: 200,
        width: '100%',
        position: 'relative',
        backgroundColor: '#f3f4f6',
    },
    propertyImage: {
        height: 200,
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    propertyImageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'space-between',
        padding: 16,
    },
    propertyImageContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    propertyBadges: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        backgroundColor: 'rgba(34, 197, 94, 0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadgeSold: {
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
    },
    bhkBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    bhkBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
    },
    editButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8,
        borderRadius: 8,
    },
    propertyInfo: {
        padding: 16,

    },
    propertyTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        color: '#111827',
        marginBottom: 8,

    },
    propertyLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    propertyLocationText: {
        fontSize: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#6b7280',
        flex: 1,
    },
    propertyDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    propertyDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    propertyDetailText: {
        fontSize: 11,
        color: '#6b7280',
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
    },
    propertyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    propertyPrice: {
        fontSize: 18,
        fontWeight: '900',
        fontFamily: 'Montserrat_700Bold',
        color: '#111827',
    },
    propertyListingType: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
    },

    // --- MODAL ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        color: '#111827',
    },
    closeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f9fafb',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'Montserrat_700Bold',
        color: '#374151',
        marginBottom: 12,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: 'white',
    },
    filterOptionActive: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    filterOptionText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
        color: '#6b7280',
    },
    filterOptionTextActive: {
        color: 'white',
        fontFamily: 'Montserrat_600SemiBold',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
        color: '#6b7280',
    },
    applyButton: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#111827',
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
        color: 'white',
    },
    fab: {
        position: 'absolute',
        right: '5%',
        width: 60,
        height: 60,
        backgroundColor: '#111827',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default styles;
