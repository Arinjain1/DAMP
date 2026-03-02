import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 33,
        paddingTop: 60,
    },

    /* BACK BUTTON */
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

    /* HEADER */
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 42,
        fontFamily: 'Montserrat_500Medium',
        fontWeight: '400',
        color: '#111827',
        marginBottom: 60,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Montserrat_400Regular',
        color: '#1A1D1B',
    },

    /* FORM */
    form: {
        gap: 18,
    },
    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        gap: 12,
        marginTop: 20,
    },
    otpInput: {
        flex: 1,
        height: 60,
        borderWidth: 1.2,
        borderColor: '#D1D5DB',
        borderRadius: 22,
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        backgroundColor: 'transparent',
        fontFamily: 'Montserrat_600SemiBold',
    },
    otpInputFilled: {
        borderColor: '#C4B5FD',
        backgroundColor: 'rgba(196, 181, 253, 0.1)',
    },

    /* RESEND */
    resendContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    timerText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '400',
        fontFamily: 'Montserrat_400Regular',
    },
    resendText: {
        fontSize: 13,
        color: '#EF4444',
        fontWeight: '500',
        fontFamily: 'Montserrat_500Medium',
    },

    /* BUTTON */
    continueBtn: {
        backgroundColor: '#C4B5FD',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 66,
    },
    continueText: {
        fontSize: 16,
        color: '#111827',
        fontFamily: 'Montserrat_600SemiBold',
    },

    /* FOOTER */
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
