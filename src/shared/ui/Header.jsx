import {TextInput, TouchableOpacity, View, StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";

export default function Header() {
    const {t} = useTranslation();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    return (
        <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="#000" />
            </TouchableOpacity>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('header')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 45,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 40,
        flex: 1,
        marginLeft: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
})