import * as FileSystem from "expo-file-system/legacy";
import { myApi } from "../../../shared";

// перетворює ArrayBuffer → base64
function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// очищує ім’я файлу від заборонених символів
function sanitizeFileName(name) {
    return name.replace(/[^a-z0-9_\-\.]/gi, "_");
}

export async function downloadPublicBook(bookId, filename, format = "pdf") {
    try {
        const response = await myApi.get(`/books/public/file/${bookId}`, {
            responseType: "arraybuffer",
        });

        // безпечне ім’я файлу
        const safeName = sanitizeFileName(filename || `book_${bookId}`);
        const fileUri = `${FileSystem.documentDirectory}${safeName}.${format}`;

        const base64Data = arrayBufferToBase64(response.data);

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
        });

        console.log("✅ Файл збережено за шляхом:", fileUri);

        return fileUri;
    } catch (error) {
        console.error("❌ Помилка при завантаженні книги:", error);
        throw error;
    }
}
