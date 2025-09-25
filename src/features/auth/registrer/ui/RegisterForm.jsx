import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import { register } from '../api/register';
import { registerSchema } from '../model/RegisterSchema';
import { Button } from '../../../../shared';

export function RegisterForm() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>{t('register.title')}</Text>
                </View>

                <Formik
                    initialValues={{
                        username: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                    }}
                    validationSchema={registerSchema}
                    onSubmit={async (values, { setSubmitting, setErrors }) => {
                        try {
                            await register({
                                login: values.username,
                                email: values.email,
                                password: values.password,
                            });

                            navigation.navigate('LoginScreen');
                        } catch (error) {
                            setErrors({
                                username: error.message || t('register.errorRegister'),
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
                        <View>
                            <View style={styles.form}>
                                {/* Name */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>{t('register.name')}</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            touched.username && errors.username ? styles.inputError : null,
                                        ]}
                                        placeholder={t('register.namePlaceholder')}
                                        onChangeText={handleChange('username')}
                                        onBlur={handleBlur('username')}
                                        value={values.username}
                                    />
                                    {touched.username && errors.username && (
                                        <Text style={styles.errorText}>{errors.username}</Text>
                                    )}
                                </View>

                                {/* Email */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>{t('register.email')}</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            touched.email && errors.email ? styles.inputError : null,
                                        ]}
                                        placeholder={t('register.emailPlaceholder')}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                    />
                                    {touched.email && errors.email && (
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    )}
                                </View>

                                {/* Password */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>{t('register.password')}</Text>
                                    <View style={styles.passwordField}>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                touched.password && errors.password ? styles.inputError : null,
                                            ]}
                                            placeholder={t('register.passwordPlaceholder')}
                                            secureTextEntry={!showPassword}
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            value={values.password}
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

                                {/* Confirm Password */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>{t('register.confirmPassword')}</Text>
                                    <View style={styles.passwordField}>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                touched.confirmPassword && errors.confirmPassword
                                                    ? styles.inputError
                                                    : null,
                                            ]}
                                            placeholder={t('register.confirmPasswordPlaceholder')}
                                            secureTextEntry={!showConfirmPassword}
                                            onChangeText={handleChange('confirmPassword')}
                                            onBlur={handleBlur('confirmPassword')}
                                            value={values.confirmPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.togglePassword}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <Ionicons
                                                name={showConfirmPassword ? 'eye-off' : 'eye'}
                                                size={24}
                                                color="#777"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {touched.confirmPassword && errors.confirmPassword && (
                                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                                    )}
                                </View>

                                {/* Button */}
                                <Button
                                    onClick={handleSubmit}
                                    disabled={
                                        isSubmitting ||
                                        !values.username ||
                                        !values.email ||
                                        !values.password ||
                                        !values.confirmPassword
                                    }
                                    style={[
                                        styles.btn,
                                        styles.btnRegister,
                                        (!values.username ||
                                            !values.email ||
                                            !values.password ||
                                            !values.confirmPassword) &&
                                        styles.btnDisabled,
                                    ]}
                                >
                                    <Text style={styles.btnText}>
                                        {isSubmitting ? t('register.submitting') : t('register.submit')}
                                    </Text>
                                </Button>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>{t('register.divider')}</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Social login */}
                            <View style={styles.socialLogin}>
                                <View style={styles.socialButtons}>
                                    <TouchableOpacity style={styles.socialBtn}>
                                        <Ionicons name="logo-google" size={24} color="#f4424bff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialBtn}>
                                        <Ionicons name="logo-apple" size={24} color="#000000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialBtn}>
                                        <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Redirect */}
                            <View style={styles.loginRedirect}>
                                <Text style={styles.loginText}>{t('register.redirectText')} </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                                    <Text style={styles.loginLink}>{t('register.redirectLink')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </Formik>
            </ScrollView>
    );
}


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
    btn: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnRegister: {
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
        marginVertical: 30,
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
    loginRedirect: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        gap: 10
    },
    loginText: {
        color: '#333',
    },
    loginLink: {
        color: '#2E8B57',
        fontWeight: 'bold',
    },
});