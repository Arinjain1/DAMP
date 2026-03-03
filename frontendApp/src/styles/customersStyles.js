import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    headerContainer: {
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 16 : 64,
        paddingHorizontal: 20, paddingBottom: 10,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        backgroundColor: '#ffffff',
        alignItems: 'center'
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#3E3E3E', marginBottom: 16 },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 2,
        borderWidth: 1, borderColor: '#e5e7eb',
        height: 50,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#000000',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    addButtonText: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
    filterChipsContainer: {
        paddingBottom: 8,
        gap: 24,
    },
    filterChipWrapper: {
        alignItems: 'flex-start',
        paddingHorizontal: 4,
    },
    filterChipText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#9ca3af',
        paddingBottom: 8,
    },
    filterChipTextActive: {
        color: '#1f2937',
        fontWeight: '700',
    },
    chipUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#1f2937',
        borderRadius: 2,
    },
    searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: '#111827', fontWeight: '500', alignItems: 'center' },
    scrollView: { flex: 1, backgroundColor: '#ffffff', },
    scrollContent: { paddingTop: 4, paddingBottom: 100, paddingHorizontal: 20 },
    gridContainer: { gap: 10 },
    card: {
        backgroundColor: 'white', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#e5e7eb',
        marginBottom: 12,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 20, fontWeight: 'bold' },
    headerInfo: { flex: 1 },
    nameText: { fontSize: 15, fontWeight: 'bold', color: '#3E3E3E', marginBottom: 1 },
    budgetText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    editButton: {
        padding: 0,
        marginLeft: 0,
    },
    dropdownButton: {
        padding: 0,
        marginLeft: 0,
    },

    // --- STAGE SCROLL STYLES ---
    stageSection: {
        marginBottom: 6,
        paddingVertical: 8,
        borderRadius: 12,
    },
    stageContainer: {
        height: 46,
    },
    stageScrollContent: {
        paddingHorizontal: 2,
        alignItems: 'center',
        paddingRight: 20,
    },
    stageWrapper: {
        marginRight: 0,
        height: 32,
    },
    stageArrow: {
        height: 36,
        minWidth: 100,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    stageArrowSpecial: {
        height: 38,
    },
    stageContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    stageText: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        color: '#4b5563',
    },

    // Task Section Styles
    taskSection: {

        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    taskName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 6,
    },
    taskDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskType: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: '#6b7280',
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        textAlign: 'center',
    },
    taskTime: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
    },

    // Actions
    cardActions: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6',
    },
    actionButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
        backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    },
    actionText: { fontSize: 13, fontWeight: '600', color: '#374151' },

    // View Details Button
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#9A8CFC',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 12,
    },
    viewDetailsText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
    },

    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: '#9ca3af' },

    // Skeleton Loader Styles
    skeletonCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 12,
    },
    skeletonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    skeletonAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e5e7eb',
    },
    skeletonInfo: {
        flex: 1,
        gap: 8,
    },
    skeletonName: {
        height: 16,
        width: '60%',
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonBudget: {
        height: 14,
        width: '40%',
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonBadge: {
        width: 60,
        height: 24,
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
    },
    skeletonStage: {
        height: 32,
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        marginBottom: 12,
    },
    skeletonTask: {
        height: 80,
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        marginBottom: 12,
    },
    skeletonActions: {
        height: 40,
        backgroundColor: '#e5e7eb',
        borderRadius: 10,
    },
});

export default styles;
