import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { resetPasswordSchema } from "../model/resetPasswordSchema";

export function ResetPasswordForm() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (values, { resetForm }) => {
        console.log("New password:", values.password);
        resetForm();
        navigation.navigate("LoginScreen");
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Back button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backArrow}>{"\u2039"}</Text>
                <Text style={styles.backButtonText}>{t("resetPassword.backBtn")}</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>{t("resetPassword.title")}</Text>
                </View>

                <Text style={styles.subtitle}>{t("resetPassword.subtitle")}</Text>

                {/* Formik Form */}
                <Formik
                    initialValues={{ password: "", confirmPassword: "" }}
                    validationSchema={resetPasswordSchema}
                    onSubmit={handleSubmit}
                >
                    {({
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          values,
                          errors,
                          touched,
                          isValid,
                      }) => (
                        <View style={styles.form}>
                            {/* Password field */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t("resetPassword.passwordLabel")}</Text>
                                <View style={styles.passwordField}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            touched.password && errors.password
                                                ? styles.inputError
                                                : null,
                                        ]}
                                        placeholder={t("resetPassword.passwordPlaceholder")}
                                        value={values.password}
                                        onChangeText={handleChange("password")}
                                        onBlur={handleBlur("password")}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.togglePassword}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off" : "eye"}
                                            size={24}
                                            color="#777"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {touched.password && errors.password && (
                                    <Text style={styles.errorText}>{errors.password}</Text>
                                )}
                            </View>

                            {/* Confirm password field */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    {t("resetPassword.confirmPasswordLabel")}
                                </Text>
                                <View style={styles.passwordField}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            touched.confirmPassword && errors.confirmPassword
                                                ? styles.inputError
                                                : null,
                                        ]}
                                        placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                                        value={values.confirmPassword}
                                        onChangeText={handleChange("confirmPassword")}
                                        onBlur={handleBlur("confirmPassword")}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.togglePassword}
                                        onPress={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off" : "eye"}
                                            size={24}
                                            color="#777"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <Text style={styles.errorText}>
                                        {errors.confirmPassword}
                                    </Text>
                                )}
                            </View>

                            {/* Submit button */}
                            <TouchableOpacity
                                style={[
                                    styles.btn,
                                    styles.btnReset,
                                    !isValid && styles.btnDisabled,
                                ]}
                                onPress={handleSubmit}
                                disabled={!isValid}
                            >
                                <Text style={styles.btnText}>{t("resetPassword.submitBtn")}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Formik>
            </View>
        </ScrollView>
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
        paddingTop: 20,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
    },
    backArrow: {
        fontSize: 28,
        color: "#000",
        lineHeight: 100,
        marginRight: 10,
    },
    backButtonText: {
        color: "#000",
        fontSize: 18,
    },
    content: {
        marginTop: 10,
    },
    header: {
        marginBottom: 16,
        alignItems: "center",
    },
    headerText: {
        fontSize: 40,
        fontWeight: "700",
        textAlign: "center",
        color: "#000000",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
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
    passwordField: {
        position: "relative",
    },
    togglePassword: {
        position: "absolute",
        right: 12,
        top: "50%",
        marginTop: -12,
    },
    btn: {
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    btnReset: {
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
});
