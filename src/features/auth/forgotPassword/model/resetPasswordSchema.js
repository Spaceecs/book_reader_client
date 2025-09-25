import * as Yup from 'yup';

export const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(6, "Пароль має містити принаймні 6 символів")
        .required("Введіть пароль"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Паролі не співпадають")
        .required("Підтвердіть пароль"),
});