import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { loginSchema } from '../model/LoginSchema';
import { login } from '../api/login';
import {Button, Label, OtherButton} from '../../../shared';
import { useTranslation } from 'react-i18next';

export const LoginForm = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Label style={styles.title}>{t('login.title')}</Label>

            <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                    try {
                        await login({
                            login: values.username,
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
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                    <>
                        <View style={styles.form}>
                            <View>
                                <Text style={styles.label}>{t('login.username')}</Text>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={handleChange('username')}
                                    onBlur={handleBlur('username')}
                                    value={values.username}
                                    placeholder={t('login.enterUsername')}
                                />
                                {touched.username && errors.username && (
                                    <Text style={styles.error}>{errors.username}</Text>
                                )}
                            </View>

                            <View>
                                <Text style={styles.label}>{t('login.password')}</Text>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    value={values.password}
                                    secureTextEntry
                                    placeholder={t('login.enterPassword')}
                                />
                                {touched.password && errors.password && (
                                    <Text style={styles.error}>{errors.password}</Text>
                                )}
                            </View>

                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                <Text style={styles.buttonText}>{t('login.signIn')}</Text>
                            </Button>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('login.noAccount')}</Text>
                            <OtherButton onClick={() => navigation.navigate('RegisterScreen')} disabled={isSubmitting}>
                                <Text style={styles.link}>{t('login.register')}</Text>
                            </OtherButton>
                        </View>
                    </>
                )}
            </Formik>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: 50,
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    form: {
        gap: 20,
    },
    label: {
        marginBottom: 6,
        fontSize: 16,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
    },
    error: {
        color: 'red',
        fontSize: 14,
        marginTop: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#555',
    },
});
