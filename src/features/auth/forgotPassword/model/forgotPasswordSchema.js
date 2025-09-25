import * as Yup from 'yup';
import i18next from "i18next";

export const forgotPasswordSchema = Yup.object({
    email: Yup.string()
        .email(i18next.t('validation.email.format'))
        .min(3, i18next.t('validation.email.min', { count: 3 }))
        .required(i18next.t('validation.email.required')),
})