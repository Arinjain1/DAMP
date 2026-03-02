import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        borderWidth: 1,
        borderColor: '#B4B4B4',
        marginBottom: 16,
    },
    cardBackground: {
        padding: 20,
        minHeight: 145,
        justifyContent: 'flex-start',
        bottom: 1,
    },
    imageStyle: {
        borderRadius: 16,
        height: 152,
    },
    cardContent: {
        zIndex: 1,
    },
    cardLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 1,
    },
    cardAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 22,
    },
    remainingText: {
        fontSize: 16,
        color: '#6b7280',
    },
});

export default styles;
