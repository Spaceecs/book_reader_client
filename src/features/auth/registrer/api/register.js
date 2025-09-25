import * as SecureStore from 'expo-secure-store';
import { myApi } from "../../../../shared";

export const register = async (data) => {
    const response = await myApi.post("/auth/register", data);

    await SecureStore.setItemAsync('token', response.data.token);
    await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);

    return response.data;
};
