import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";

export function SecondHeader({title}) {
    const navigation = useNavigation();
    return(
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
                <Ionicons name="chevron-back" size={22} color="#222" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity style={styles.headerSearch}>
                <Ionicons name="search" size={22} color="#222" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 34,
        paddingBottom: 10,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerBack: {
        marginRight: 12,
        padding: 4
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#0F0F0F',
        textAlign: 'center'
    },
    headerSearch: {
        marginLeft: 12,
        padding: 4
    },
})