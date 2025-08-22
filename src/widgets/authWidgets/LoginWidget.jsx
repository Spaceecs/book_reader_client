import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginForm } from '../../features';
import { Label } from '../../shared';

export function LoginWidget() {
    return (
        <View style={styles.container}>
            <Label>Login</Label>
            <LoginForm />
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
