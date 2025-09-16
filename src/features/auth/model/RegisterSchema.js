import * as Yup from 'yup';

export const registerSchema = Yup.object({
    username: Yup.string()
        .min(6, 'Імʼя повинно містити мінімум 6 символи')
        .required("Імʼя обовʼязкове"),

    password: Yup.string()
        .min(8, 'Пароль повинен містити мінімум 8 символів')
        .matches(/^[A-Za-z0-9]+$/, 'Пароль має містити лише латинські літери та цифри, без спецсимволів')
        .required('Пароль обовʼязковий'),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Паролі не збігаються')
        .required('Підтвердження паролю обовʼязкове'),
});
