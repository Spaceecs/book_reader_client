import {ScrollView, View, ActivityIndicator, StyleSheet, Text, Dimensions} from "react-native";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BookListWidget, LOBookWidget, DynamicBooksSection } from "../widgets";
import { getHomePageBooks, getMe } from "../entities";
import {MainHeader} from "../shared";
import {useNavigation} from "@react-navigation/native";

export function HomeScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [books, setBooks] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await getMe(dispatch);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        fetchUser();
    }, [dispatch]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await getHomePageBooks();
                setBooks(response);
            } catch (error) {
                console.error("Failed to fetch books:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    if (!books) {
        return (
            <View style={styles.loaderContainer}>
                <MainHeader />
                <Text>Не вдалося завантажити книги 😢</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <MainHeader />
            <ScrollView>
                <LOBookWidget />
                <BookListWidget books={books.latest} sectionHeader={'novelty'} />
                <BookListWidget books={books.topRated} sectionHeader={'topRated'} />
                <DynamicBooksSection titleKey={'publicBooks'} params={{ limit: 12 }} />
            </ScrollView>
        </View>
    );

}

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
    loaderContainer: {
        height: height,
        width: width,
        justifyContent: "center",
        alignItems: "center",
    },
});