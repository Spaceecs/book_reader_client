import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';

import en from './locales/en.json';
import ua from './locales/ua.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import hi from './locales/hi.json';

const deviceLanguage =
    Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;

const defaultLang = deviceLanguage?.split('_')[0] || 'en';
const supported = ['en', 'ua', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'pt', 'hi'];

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: supported.includes(defaultLang) ? defaultLang : 'en',
    fallbackLng: 'en',
    resources: {
        en: { translation: en },
        ua: { translation: ua },
        es: { translation: es },
        fr: { translation: fr },
        de: { translation: de },
        zh: { translation: zh },
        ja: { translation: ja },
        ar: { translation: ar },
        pt: { translation: pt },
        hi: { translation: hi },
    },
    interpolation: {
        escapeValue: false,
    },
});

export { i18n };
