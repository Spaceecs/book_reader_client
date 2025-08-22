import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export function Button({ children, onClick, disabled = false }) {
    return (
        <TouchableOpacity onPress={onClick} disabled={disabled}>
            <View style={[styles.buttonContainer, disabled && styles.disabled]}>
                <Text style={styles.buttonText}>{children}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        backgroundColor: "blue",
        borderRadius: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    disabled: {
        backgroundColor: "gray",
    }
});
