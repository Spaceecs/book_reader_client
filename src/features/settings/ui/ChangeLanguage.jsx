import { View, StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { selectLanguage, setLanguage } from "../../../entities";
import { Picker } from "@react-native-picker/picker";

export function ChangeLanguage() {
    const dispatch = useDispatch();
    const language = useSelector(selectLanguage);

    const languages = [
        { code: "en", label: "English" },
        { code: "ua", label: "Українська" },
        { code: "es", label: "Español" },
        { code: "fr", label: "Français" },
        { code: "de", label: "Deutsch" },
        { code: "zh", label: "中文" },
        { code: "ja", label: "日本語" },
        { code: "ar", label: "العربية" },
        { code: "pt", label: "Português" },
        { code: "hi", label: "हिन्दी" },
    ];

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <Picker
                    selectedValue={language}
                    style={styles.picker}
                    dropdownIconColor="#2E8B57"
                    onValueChange={(lang) => dispatch(setLanguage(lang))}
                >
                    {languages.map((lang) => (
                        <Picker.Item
                            key={lang.code}
                            label={lang.label}
                            value={lang.code}
                            color={lang.code === language ? "#2E8B57" : "#374151"}
                        />
                    ))}
                </Picker>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginRight: 10,
        color: "#2E8B57",
    },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2E8B57",
        height: 56,
        justifyContent: "center",
    },
    picker: {
        height: 56,
        fontSize: 18,
        color: "#2E8B57",
    },
});
