import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../../../screens/SettingsScreen";
import SettingsDevices from "../../../screens/SettingsDevices";
import SettingsChangePassword from "../../../screens/SettingsChangePassword";
import SettingsChangeEmail from "../../../screens/SettingsChangeEmail";

const Stack = createNativeStackNavigator();

export function SettingsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsHome" component={SettingsScreen} />
            <Stack.Screen name="SettingsDevices" component={SettingsDevices} />
            <Stack.Screen name="SettingsChangePassword" component={SettingsChangePassword} />
            <Stack.Screen name="SettingsChangeEmail" component={SettingsChangeEmail} />
        </Stack.Navigator>
    );
}
