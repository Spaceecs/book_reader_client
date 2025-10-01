import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { downloadPublicBook } from "../api/downloadPublicBook";
import {addOnlineBook, getOnlineBookById, getOnlineBooksByOnlineId} from "../../../shared";
import { setLastBook } from "../model/BooksSlice";

export async function openOnlineBook(id, book, dispatch, navigation) {
    try {

        console.log("book.id", book.id);
        console.log("book.name", book.title);
        console.log("book.author", book.author);
        const localOnlineBook = await getOnlineBooksByOnlineId(id);

        let newLocalOnlineBook

        if (!localOnlineBook) {
            const filePath = await downloadPublicBook(book.id, book.title);
            console.log("Path: ",filePath);
            const base64 = await FileSystem.readAsStringAsync(filePath, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await addOnlineBook(
                book.id,
                book.title,
                filePath,
                book.format,
                base64,
                book.imageUrl,
                book.author,
            );

            newLocalOnlineBook = await getOnlineBooksByOnlineId(book.id);

            if (!newLocalOnlineBook) {
                Alert.alert("⛔ Помилка", "Не вдалося зберегти книгу у локальній базі.");
                return;
            }
        } else {
            newLocalOnlineBook = localOnlineBook
        }

        dispatch(setLastBook(newLocalOnlineBook));

        if (newLocalOnlineBook != null && newLocalOnlineBook.format === "pdf") {
            if (!newLocalOnlineBook.base64) {
                Alert.alert("⛔ Помилка", "Цей файл не має збережених даних PDF.");
                return;
            }
            navigation.navigate("PdfReaderScreen", { book: newLocalOnlineBook });
        }

        // 5️⃣ Відкриття EPUB
        else if (newLocalOnlineBook != null && newLocalOnlineBook.format === "epub") {
            const fileInfo = await FileSystem.getInfoAsync(newLocalOnlineBook.filePath);
            if (!fileInfo.exists) {
                Alert.alert("Файл не знайдено", "Цей файл більше не існує.");
                return;
            }
            navigation.navigate("EpubReaderScreen", { book: newLocalOnlineBook });
        }
    } catch (error) {
        console.error("❌ openBook error:", error);
        Alert.alert("Помилка", "Не вдалося відкрити книгу.");
    }
}
