import {Text, View, StyleSheet, Image, TouchableOpacity} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {useNavigation} from "@react-navigation/native";
import {openBook} from "../utils/openBook";

export function HomeBookCard({ book }) {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [coverUri, setCoverUri] = useState(book.imageUrl || null);

    useEffect(() => {
        console.log(book);
    }, []);


    return (
        <TouchableOpacity
            style={styles.bookItem}
            onPress={() => openBook(book, dispatch, navigation)}
        >
            <Image
                source={coverUri ? { uri: coverUri } : require('../../../../assets/placeholder-cover.png')}
                style={styles.bookCover}
                onError={() => setCoverUri(null)}
            />
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.rating}>{book.avgRating}</Text>
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
