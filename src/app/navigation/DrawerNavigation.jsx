import HomeScreen from "../../screens/Home";
import React from "react";
import {createDrawerNavigator} from "@react-navigation/drawer";
import SettingsScreen from "../../screens/SettingsScreen";

const Drawer =  createDrawerNavigator();

export function DrawerNavigator() {
    return (
        <Drawer.Navigator initialRouteName="Home" id="main">
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
    )
}

