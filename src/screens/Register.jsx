import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RegisterWidget } from '../widgets';

export function RegisterScreen() {
    return (
        <View style={styles.container}>
            <RegisterWidget />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
});
