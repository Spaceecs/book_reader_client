import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import DrawerContent from "./DrawerContent";

import { HomeStack } from "./stacks/HomeStack";
import { SettingsStack } from "./stacks/SettingsStack";

const Drawer = createDrawerNavigator();

export function DrawerNavigator() {
    return (
        <Drawer.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="HomeStack"
            drawerContent={(props) => <DrawerContent {...props} />}
        >
            <Drawer.Screen name="HomeStack" component={HomeStack} />
            <Drawer.Screen name="SettingsStack" component={SettingsStack} />
        </Drawer.Navigator>
    );
}
