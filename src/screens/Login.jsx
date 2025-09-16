import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginWidget } from '../widgets';

export function LoginScreen() {
    return (
        <View style={styles.container}>
            <LoginWidget />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
});
