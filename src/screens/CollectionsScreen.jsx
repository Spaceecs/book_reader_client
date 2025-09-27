import {View, StyleSheet} from "react-native";
import {SecondHeader} from "../shared";
import {useTranslation} from "react-i18next";

export function CollectionsScreen() {
    const {t} = useTranslation();
    return (
        <View style={styles.container}>
            <SecondHeader title={t("drawerMenu.Collections")}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
})