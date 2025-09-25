import React from 'react';
import {StyleSheet, Platform, KeyboardAvoidingView} from 'react-native';
import {LoginForm} from "../features";

export function LoginScreen() {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LoginForm />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: "white",
    },
});
