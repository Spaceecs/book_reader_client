import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LoginScreen } from '../../screens/LoginScreen';
import { RegisterScreen } from '../../screens/RegisterScreen';
import WelcomeScreen from '../../screens/WelcomeScreen';
import { DrawerNavigator } from './DrawerNavigation';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../../entities';
import i18n from 'i18next';
import {ForgotPasswordScreen} from "../../screens/ForgotPasswordScreen";
import {ResetPasswordScreen} from "../../screens/ResetPasswordScreen";

const Stack = createNativeStackNavigator();

export function MainNavigator() {
    const language = useSelector(selectLanguage);

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language]);

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');
                setIsAuthenticated(!!token);
            } catch (error) {
                console.error('Error reading token:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={isAuthenticated?"DrawerRoot":"WelcomeScreen"}>
                <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
                <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
                <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
