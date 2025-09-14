import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export function OtherButton({ children, onClick, disabled = false }) {
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
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#8fc9b9',
    },
    buttonText: {

        color: '#2E8B57',
        fontSize: 16,
        fontWeight: '600',
    },
    disabled: {
        backgroundColor: "gray",
    }
});
