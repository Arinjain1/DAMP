import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },

    // --- HEADER STYLES ---
    headerContainer: {
        paddingTop: 60, // Safe area
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',


    },
    dateBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bigDateNumber: {
        fontSize: 42,
        fontWeight: '300',
        color: '#1f2937',
        fontFamily: 'Montserrat-700Bold',
    },
    dateTexts: {
        justifyContent: 'center',
    },
    dayName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#9ca3af',
        textTransform: 'uppercase',
    },
    monthYear: {
        fontSize: 15,
        fontWeight: '400',
        color: '#9ca3af',
    },

    // --- TOGGLE STYLES ---
    toggleWrapper: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        padding: 2,
        height: 46,
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
    toggleBtn: {
        paddingHorizontal: 12,
        justifyContent: 'center',
        borderRadius: 8,
        width: 80,
        alignItems: 'center',
    },
    inactiveBtn: {
        backgroundColor: 'transparent',
    },
    pendingActive: {
        backgroundColor: '#ef4444', // Red for Pending
        elevation: 2,
        shadowColor: '#ef4444',
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    doneActive: {
        backgroundColor: '#22c55e', // Green for Done
        elevation: 2,
        shadowColor: '#22c55e',
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeText: {
        color: '#ffffff',
    },
    inactiveText: {
        color: '#9ca3af',
    },

    // --- CALENDAR STRIP ---
    calendarContainer: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        backgroundColor: '#ffffff',
    },
    calendarScrollView: {
        paddingHorizontal: 16,
    },
    calendarScrollContent: {
        paddingRight: 16, // Extra padding at the end
    },
    dayItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 55,
        height: 65,
        borderRadius: 18,
        marginRight: 12, // Space between items
    },
    dayItemSelected: {
        backgroundColor: '#000000', // Black selected background like image "W 24",
        color: '#ffffff',
    },
    dayLabel: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '600',
        marginBottom: 4,
    },
    dayLabelSelected: {
        color: '#ffffff', // Slightly lighter grey inside black box? Or white? Image looks greyish
    },
    dateLabel: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '700',
    },
    dateLabelSelected: {
        color: '#ffffff',
    },

    // --- TIMELINE WRAPPER ---
    timelineWrapper: {
        flex: 1,
        backgroundColor: '#ffffff',
    },

    // --- TIMELINE ---
    scrollView: {
        flex: 1,
        marginTop: 10,

    },
    scrollContent: {
        paddingBottom: 100,
    },
    timelineHeader: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    colHeaderTime: {
        width: 60,
        fontSize: 13,
        color: '#d1d5db',
        fontWeight: '500',
    },
    colHeaderTask: {
        fontSize: 13,
        color: '#d1d5db',
        fontWeight: '500',
    },
    timelineContainer: {
        position: 'relative',
        paddingHorizontal: 24,
    },
    continuousVerticalLine: {
        position: 'absolute',
        left: 80, // Position after time column (24px padding + 44px time width + 12px margin)
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: '#f3f4f6', // Lighter color
        zIndex: 1,
    },
    timelineRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
        zIndex: 2,
    },
    timeCol: {
        width: 44, // Fixed width for alignment
        paddingTop: 4,
        marginRight: 24, // Space before the card
    },
    startTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },

    // --- CARDS ---
    card: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        minHeight: 110,
        justifyContent: 'center',

    },
    cardPurple: {
        backgroundColor: '#bca4ff', // Similar to the "Mathematics" card
    },
    cardWhite: {
        backgroundColor: '#f9fafb', // Similar to "Biology" card
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    customerName: {
        fontFamily: 'Montserrat-600SemiBold',
        fontSize: 15,
        color: '#000000',
        fontWeight: '700',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat-700Bold',
        fontWeight: '700',
        flex: 1,
    },
    cardSubtitle: {
        fontSize: 13,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 3,
    },
    infoText: {
        fontFamily: 'Lato-400Regular',
        fontSize: 12,
        fontWeight: '100',
        flex: 1,
    },
    showMoreText: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 18,
        marginTop: 2,
        fontStyle: 'italic',
    },
    noteText: {
        fontFamily: 'Lato-400Regular',
        fontSize: 11,
        lineHeight: 16,
        marginTop: 4,
        marginBottom: 8,

    },
    actionContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    actionContainerNoBorder: {
        borderTopWidth: 0,
        paddingTop: 0,
        marginTop: 0,
    },
    contactButtonsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    miniBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 6,
        backgroundColor: '#00000000',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)', // Same as partition border color
    },
    miniBtnText: {
        fontSize: 10,
        fontWeight: '700',
    },
    startVisitButton: {
        backgroundColor: '#000000',
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    startVisitText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },  // --- EMPTY STATE ---
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 10,
        color: '#9ca3af',
    },

    // --- SKELETON LOADER STYLES ---
    skeletonTime: {
        width: 40,
        height: 12,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonTitle: {
        width: 80,
        height: 14,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonActions: {
        width: 60,
        height: 14,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonCustomerName: {
        width: 120,
        height: 16,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginTop: 8,
    },
    skeletonInfoRow: {
        width: '90%',
        height: 12,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginTop: 6,
    },
    skeletonNote: {
        width: '100%',
        height: 12,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginTop: 8,
    },
    skeletonActionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    skeletonButton: {
        flex: 1,
        height: 32,
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
    },

    // --- FAB ---
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        backgroundColor: '#000',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

export default styles;
