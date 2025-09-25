import {KeyboardAvoidingView, Platform, StyleSheet} from "react-native";
import {ResetPasswordForm} from "../features";

export function ResetPasswordScreen() {
    return(
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ResetPasswordForm/>
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
