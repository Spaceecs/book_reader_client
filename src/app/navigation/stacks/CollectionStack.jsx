import {createNativeStackNavigator} from "@react-navigation/native-stack";
import React from "react";
import {CollectionsScreen} from "../../../screens/CollectionsScreen";
import CollectionDetailsScreen from "../../../screens/CollectionDetailsScreen";
import CollectionSimpleScreen from "../../../screens/CollectionSimpleScreen";

const Stack = createNativeStackNavigator();

export default function CollectionStack() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Collections" component={CollectionsScreen} />
            <Stack.Screen name="CollectionDetails" component={CollectionDetailsScreen} />
            <Stack.Screen name="CollectionSaved" component={CollectionSimpleScreen} initialParams={{ mode: 'saved' }} />
            <Stack.Screen name="CollectionPostponed" component={CollectionSimpleScreen} initialParams={{ mode: 'postponed' }} />
            <Stack.Screen name="CollectionDownloaded" component={CollectionSimpleScreen} initialParams={{ mode: 'downloaded' }} />
            <Stack.Screen name="CollectionAudio" component={CollectionSimpleScreen} initialParams={{ mode: 'audio' }} />
        </Stack.Navigator>
    )
}