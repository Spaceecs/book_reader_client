import {Text, View, StyleSheet, Image, TouchableOpacity, Alert} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLastBook } from "../model/BooksSlice";
import {downloadPublicBook} from "../api/downloadPublicBook";
import {useNavigation} from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy"
import {addOnlineBook, getOnlineBookByOnlineId} from "../../../shared";

export function HomeBookCard({ book }) {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    useEffect(() => {
        console.log(book);
    }, []);

    const handlePress = async () => {

        console.log("1");
        const filePath = await downloadPublicBook(book.id, book.title);
        console.log("2");
        const base64 = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.Base64,
        });
        console.log("3");
        await addOnlineBook(book.id, book.title, filePath, book.format, base64, book.imageUrl);
        console.log("4");
        const localOnlineBook = await getOnlineBookByOnlineId(book.id)
        dispatch(setLastBook(localOnlineBook));
        console.log("5");
        if (localOnlineBook.format === 'pdf') {
            if (!localOnlineBook.base64) {
                Alert.alert('⛔ Помилка', 'Цей файл не має збережених даних PDF.');
                return;
            }

            navigation.navigate('PdfReaderScreen', { book: localOnlineBook });
        } else if (localOnlineBook.format === 'epub') {
            const fileInfo = await FileSystem.getInfoAsync(localOnlineBook.path);
            if (!fileInfo.exists) {
                Alert.alert('Файл не знайдено', 'Цей файл більше не існує.');
                return;
            }

            navigation.navigate('EpubReaderScreen', { book: localOnlineBook });
        }
        console.log("6");
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
