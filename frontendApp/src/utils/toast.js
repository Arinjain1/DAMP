import Toast from 'react-native-toast-message';

export const showToast = {
    success: (message, text2 = '') => {
        Toast.show({
            type: 'success',
            text1: message,
            text2: text2,
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
        });
    },
    error: (message, text2 = '') => {
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 50,
        });
    },
    info: (message, text2 = '') => {
        Toast.show({
            type: 'info',
            text1: message,
            text2: text2,
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
        });
    },
    warn: (message, text2 = '') => {
        Toast.show({
            type: 'info', // react-native-toast-message doesn't have a built-in 'warn' type by default, usually 'info' is used or a custom config
            text1: 'Warning',
            text2: message,
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
        });
    },
};
