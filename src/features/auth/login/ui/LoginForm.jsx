import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import { loginSchema } from '../model/LoginSchema';
import { login } from '../api/login';
import { Button, Label } from '../../../../shared';

export const LoginForm = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    return (

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Label style={styles.headerText}>{t('login.title')}</Label>
                </View>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={loginSchema}
                    onSubmit={async (values, { setSubmitting, setErrors }) => {
                        try {
                            await login({
                                email: values.email,
                                password: values.password,
                            });

                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'DrawerRoot' }],
                            });
                        } catch (error) {
                            setErrors({
                                password: error.message || t('login.error'),
                            });
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                      {({
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          values,
                          errors,
                          touched,
                          isSubmitting,
                      }) => (
                          <>
                              <View style={styles.form}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            touched.email && errors.email ? styles.inputError : null,
                                        ]}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                        placeholder={t('login.enterEmail')}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    {touched.email && errors.email && (
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    )}
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>{t('login.password')}</Text>
                                    <View style={styles.passwordField}>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                touched.password && errors.password
                                                    ? styles.inputError
                                                    : null,
                                            ]}
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            value={values.password}
                                            secureTextEntry={!showPassword}
                                            placeholder={t('login.enterPassword')}
                                        />
                                        <TouchableOpacity
                                            style={styles.togglePassword}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-off' : 'eye'}
                                                size={24}
                                                color="#777"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {touched.password && errors.password && (
                                        <Text style={styles.errorText}>{errors.password}</Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.forgotPassword}
                                    onPress={() => navigation.navigate('ForgotPasswordScreen')}
                                >
                                    <Text style={styles.forgotPasswordText}>
                                        {t('login.forgotPassword')}
                                    </Text>
                                </TouchableOpacity>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !values.email || !values.password}
                                    style={[
                                        styles.btn,
                                        styles.btnLogin,
                                        (!values.email || !values.password) && styles.btnDisabled,
                                    ]}
                                >
                                    <Text style={styles.btnText}>{t('login.signIn')}</Text>
                                </Button>
                            </View>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>{t('login.or')}</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.socialLogin}>
                                <View style={styles.socialButtons}>
                                    <TouchableOpacity style={[styles.socialBtn, styles.googleBtn]}>
                                        <Ionicons name="logo-google" size={24} color="#f4424bff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.socialBtn, styles.appleBtn]}>
                                        <Ionicons name="logo-apple" size={24} color="#000000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.socialBtn}
                                    >
                                        <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.registerRedirect}>
                                <Text style={styles.registerText}>{t('login.noAccount')}</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('RegisterScreen')}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.registerLink}>{t('login.register')}</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </Formik>
            </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000000',
    },
    form: {
        marginBottom: 32,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: 16,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#ff3860',
    },
    errorText: {
        color: '#ff3860',
        fontSize: 14,
        marginTop: 5,
    },
    passwordField: {
        position: 'relative',
    },
    togglePassword: {
        position: 'absolute',
        right: 12,
        top: '50%',
        marginTop: -12,
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginTop: -10,
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#2E8B57',
        fontSize: 14,
    },
    btn: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnLogin: {
        backgroundColor: '#2E8B57',
    },
    btnDisabled: {
        backgroundColor: '#b9e9cd',
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        paddingHorizontal: 15,
        color: '#777',
        fontSize: 14,
    },
    socialLogin: {
        marginBottom: 30,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    socialBtn: {
        width: 90,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerRedirect: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    registerText: {
        color: '#333',
    },
    registerLink: {
        color: '#2E8B57',
        fontWeight: 'bold',
    },
});