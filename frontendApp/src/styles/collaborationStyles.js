import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    sheetContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        overflow: 'hidden',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 4,
    },
    backButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        fontFamily: 'Montserrat_600SemiBold',
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    // Tab Toggle
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#C4B5FD',
        borderRadius: 25,
        padding: 2,
        marginBottom: 25,
        alignSelf: 'center',
        width: 240,
    },
    tab: {
        flex: 1,
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'Montserrat_500Medium',
    },
    activeTabText: {
        color: '#111827',
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
    },

    // Add Button
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 8,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        fontFamily: 'Montserrat_600SemiBold',
    },

    // Add Form
    addForm: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    formTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        fontFamily: 'Montserrat_600SemiBold',
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111827',
        fontFamily: 'Lato_400Regular',
    },
    continueButton: {
        backgroundColor: '#C4B5FD',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        fontFamily: 'Montserrat_600SemiBold',
    },

    // Section Title
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
        fontFamily: 'Montserrat_600SemiBold',
    },

    // Collaborator List
    collaboratorList: {
        gap: 12,
    },

    // Collaborator Card
    collaboratorCard: {
        backgroundColor: 'transparent',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 16,
        marginBottom: 12,
    },
    collaboratorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#e5e7eb',
    },
    collaboratorInfo: {
        flex: 1,
    },
    collaboratorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
        fontFamily: 'Montserrat_600SemiBold',
    },
    collaboratorLocation: {
        fontSize: 14,
        color: '#6b7280',
        fontFamily: 'Lato_400Regular',
    },
    expandIcon: {
        padding: 4,
    },

    // Stats Container
    statsContainer: {
        marginTop: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    statBox: {
        flex: 1,
    },
    statText: {
        fontSize: 12,
        color: '#6b7280',
        fontFamily: 'Lato_400Regular',
    },
    statValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
        fontFamily: 'Montserrat_700Bold',
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    callButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    callButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4f46e5',
        fontFamily: 'Montserrat_600SemiBold',
    },
    messageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0fdf4',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    messageButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#25D366',
        fontFamily: 'Montserrat_600SemiBold',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6b7280',
        fontFamily: 'Lato_400Regular',
    },

    // Request Card
    requestCard: {
        backgroundColor: 'transparent',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 16,
        marginBottom: 12,
    },
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    brokerId: {
        fontSize: 12,
        color: '#6b7280',
        fontFamily: 'Lato_400Regular',
        marginTop: 2,
    },
    requestActions: {
        flexDirection: 'row',
        gap: 8,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    rejectButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ef4444',
        fontFamily: 'Montserrat_600SemiBold',
    },
    acceptButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0fdf4',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    acceptButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#22c55e',
        fontFamily: 'Montserrat_600SemiBold',
    },

    // Success Modal Styles
    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successModal: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    successIconContainer: {
        marginBottom: 20,
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#bbf7d0',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        fontFamily: 'Montserrat_700Bold',
    },
    successMessage: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Lato_400Regular',
        lineHeight: 20,
    },
    brokerDetailsBox: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    brokerDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    brokerDetailLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
        fontFamily: 'Montserrat_500Medium',
    },
    brokerDetailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        fontFamily: 'Montserrat_600SemiBold',
    },
    additionalInfo: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'Lato_400Regular',
        lineHeight: 18,
        paddingHorizontal: 10,
    },
    doneButton: {
        backgroundColor: '#C4B5FD',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',

    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        fontFamily: 'Montserrat_700Bold',
    },
});

export default styles;
