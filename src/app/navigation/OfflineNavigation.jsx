import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import LibraryScreen from "../../screens/LibraryScreen";
import { View, Text } from "react-native";

const Drawer = createDrawerNavigator();

function ImportPlaceholder() {
    return (
        <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
            <Text>📚 Імпорт книг доступний тут</Text>
        </View>
    );
}

export function OfflineDrawer() {
    return (
        <Drawer.Navigator screenOptions={{ headerShown: false }} initialRouteName="Library">
            <Drawer.Screen name="Library" component={LibraryScreen} />
            <Drawer.Screen name="Import" component={ImportPlaceholder} />
        </Drawer.Navigator>
    );
}
