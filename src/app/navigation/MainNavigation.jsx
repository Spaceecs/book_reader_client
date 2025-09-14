import React, {useEffect, useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {LoginScreen} from '../../screens/Login';
import {RegisterScreen} from '../../screens/Register';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {DrawerNavigator} from "./DrawerNavigation";
import {useDispatch, useSelector} from "react-redux";
import {selectLanguage, setToken} from "../../entities";
import i18n from "i18next";
import WelcomeScreen from "../../screens/WelcomeScreen";
import * as SecureStore from "expo-secure-store";
import {ActivityIndicator, View} from "react-native";

const Stack = createNativeStackNavigator();

export function MainNavigator() {

    const language = useSelector(selectLanguage);

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language]);

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');
                if (token) {
                    dispatch(setToken(token));
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
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
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                        <Stack.Screen name="LoginScreen" component={LoginScreen} />
                        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
