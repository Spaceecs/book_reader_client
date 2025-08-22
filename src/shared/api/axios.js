import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../config';

const myApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

myApi.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const fullUrl = config.baseURL + config.url;
        console.log('Axios request URL:', fullUrl);
        return config;
    },
    (error) => Promise.reject(error)
);

let navigationRef = null;
export const setNavigation = (nav) => {
    navigationRef = nav;
};

myApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('token');
            if (navigationRef) {
                navigationRef.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            } else {
                console.warn('Navigation reference is not set. Cannot redirect on 401.');
            }
        }
        return Promise.reject(error);
    }
);

export { myApi };
