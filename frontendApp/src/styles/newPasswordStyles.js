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
        fontWeight: '500',
        color: '#111827',
        marginBottom: 60,
    },

    subtitle: {
        fontSize: 15,
        fontWeight: '400',
        color: '#1A1D1B',
    },

    form: {
        gap: 18,
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
        fontWeight: '400',
        borderWidth: 1.2,
        borderColor: '#D1D5DB',
        color: '#111827',
        backgroundColor: 'transparent',
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
        fontWeight: '600',
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
        fontWeight: '400',
    },

    signupLink: {
        fontSize: 14,
        color: '#AFA0F8',
        fontWeight: '600',
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
        fontWeight: '400',
        lineHeight: 18,
    },

    link: {
        textDecorationLine: 'underline',
        fontWeight: '700',
        color: '#374151',
    },
});

export default styles;
