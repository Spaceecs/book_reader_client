import * as SecureStore from "expo-secure-store";
import {clearUser} from "../model/userSlice";

export const logout = async (dispatch, navigation) => {
    try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');

        dispatch(clearUser());
        console.log('Logged out');
    } catch (error) {
        console.error('Logout error:', error);
    }
};
