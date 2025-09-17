import HomeScreen from "../../screens/Home";
import React from "react";
import {createDrawerNavigator} from "@react-navigation/drawer";
import SettingsScreen from "../../screens/SettingsScreen";
import DrawerContent from "./DrawerContent";

const Drawer =  createDrawerNavigator();

export function DrawerNavigator() {
    return (
        <Drawer.Navigator screenOptions={{headerShown: false}} initialRouteName="Home" id="main"
                          drawerContent={(props) => <DrawerContent {...props} />}
        >

            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
    )
}

