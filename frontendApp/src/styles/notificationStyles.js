import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },

    header: {
        paddingTop:
            Platform.OS === 'android'
                ? (StatusBar.currentHeight ?? 24) + 18
                : 68,
        paddingHorizontal: 20,
        paddingBottom: 28,

    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    titleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1f2937',
    },

    badge: {
        backgroundColor: '#4f46e5',
        borderRadius: 999,
        minWidth: 24,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignItems: 'center',
    },

    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },

    iconBtn: {
        padding: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.85)',

    },

    content: {
        padding: 20,
        paddingBottom: 120,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden', // 🔥 IMPORTANT for indicator
    },

    unreadCard: {
        backgroundColor: '#eef2ff',
        borderColor: '#c7d2fe',
    },

    leftIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 5,
        backgroundColor: '#6366f1',
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
    },

    cardContent: {
        padding: 16,
        paddingLeft: 20, // indicator spacing
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },

    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },

    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6366f1',
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
        flex: 1,
    },

    unreadTitle: {
        color: '#111827',
    },

    time: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    timeText: {
        fontSize: 11,
        color: '#9ca3af',
    },

    cardMsg: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },

    empty: {
        alignItems: 'center',
        marginTop: 120,
    },

    emptyIcon: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#eef2ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1f2937',
        marginBottom: 6,
    },

    emptySubtitle: {
        fontSize: 15,
        color: '#9ca3af',
    },
});

export default styles;
