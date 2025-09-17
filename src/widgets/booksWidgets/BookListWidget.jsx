import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import { useAuthRefresh } from "../../shared";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { BookCard, getAllBooks, getMe, selectId } from "../../entities";
import {useNavigation} from "@react-navigation/native";

export function BookListWidget() {
    const [books, setBooks] = useState([]);
    useAuthRefresh();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const id = useSelector(selectId);

    useEffect(() => {
        if (id) {
            getMe(dispatch);
        }
    }, [id]);

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const response = await getAllBooks();
                setBooks(response.books || []);
            } catch (error) {
                console.error('Помилка при отриманні книг:', error);
            }
        };

        loadBooks();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('novelty')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Category', { title: 'Новинки' })}>
                    <Text style={styles.seeAll}>{t('more')}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={books}
                renderItem={({ item }) => (
                    <BookCard book={item} />
                )}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalBooksContainer}
            />
        </View>

    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    seeAll: {
        fontSize: 14,
        color: '#2E8B57',
        fontWeight: '500',
    },
    horizontalBooksContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});
