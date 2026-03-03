import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 33,
        paddingTop: 60,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#15151520',
    },

    header: {
        marginBottom: 20,
    },

    title: {
        fontSize: 35,
        fontFamily: 'Montserrat_500Medium',
        fontWeight: '400',
        color: '#111827',
        marginBottom: 50,
    },

    subtitle: {
        fontSize: 15,
        fontFamily: 'Montserrat_400Regular',
        color: '#1A1D1B',
    },

    form: {
        gap: 18,
    },

    input: {
        height: 60,
        borderRadius: 22,
        paddingHorizontal: 22,
        fontSize: 16,
        fontFamily: 'Lato_400Regular',
        borderWidth: 1.2,
        borderColor: '#D1D5DB',
        color: '#111827',
    },

    infoBox: {
        backgroundColor: 'rgba(196,181,253,0.1)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 8,
    },

    infoText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: 'Lato_400Regular',
    },

    continueBtn: {
        backgroundColor: '#C4B5FD',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 115,
    },

    continueText: {
        fontSize: 16,
        color: '#111827',
        fontFamily: 'Montserrat_600SemiBold',
    },

    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },

    signupText: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'Montserrat_400Regular',
    },

    signupLink: {
        fontSize: 14,
        color: '#AFA0F8',
        fontFamily: 'Montserrat_600SemiBold',
    },

    footer: {
        marginTop: 'auto',
        marginBottom: 28,
        paddingHorizontal: 10,
    },

    footerText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#6B7280',
        fontFamily: 'Lato_400Regular',
        lineHeight: 18,
    },

    link: {
        textDecorationLine: 'underline',
        fontFamily: 'Lato_700Bold',
        color: '#374151',
    },
});

export default styles;
