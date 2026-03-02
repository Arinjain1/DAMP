import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    header: {
        backgroundColor: '#A78BFA',
        paddingTop:
            Platform.OS === 'android'
                ? StatusBar.currentHeight + 12
                : 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },

    scrollContent: {
        paddingBottom: 30,
    },

    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        marginBottom: 16,
    },

    avatarPlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#A78BFA',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#E9D5FF',
    },

    avatarInitial: {
        fontSize: 36,
        color: '#fff',
        fontWeight: '700',
    },

    nameContainer: {
        marginLeft: 16,
        flex: 1,
    },

    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },

    profileRole: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },

    card: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },

    infoRow: {
        marginBottom: 16,
    },

    label: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },

    value: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '600',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },

    loadingText: {
        fontSize: 14,
        color: '#6B7280',
    },

    skeleton: {
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },

    skeletonText: {
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
});

export default styles;
