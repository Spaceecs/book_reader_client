import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useSelector } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import i18n from "i18next";
import { LoginScreen } from "../../screens/LoginScreen";
import { RegisterScreen } from "../../screens/RegisterScreen";
import WelcomeScreen from "../../screens/WelcomeScreen";
import { ForgotPasswordScreen } from "../../screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../../screens/ResetPasswordScreen";
import { selectLanguage } from "../../entities";
import { DrawerNavigator } from "./DrawerNavigation";
import { OfflineDrawer } from "./OfflineNavigation";

const Stack = createNativeStackNavigator();

export function MainNavigator() {
    const language = useSelector(selectLanguage);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language]);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await SecureStore.getItemAsync("token");
                setIsAuthenticated(!!token);

                const netState = await NetInfo.fetch();
                setIsOnline(netState.isConnected && netState.isInternetReachable);
            } catch (error) {
                console.error("Error reading token:", error);
                setIsAuthenticated(false);
                setIsOnline(false);
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const initialRoute = isAuthenticated
        ? "DrawerRoot"
        : isOnline
            ? "WelcomeScreen"
            : "OfflineRoot";

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
                <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
                <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
                <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
                <Stack.Screen name="OfflineRoot" component={OfflineDrawer} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
