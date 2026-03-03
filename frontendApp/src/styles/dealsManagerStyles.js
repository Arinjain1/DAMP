import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingBottom: 120,
    },

    // Header
    header: {
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f9fafb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#3E3E3E',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '500',
        marginTop: 4,
    },

    // Main Body
    mainBody: {
        paddingHorizontal: 20,
    },

    // Filter Section
    filterSection: {
        marginTop: 2,
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    filterScroll: {
        gap: 8,
        paddingRight: 20,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    filterChipActive: {
        backgroundColor: '#8B7CF6',
        borderColor: '#8B7CF6',
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
    },
    filterChipTextActive: {
        color: 'white',
    },

    // Deals Container
    dealsContainer: {
        gap: 12,
    },

    // Deal Card
    dealCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dealCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    dealInfoRow: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    dealImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
    },
    dealTextInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    dealTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    dealLocation: {
        fontSize: 12,
        color: '#6b7280',
    },
    stageBadge: {
        backgroundColor: '#faf5ff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    stageBadgeCompleted: {
        backgroundColor: '#d1fae5',
    },
    stageText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#8B7CF6',
    },
    stageTextCompleted: {
        color: '#059669',
    },

    // Card Middle
    dealCardMiddle: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    customerAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#faf5ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    customerInitial: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8B7CF6',
    },
    customerName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#374151',
    },
    dealPrice: {
        fontSize: 14,
        fontWeight: '900',
        color: '#111827',
    },

    // Card Bottom
    dealCardBottom: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dealDate: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9ca3af',
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    manageText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#8B7CF6',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyIconContainer: {
        backgroundColor: '#f3f4f6',
        height: 80,
        width: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default styles;
