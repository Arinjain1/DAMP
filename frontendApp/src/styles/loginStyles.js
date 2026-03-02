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

    passwordContainer: {
        position: 'relative',
    },

    passwordInput: {
        height: 60,
        borderRadius: 22,
        paddingHorizontal: 22,
        paddingRight: 60,
        fontSize: 16,
        fontFamily: 'Lato_400Regular',
        borderWidth: 1.2,
        borderColor: '#D1D5DB',
        color: '#111827',
    },

    eyeButton: {
        position: 'absolute',
        right: 20,
        top: 20,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    forgotWrap: {
        alignSelf: 'flex-end',
        marginTop: -10,
    },

    forgotText: {
        fontSize: 13,
        color: '#AFA0F8',
        fontFamily: 'Montserrat_500Medium',
    },

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
