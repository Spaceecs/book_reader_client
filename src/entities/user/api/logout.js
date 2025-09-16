import * as SecureStore from 'expo-secure-store';

export async function logout() {
    try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
    }
    catch (error) {
        console.error(error);
    }
}