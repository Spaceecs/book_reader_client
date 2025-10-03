import React from "react";
import {createDrawerNavigator} from "@react-navigation/drawer";
import SettingsScreen from "../../screens/SettingsScreen";
import DrawerContent from "./DrawerContent";
import EpubReaderScreen from "../../screens/EpubReaderScreen";
import PdfReaderScreen from "../../screens/PdfReaderScreen";
import {SearchScreen} from "../../screens/SearchScreen";
import { MainTabs } from "./TabNavigation";
import LibraryScreen from "../../screens/LibraryScreen";
import {ReadMoreScreen} from "../../screens/ReadMoreScreen";
import TrashScreen from "../../screens/TrashScreen";
import { CollectionsScreen } from "../../screens/CollectionsScreen";
import CollectionSimpleScreen from "../../screens/CollectionSimpleScreen";
import CollectionDetailsScreen from "../../screens/CollectionDetailsScreen";
import CollectionStack from "./stacks/CollectionStack";

const Drawer =  createDrawerNavigator();

export function DrawerNavigator() {
    return (
        <Drawer.Navigator screenOptions={{headerShown: false}} initialRouteName="Home" id="main"
                          drawerContent={(props) => <DrawerContent {...props} />}
        >

            <Drawer.Screen name="Home" component={MainTabs} />
            <Drawer.Screen name="Library" component={LibraryScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen name="CollectionsStack" component={CollectionStack} />
            <Drawer.Screen name="Trash" component={TrashScreen} />
            <Drawer.Screen name="EpubReaderScreen" component={EpubReaderScreen} />
            <Drawer.Screen name="PdfReaderScreen" component={PdfReaderScreen} />
            <Drawer.Screen name="SearchScreen" component={SearchScreen} />
            <Drawer.Screen name="ReadMore" component={ReadMoreScreen} />
        </Drawer.Navigator>
    )
}

