import * as Yup from 'yup';
import i18next from "i18next";

export const registerSchema = Yup.object({
    username: Yup.string()
        .min(6, i18next.t('validation.username.min', { count: 6 }))
        .required(i18next.t('validation.username.required')),

    email: Yup.string()
        .email(i18next.t('validation.email.format'))
        .min(3, i18next.t('validation.email.min', { count: 3 }))
        .required(i18next.t('validation.email.required')),

    password: Yup.string()
        .min(8, i18next.t('validation.password.min', { count: 8 }))
        .matches(/^[A-Za-z0-9]+$/, i18next.t('validation.password.pattern'))
        .required(i18next.t('validation.password.required')),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], i18next.t('validation.confirmPassword.oneOf'))
        .required(i18next.t('validation.confirmPassword.required')),
});