import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { downloadPublicBook } from "../api/downloadPublicBook";
import { addOnlineBook, getOnlineBooksByOnlineId } from "../../../shared";
import { setLastBook } from "../model/BooksSlice";

export async function openBook(book, dispatch, navigation) {
    try {
        const localOnlineBook = await getOnlineBooksByOnlineId(book.id);

        let newLocalOnlineBook = null

        if (!localOnlineBook) {
            const filePath = await downloadPublicBook(book.id, book.title);

            const base64 = await FileSystem.readAsStringAsync(filePath, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await addOnlineBook(
                book.id,
                book.title,
                filePath,
                book.format,
                base64,
                book.imageUrl
            );

            newLocalOnlineBook = await getOnlineBooksByOnlineId(book.id);

            if (!newLocalOnlineBook) {
                Alert.alert("⛔ Помилка", "Не вдалося зберегти книгу у локальній базі.");
                return;
            }
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
            const fileInfo = await FileSystem.getInfoAsync(newLocalOnlineBook.path);
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
