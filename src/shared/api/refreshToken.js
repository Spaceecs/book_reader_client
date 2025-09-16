import {myApi} from "./axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const RefreshToken = async (data) => {
    try {
        const response = await myApi.post(`/auth/refresh`, data)

        await AsyncStorage.setItem('token', response.data.token);

        return response.data;

    } catch (error) {

        throw new Error(error.response?.data?.error || 'Помилка входу');

    }
}