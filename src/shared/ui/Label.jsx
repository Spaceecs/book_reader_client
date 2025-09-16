import React from "react";
import { Text, StyleSheet } from "react-native";

export function Label({ children }) {
    return (
        <Text style={styles.label}>
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    label: {
        fontWeight: "bold",
        fontSize: 24,
        color: "black",
    },
});
