import * as Yup from 'yup';

export const loginSchema = Yup.object({
    username: Yup.string()
        .min(3, 'Імʼя повинно містити мінімум 3 символи')
        .required("Імʼя обовʼязкове"),

    password: Yup.string()
        .min(8, 'Пароль повинен містити мінімум 8 символів')
        .matches(/^[A-Za-z0-9]+$/, 'Пароль має містити лише латинські літери та цифри, без спецсимволів')
        .required('Пароль обовʼязковий'),
});