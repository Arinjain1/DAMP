import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },

    header: {
        backgroundColor: '#BFB7FD',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 25 : 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
        overflow: 'hidden',
    },
    headerDecoration: {
        position: 'absolute',
        width: 245,
        height: 245,
        opacity: 0.95,
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 52,
    },
    profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#fff',
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    userName: { fontSize: 18, fontWeight: '700', color: '#313131' },
    verificationBadge: { width: 16, height: 16, resizeMode: 'contain' },
    bellButton: { padding: 12, borderRadius: 16, position: 'relative' },
    notificationIcon: { width: 24, height: 24, resizeMode: 'contain' },
    dot: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 8,
        height: 8,
        backgroundColor: '#ef4444',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fff',
    },
    statsOuterBox: {
        backgroundColor: '#fff',
        borderRadius: 20,
        flexDirection: 'row',
        padding: 12,
        gap: 8,
    },
    statInnerBox: {
        flex: 1,
        backgroundColor: '#F2F0FF',
        borderRadius: 14,
        alignItems: 'center',
        paddingVertical: 14,
    },
    statCount: { fontSize: 14, fontWeight: '400' },
    statLabel: { fontSize: 11, marginTop: 6 },

    // Body Padding is 20
    body: { padding: 20 },

    sectionTitle: { fontFamily: 'MONTSERRAT_700', fontSize: 16, fontWeight: '700', marginBottom: 15, color: '#313131' },

    /* --- MODIFIED BILL PAYMENTS STYLES --- */

    billPaymentsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: -20,
        marginBottom: 4,
    },

    iconsGroup: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 22,
    },

    navItem: {
        alignItems: 'center',
        minWidth: 50,
    },

    navIconContainer: {
        width: 54,
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },

    navLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center'
    },

    brokerBlock: {
        backgroundColor: '#E9e6f7',
        width: 80,
        height: 80,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,

        alignItems: 'center',
        justifyContent: 'center',
    },

    brokerLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 0,
        fontFamily: 'MONTSERRAT_600',
    },

    brokerNumber: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 1,
        fontFamily: 'MONTSERRAT_600',
    },

    errorBanner: {
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FCD34D',
    },
    errorText: {
        fontSize: 12,
        color: '#92400E',
        textAlign: 'center',
        fontFamily: 'MONTSERRAT_500',
    },
    /* ------------------------------------ */

    dealCard: {
        width: 280,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginRight: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dealTop: { flexDirection: 'row', gap: 12 },
    dealImage: { width: 40, height: 40, borderRadius: 10 },
    dealTitle: { fontWeight: '500', fontSize: 13 },
    dealSubtitle: { fontFamily: 'MONTSERRAT_400', fontSize: 11, color: '#6b7280' },
    stageBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    dealBottom: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nextStep: { fontSize: 12, color: '#9ca3af' },
    price: { fontSize: 13, fontWeight: '800' },
    focusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewAll: { flexDirection: 'row', gap: 4, bottom: 8 },
    viewAllText: { fontSize: 12, fontWeight: '700', color: '#968CE4' },
    taskCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        gap: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dateBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateMonth: { fontSize: 10, fontWeight: '700', color: '#6b7280' },
    dateDay: { fontSize: 18, fontWeight: '900' },
    taskTitle: { fontWeight: '700' },
    taskNote: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    timeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
    timeText: { fontSize: 10, fontWeight: '700', color: '#9ca3af', bottom: 3 },
});

export const skeletonStyles = StyleSheet.create({
    skeletonAvatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#e5e7eb',
    },
    skeletonNameContainer: {
        gap: 6,
    },
    skeletonName: {
        width: 120,
        height: 16,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonBell: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
    },
    skeletonStatCount: {
        width: 30,
        height: 14,
        backgroundColor: '#d1d5db',
        borderRadius: 4,
        marginBottom: 6,
    },
    skeletonStatLabel: {
        width: 50,
        height: 11,
        backgroundColor: '#d1d5db',
        borderRadius: 4,
    },
    skeletonSectionTitle: {
        width: 120,
        height: 16,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginBottom: 15,
    },
    skeletonNavItem: {
        alignItems: 'center',
        minWidth: 50,
    },
    skeletonNavIcon: {
        width: 54,
        height: 54,
        borderRadius: 14,
        backgroundColor: '#e5e7eb',
        marginBottom: 2,
    },
    skeletonNavLabel: {
        width: 40,
        height: 11,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonBrokerText: {
        width: 50,
        height: 12,
        backgroundColor: '#d1d5db',
        borderRadius: 4,
        marginBottom: 4,
    },
    skeletonBrokerNumber: {
        width: 30,
        height: 12,
        backgroundColor: '#d1d5db',
        borderRadius: 4,
    },
    skeletonDealCard: {
        width: 280,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginRight: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    skeletonDealTop: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    skeletonDealImage: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#e5e7eb',
    },
    skeletonDealTitle: {
        height: 13,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonDealSubtitle: {
        height: 11,
        width: '60%',
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonDealBottom: {
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skeletonDealBadge: {
        width: 80,
        height: 20,
        backgroundColor: '#e5e7eb',
        borderRadius: 6,
    },
    skeletonDealPrice: {
        width: 60,
        height: 13,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonTaskCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        gap: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    skeletonDateBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#e5e7eb',
    },
    skeletonTaskTitle: {
        height: 14,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonTaskNote: {
        height: 12,
        width: '80%',
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    skeletonTaskTime: {
        height: 10,
        width: 60,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyStateImage: {
        width: 180,
        height: 180,
        marginBottom: 14,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default styles;
