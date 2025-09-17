import {Text, TouchableOpacity, View, StyleSheet} from "react-native";
import {selectLanguage, setLanguage} from "../../../entities";
import {useDispatch, useSelector} from "react-redux";

export function ChangeLanguage() {
    const dispatch = useDispatch();
    const language = useSelector(selectLanguage);
    const languages = ['en', 'ua'];

    return (
        <View style={styles.container}>
            {languages.map((lang) => (
                <TouchableOpacity
                    key={lang}
                    onPress={() => dispatch(setLanguage(lang))}
                    style={[
                        styles.button,
                        language === lang && styles.activeButton
                    ]}
                >
                    <Text style={[styles.text, language === lang && styles.activeText]}>
                        {lang.toUpperCase()}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 25,
        padding: 4,
        alignSelf: 'flex-start',
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    activeButton: {
        backgroundColor: '#2E8B57',
    },
    text: {
        color: '#374151',
        fontWeight: '500',
    },
    activeText: {
        color: 'white',
    },
});