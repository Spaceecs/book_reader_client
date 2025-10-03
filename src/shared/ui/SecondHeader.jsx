import React, { useState, useRef } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export function SecondHeader({ title, searchValue, onSearchChange }) {
    const navigation = useNavigation();
    const [isSearching, setIsSearching] = useState(false);
    const animValue = useRef(new Animated.Value(0)).current;

    const toggleSearch = () => {
        if (!isSearching) {
            setIsSearching(true);
            Animated.timing(animValue, {
                toValue: 1,
                duration: 250,
                useNativeDriver: false,
            }).start();
        } else {
            setIsSearching(false);
            Animated.timing(animValue, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }).start();
        }
    };

    const inputWidth = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBack}
            >
                <Ionicons name="chevron-back" size={22} color="#222" />
            </TouchableOpacity>

            {!isSearching ? (
                <Text style={styles.headerTitle}>{title}</Text>
            ) : (
                <Animated.View style={{ flex: 1, width: inputWidth }}>
                    <TextInput
                        autoFocus
                        placeholder="Пошук..."
                        value={searchValue}
                        onChangeText={onSearchChange}
                        style={styles.searchInput}
                    />
                </Animated.View>
            )}

            <TouchableOpacity onPress={toggleSearch} style={styles.headerSearch}>
                <Ionicons name={isSearching ? "close" : "search"} size={22} color="#222" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 34,
        paddingBottom: 10,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerBack: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: "700",
        color: "#0F0F0F",
        textAlign: "center",
    },
    headerSearch: {
        marginLeft: 12,
        padding: 4,
    },
    searchInput: {
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 4,
        paddingHorizontal: 8,
        color: "#0F0F0F",
    },
});
