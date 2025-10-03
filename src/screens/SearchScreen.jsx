import { FlatList, View } from "react-native";
import { useEffect, useState } from "react";
import { getAllBooks, BookCard } from "../entities";
import { SecondHeader } from "../shared";
import {useTranslation} from "react-i18next";

export function SearchScreen({ route }) {
    const {t} = useTranslation();
    const param = route.params;
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState(param.searchQuery || ""); // локальний стан пошуку

    const fetchBooks = async () => {
        try {
            const response = await getAllBooks({ searchQuery: search });
            setBooks(response.books);
        } catch (error) {
            console.error("Не вдалося завантажити книги:", error);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [search]); // тепер реагує на зміну пошукового тексту

    return (
        <View style={{ flex: 1 }}>
            <SecondHeader
                title={t("header")}
                searchValue={search}
                onSearchChange={setSearch}
            />
            <FlatList
                data={books}
                numColumns={2}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <BookCard book={item} />}
                contentContainerStyle={{
                    paddingHorizontal: 16, // відступи від країв
                    paddingVertical: 12,
                }}
                columnWrapperStyle={{
                    justifyContent: "space-between", // рівномірно між стовпцями
                    marginBottom: 16, // відстань між рядками
                }}
            />
        </View>
    );
}
