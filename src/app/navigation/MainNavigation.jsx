import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {LoginScreen} from '../../screens/Login';
import {RegisterScreen} from '../../screens/Register';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {DrawerNavigator} from "./DrawerNavigation";
import {useSelector} from "react-redux";
import {selectLanguage} from "../../entities";
import i18n from "i18next";
import WelcomeScreen from "../../screens/WelcomeScreen";

const Stack = createNativeStackNavigator();

export function MainNavigator() {

    const language = useSelector(selectLanguage);

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language]);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={"WelcomeScreen"} screenOptions={{ headerShown: false }}>
                <Stack.Screen name={"WelcomeScreen"} component={WelcomeScreen} />
                <Stack.Screen name={"LoginScreen"} component={LoginScreen}/>
                <Stack.Screen name={"RegisterScreen"} component={RegisterScreen}/>
                <Stack.Screen
                    name="DrawerRoot"
                    component={DrawerNavigator}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
