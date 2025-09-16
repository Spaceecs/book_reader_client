import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Label } from '../../shared';
import { RegisterForm } from '../../features';

export function RegisterWidget() {
    return (
        <View style={styles.container}>
            <Label>Register</Label>
            <RegisterForm />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
});
