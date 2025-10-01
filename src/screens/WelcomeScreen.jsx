import { StyleSheet, Dimensions, View, Text, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Button, OtherButton } from "../shared";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [isFirstLaunch, setIsFirstLaunch] = useState(null);

    useEffect(() => {
        const checkFirstLaunch = async () => {
            try {
                const hasLaunched = await SecureStore.getItemAsync("hasLaunched");
                if (hasLaunched) {
                    // якщо вже запускали — одразу перекидаємо на Login
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "LoginScreen" }],
                    });
                } else {
                    // перший запуск → показуємо Welcome
                    setIsFirstLaunch(true);
                }
            } catch (error) {
                console.error("Error reading flag:", error);
            } finally {
                setLoading(false);
            }
        };

        checkFirstLaunch();
    }, []);

    const handleAuthNavigation = async (screen) => {
        await SecureStore.setItemAsync("hasLaunched", "true"); // зберігаємо, що вже заходили
        navigation.reset({
            index: 0,
            routes: [{ name: screen }],
        });
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1 }} />;
    }

    if (!isFirstLaunch) {
        return null; // нічого не малюємо, бо навігація вже відбулась
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/Logo.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.content}>
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>{t('welcomeScreen.welcomeTitle')}</Text>
                    <Text style={styles.welcomeText}>
                        {t('welcomeScreen.welcomeText')}
                    </Text>
                </View>

                <View style={styles.authOptions}>
                    <Button onClick={() => handleAuthNavigation("LoginScreen")}>
                        <Text>{t('welcomeScreen.login')}</Text>
                    </Button>

                    <OtherButton onClick={() => handleAuthNavigation("RegisterScreen")}>
                        <Text>{t('welcomeScreen.register')}</Text>
                    </OtherButton>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: width * 0.9,
        maxWidth: 353,
        height: 340,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    content: {
        width: '100%',
        maxWidth: 353,
        alignItems: 'center',
    },
    welcomeSection: {
        marginBottom: 32,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16,
        color: '#000000',
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    authOptions: {
        width: '100%',
    },
});
