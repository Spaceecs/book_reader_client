import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import {
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {Formik} from "formik";
import {forgotPasswordSchema} from "../model/forgotPasswordSchema"
import {forgotPassword} from "../api/forgotPassword";

export function ForgotPasswordForm() {
    const navigation = useNavigation();
    const {t} = useTranslation();

    const handleSubmit = async (values, {resetForm}) => {
        try {
            await forgotPassword(values.email);
            console.log("Send reset link to:", values.email);
            resetForm();
            navigation.navigate("ResetPasswordScreen");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={{flexGrow: 1, justifyContent: "center",}}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>{t("forgotPassword.title")}</Text>
                </View>
                <Formik
                    initialValues={{ email: "" }}
                    validationSchema={forgotPasswordSchema}
                    onSubmit={handleSubmit}
                >
                    {({handleChange, handleBlur, handleSubmit, values, errors, touched, isValid}) => (
                        <View style={styles.form}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t("forgotPassword.emailLabel")}</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        touched.email && errors.email ? styles.inputError : null
                                    ]}
                                    placeholder={t("forgotPassword.emailPlaceholder")}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    onChangeText={handleChange("email")}
                                    onBlur={handleBlur("email")}
                                    value={values.email}
                                />
                                {touched.email && errors.email && (
                                    <Text style={styles.errorText}>{errors.email}</Text>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.btn, isValid ? styles.btnSend : styles.btnDisabled]}
                                onPress={handleSubmit}
                                disabled={!isValid}
                            >
                                <Text style={styles.btnText}>{t("forgotPassword.sendBtn")}</Text>
                            </TouchableOpacity>

                            <View style={styles.loginRedirect}>
                                <Text style={styles.loginText}>{t("forgotPassword.rememberText")} </Text>
                                <Text
                                    style={styles.loginLink}
                                    onPress={() => navigation.navigate("LoginScreen")}
                                >
                                    {t("forgotPassword.loginLink")}
                                </Text>
                            </View>
                        </View>
                    )}
                </Formik>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 16,

    },
    header: {
        marginBottom: 32,
        alignItems: "center",
    },
    headerText: {
        fontSize: 28,
        fontWeight: "700",
        color: "#000000",
    },
    form: {
        marginBottom: 32,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontWeight: "600",
        color: "#333",
    },
    input: {
        width: "100%",
        padding: 16,
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: "#ff3860",
    },
    errorText: {
        color: "#ff3860",
        fontSize: 14,
        marginTop: 5,
    },
    btn: {
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    btnSend: {
        backgroundColor: "#2E8B57",
    },
    btnDisabled: {
        backgroundColor: "#b9e9cd",
    },
    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    loginRedirect: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    loginText: {
        color: "#333",
    },
    loginLink: {
        color: "#2E8B57",
        fontWeight: "bold",
    },
});
