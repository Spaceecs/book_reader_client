import React from 'react';
import {StyleSheet, Platform, KeyboardAvoidingView} from 'react-native';
import {RegisterForm} from "../features";

export function RegisterScreen() {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <RegisterForm />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
});
