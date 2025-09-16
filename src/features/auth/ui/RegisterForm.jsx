import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';

import { register } from '../api/register';
import { registerSchema } from '../model/RegisterSchema';
import {Button, OtherButton} from '../../../shared';

export function RegisterForm() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Реєстрація</Text>

            <Formik
                initialValues={{ username: '', password: '', confirmPassword: '' }}
                validationSchema={registerSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                    try {
                        await register({
                            login: values.username,
                            password: values.password,
                        });

                        navigation.navigate('LoginScreen');
                    } catch (error) {
                        setErrors({
                            username: error.message || 'Помилка реєстрації',
                        });
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text>Імʼя</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={handleChange('username')}
                                onBlur={handleBlur('username')}
                                value={values.username}
                            />
                            {touched.username && errors.username && (
                                <Text style={styles.error}>{errors.username}</Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text>Пароль</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                value={values.password}
                            />
                            {touched.password && errors.password && (
                                <Text style={styles.error}>{errors.password}</Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text>Підтвердження паролю</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                onChangeText={handleChange('confirmPassword')}
                                onBlur={handleBlur('confirmPassword')}
                                value={values.confirmPassword}
                            />
                            {touched.confirmPassword && errors.confirmPassword && (
                                <Text style={styles.error}>{errors.confirmPassword}</Text>
                            )}
                        </View>

                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Зачекай...' : 'Зареєструватися'}
                        </Button>
                    </View>
                )}
            </Formik>

            <View style={styles.bottom}>
                <Text style={{ marginBottom: 8 }}>Уже зареєстровані?</Text>
                <OtherButton onClick={() => navigation.navigate('LoginScreen')}>
                    Увійти
                </OtherButton>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    form: {
        gap: 12,
    },
    inputGroup: {
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        padding: 10,
        marginTop: 4,
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
    bottom: {
        marginTop: 24,
        alignItems: 'center',
    },
});
