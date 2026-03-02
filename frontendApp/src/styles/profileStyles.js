import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#8B7FD9',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    notificationButton: {
        width: 40,
        alignItems: 'flex-end',
    },
    scrollView: {
        flex: 1,
    },
    profileCard: {
        backgroundColor: '#fff',
        marginTop: -30,
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        borderWidth: 3,
        borderColor: '#fff',
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 14,
        color: '#666',
    },
    subscriptionCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    subscriptionLeft: {
        flex: 1,
    },
    subscriptionLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subscriptionPrice: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginRight: 8,
    },
    subscriptionExpiry: {
        fontSize: 12,
        color: '#FF6B6B',
    },
    subscriptionIcon: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    menuItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    menuIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    verifiedBadge: {
        marginLeft: 8,
    },
    verifiedText: {
        fontSize: 12,
        color: '#666',
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#999',
        marginTop: 3,
    },
    bottomSpacing: {
        height: 30,
    },
});

export default styles;
