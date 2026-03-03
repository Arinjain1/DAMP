import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#A78BFA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 1 : 30,
        paddingBottom: 14,
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
    welcomeCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    faqSection: {
        marginHorizontal: 16,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    faqCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    faqQuestion: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginRight: 12,
    },
    faqAnswer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    contactCard: {
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
        marginTop: 24,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    contactText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    contactInfo: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        width: 60,
    },
    contactValue: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
    },
});

export default styles;
