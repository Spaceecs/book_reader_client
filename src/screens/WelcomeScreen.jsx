import {StyleSheet, Dimensions, View, TouchableOpacity, Text, Image} from 'react-native';
import {useNavigation} from "@react-navigation/native";

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const navigation = useNavigation();
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
                    <Text style={styles.welcomeTitle}>Ласкаво просимо!</Text>
                    <Text style={styles.welcomeText}>
                        Вітаємо у спільноті свідомих книголюбів!{"\n"}
                        Разом ми зробимо читання приємною звичкою, допоможемо тобі відкривати
                        нові світи та завжди мати улюблені книги під рукою.
                    </Text>
                </View>

                <View style={styles.authOptions}>
                    <TouchableOpacity
                        style={[styles.btn, styles.btnLogin]}
                        onPress={() => navigation.navigate('LoginScreen')}
                    >
                        <Text style={styles.btnText}>Вхід</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, styles.btnRegister]}
                        onPress={() => navigation.navigate('RegisterScreen')}
                    >
                        <Text style={[styles.btnText, styles.btnRegisterText]}>Реєстрація</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
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
    btn: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnLogin: {
        backgroundColor: '#2E8B57',
    },
    btnRegister: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#8fc9b9',
    },
    btnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    btnRegisterText: {
        color: '#2E8B57',
    },
});