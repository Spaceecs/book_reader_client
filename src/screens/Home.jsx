import {View} from "react-native";
import {BookListWidget, LOBookWidget} from "../widgets";

export default function HomeScreen() {
    return (
        <View>
            <LOBookWidget/>
            <BookListWidget/>
        </View>
    )
}