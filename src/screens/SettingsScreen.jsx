import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Button, Label, MainHeader} from '../shared';
import {logout, selectLogin} from '../entities';
import {View, StyleSheet} from "react-native";
import {ChangeLanguage} from "../features";
import {useTranslation} from "react-i18next";

export default function SettingsScreen() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const user = useSelector(selectLogin);

    const handleLogout = () => {
        logout(dispatch, navigation);
    };

    return (
        <View style={styles.container}>
            <MainHeader />
            <Label>{user}</Label>
            <Button onClick={handleLogout}>{t('settings.logout')}</Button>
            <View style={styles.language}>
                <Label>English</Label>
                <ChangeLanguage/>
                <Label>Ukraine</Label>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    language: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'flex-start',
        gap: 15,
    }
})