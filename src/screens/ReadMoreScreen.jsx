import {FlatList, StyleSheet, View} from "react-native";
import {getLocalBooks, getOnlineBooks, SecondHeader} from "../shared";
import {useTranslation} from "react-i18next";
import {useFocusEffect} from "@react-navigation/native";
import {useCallback, useState} from "react";
import {ReadMoreCard} from "../entities";

export function ReadMoreScreen() {
    const {t} = useTranslation();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchBooks = async () => {
                try {
                    const onlineBooks = await getOnlineBooks();
                    const localBooks = await getLocalBooks();

                    const combined = [...(onlineBooks || []), ...(localBooks || [])];

                    if (isActive) setBooks(combined);
                } catch (e) {
                    console.error('Не вдалося завантажити книги:', e);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchBooks();

            return () => { isActive = false; };
        }, [])
    );
    return (
        <View style={styles.container}>
            <SecondHeader title={t("drawerMenu.readMore")}/>
            <FlatList
                data={books}
                keyExtractor={(item) => `${item.onlineId ? 'online' : 'local'}-${item.id}`}
                renderItem={({ item }) => (<ReadMoreCard book={item} />)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
})