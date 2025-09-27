import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {HomeScreen} from "../../../screens/HomeScreen";
import {ReadMoreScreen} from "../../../screens/ReadMoreScreen";
import EpubReaderScreen from "../../../screens/EpubReaderScreen";
import PdfReaderScreen from "../../../screens/PdfReaderScreen";
import {SearchScreen} from "../../../screens/SearchScreen";
import {CollectionsScreen} from "../../../screens/CollectionsScreen";

const Stack = createNativeStackNavigator();

export function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ReadMore" component={ReadMoreScreen} />
            <Stack.Screen name="EpubReaderScreen" component={EpubReaderScreen} />
            <Stack.Screen name="PdfReaderScreen" component={PdfReaderScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="Collections" component={CollectionsScreen} />
        </Stack.Navigator>
    );
}
