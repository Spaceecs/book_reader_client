import {FlatList, Text, View} from "react-native";
import {useEffect, useState} from "react";
import {BookCard, getAllBooks} from "../entities";

export function SearchScreen({route}) {
    const param = route.params;

    const [books, setBooks] = useState(null);

    console.log(param)

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await getAllBooks(param);
                setBooks(response.books);
                console.log(response);
            } catch (error) {
                console.error("Не вдалося завантажити книги:", error);
            }
        };
        fetchBooks();
    }, [param]);

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text>Результати пошуку: {param.title}</Text>
            <FlatList
                data={books}
                numColumns={2}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <BookCard book={item} />
                )}

            />
        </View>
    )
}