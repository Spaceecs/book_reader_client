import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';

import en from './locales/en.json';
import uk from './locales/uk.json';

const deviceLanguage =
    Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;

const defaultLang = deviceLanguage?.split('_')[0] || 'en';
const supported = ['en', 'uk'];

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: supported.includes(defaultLang) ? defaultLang : 'en',
    fallbackLng: 'en',
    resources: {
        en: { translation: en },
        uk: { translation: uk },
    },
    interpolation: {
        escapeValue: false,
    },
});

export { i18n };