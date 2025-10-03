import { useDispatch, useSelector } from "react-redux";
import { selectLanguage, setLanguage } from "../entities";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    FlatList,
    Switch,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {useTranslation} from "react-i18next";

export function ChangeLanguageScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const language = useSelector(selectLanguage);
    const {t} = useTranslation();

    const languages = [
        { code: "ua", label: "Українська", labelEn: "Ukrainian" },
        { code: "en", label: "Англійська", labelEn: "English" },
        { code: "es", label: "Español", labelEn: "Spanish" },
        { code: "fr", label: "Français", labelEn: "French" },
        { code: "de", label: "Deutsch", labelEn: "German" },
        { code: "zh", label: "中文", labelEn: "Chinese" },
        { code: "ja", label: "日本語", labelEn: "Japanese" },
        { code: "ar", label: "العربية", labelEn: "Arabic" },
        { code: "pt", label: "Português", labelEn: "Portuguese" },
        { code: "hi", label: "हिन्दी", labelEn: "Hindi" },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#0F0F0F" />
                </TouchableOpacity>
                <View style={styles.titleWrap}>
                    <Text style={styles.headerTitle}>{t("settings.language")}</Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            {/* Card */}
            <View style={styles.card}>
                <FlatList
                    data={languages}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                        <View style={styles.switchRowOnly}>
                            <View style={styles.switchRowWrapper}>
                                <Text style={styles.switchTitle}>
                                    {item.labelEn} / {item.label}
                                </Text>
                            </View>
                            <Switch
                                value={language === item.code}
                                onValueChange={() => dispatch(setLanguage(item.code))}
                                trackColor={{ false: "#ccc", true: "#2E8B57" }}
                                thumbColor={language === item.code ? "#2E8B57" : "#f4f3f4"}
                            />
                        </View>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerLeft: { padding: 4 },
    titleWrap: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#0F0F0F" },
    headerRight: { width: 22 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E6E6E6",
        padding: 12,
        marginHorizontal: 16,
        marginTop: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    rowLabel: { color: "#0F0F0F" },
    switchRowWrapper: { flexDirection: "row", alignItems: "center" },
    switchTitle: { color: "#0F0F0F", fontWeight: "600" },
    switchSubtitle: { color: "#8C8C8C", fontSize: 12 },
    switchRowOnly: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    separator: { height: 1, backgroundColor: "#eee" },
});
