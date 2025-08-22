import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import {RefreshToken} from "../../api";

export function useAuthRefresh() {
    const navigation = useNavigation();

    useEffect(() => {
        const tryRefreshOnce = async () => {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (!refreshToken) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
                return;
            }

            const tokenRefreshed = await SecureStore.getItemAsync('tokenRefreshed');
            if (tokenRefreshed === 'true') {
                return;
            }

            try {
                await RefreshToken({ refreshToken });

                await SecureStore.setItemAsync('tokenRefreshed', 'true');
            } catch (err) {
                console.error('Помилка оновлення токена:', err);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        };

        tryRefreshOnce();
    }, [navigation]);
}
