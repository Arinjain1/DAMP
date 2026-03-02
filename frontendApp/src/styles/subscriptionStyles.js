import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#BFB7FD',
    },

    // Header - Full Page
    headerGradient: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
        paddingHorizontal: 20,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    closeButton: {
        padding: 8,
    },
    restoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        fontFamily: 'Poppins_600SemiBold',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1F2937',
        marginBottom: 6,
        letterSpacing: -0.5,
        fontFamily: 'Poppins_700Bold',
    },
    subtitle: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
        fontFamily: 'Lato_400Regular',
    },

    // Features
    featuresContainer: {
        marginBottom: 40,
        gap: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        fontFamily: 'Montserrat_600SemiBold',
    },

    // Plans
    plansContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    planCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 18,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        height: 140,
        justifyContent: 'space-between',
        position: 'relative',
    },
    planCardSelected: {
        borderColor: '#111827',
        borderWidth: 2,
        backgroundColor: '#fff',
    },
    checkmarkBadge: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#10B981',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
        zIndex: 10,
    },
    planName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
        fontFamily: 'Poppins_600SemiBold',
    },
    planPrice: {
        fontSize: 24,
        fontWeight: '200',
        color: '#111827',
        letterSpacing: -0.2,
        fontFamily: 'Lato_700Bold',
    },
    saveText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#111827',
        marginTop: 3,
        fontFamily: 'Poppins_700Bold',
    },
    planPeriod: {
        fontSize: 11,
        fontWeight: '500',
        color: '#4B5563',
        fontFamily: 'Lato_400Regular',
    },

    // Footer
    footer: {
        paddingHorizontal: 0,
    },
    subscribeButton: {
        backgroundColor: '#C7D2FE',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subscribeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        fontFamily: 'Poppins_700Bold',
    },
});

export default styles;
