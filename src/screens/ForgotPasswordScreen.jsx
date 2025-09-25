import {KeyboardAvoidingView, StyleSheet, Platform} from "react-native";
import {ForgotPasswordForm} from "../features";

export function ForgotPasswordScreen() {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ForgotPasswordForm />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: "white",
    },
});
