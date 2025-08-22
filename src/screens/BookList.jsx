import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import { useAuthRefresh } from "../shared";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { BookCard, getAllBooks, getMe, selectId } from "../entities";

export function BookListScreen() {
    const [books, setBooks] = useState([]);
    useAuthRefresh();
    const { t } = useTranslation();
    const dispatch = useDispatch();

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
            <ScrollView>
                {books.length === 0 && <Text>Книги не знайдені</Text>}
                {books.map((book) => (
                    <View key={book.id} style={styles.row}>
                        <BookCard book={book} />
                    </View>
                ))}
            </ScrollView>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    row: {
        marginBottom: 10,
        width: '100%',
    }
});
