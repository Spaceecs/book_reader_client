import {BookListScreen} from "../../screens/BookList";
import React from "react";
import {createDrawerNavigator} from "@react-navigation/drawer";

const Drawer =  createDrawerNavigator();

export function DrawerNavigator() {
    return (
        <Drawer.Navigator initialRouteName="Home" id="main">
            <Drawer.Screen name="Home" component={BookListScreen} />
        </Drawer.Navigator>
    )
}

