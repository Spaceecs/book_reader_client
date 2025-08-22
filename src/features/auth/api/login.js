import * as SecureStore from 'expo-secure-store';
import { myApi } from "../../../shared";


export const login = async (data) => {
    try {
        const response = await myApi.post('/auth/login', data);

        await SecureStore.setItemAsync('token', response.data.token);
        await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Помилка входу');
    }
};
