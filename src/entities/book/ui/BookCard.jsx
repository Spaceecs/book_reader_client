import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLastBook } from "../model/BooksSlice";

export function BookCard({ book }) {
    const dispatch = useDispatch();

    useEffect(() => {
        console.log(book);
    }, []);

    const handlePress = () => {
        dispatch(setLastBook(book));
    };

    return (
        <TouchableOpacity
            style={styles.bookItem}
            onPress={handlePress}
        >
            <Image
                source={book.imageUrl ? { uri: book.imageUrl } : require('../../../../assets/placeholder-cover.png')}
                style={styles.bookCover}
            />
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.rating}>{book.rating}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    bookCover: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        marginBottom: 8,
    },
    bookItem: {
        width: 160,
        marginRight: 16,
    },
    bookInfo: {
        paddingHorizontal: 4,
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
        lineHeight: 18,
    },
    bookAuthor: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
});
