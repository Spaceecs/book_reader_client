import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import {getLocalBookById} from "../../../shared/db/database";

export async function openLocalBook(id, book, dispatch, navigation) {

    const newBook = await getLocalBookById(id)

    console.log(newBook)

    try {
        if (newBook != null && newBook.format === "pdf") {
            if (!newBook.base64) {
                Alert.alert("⛔ Помилка", "Цей файл не має збережених даних PDF.");
                return;
            }
            navigation.navigate("PdfReaderScreen", { book: newBook });
        }

        // 5️⃣ Відкриття EPUB
        else if (newBook != null && newBook.format === "epub") {
            const fileInfo = await FileSystem.getInfoAsync(newBook.filePath);
            if (!fileInfo.exists) {
                Alert.alert("Файл не знайдено", "Цей файл більше не існує.");
                return;
            }
            navigation.navigate("EpubReaderScreen", { book: newBook });
        }
    } catch (error) {
        console.error("❌ openBook error:", error);
        Alert.alert("Помилка", "Не вдалося відкрити книгу.");
    }
}
