import * as FileSystem from 'expo-file-system/legacy';
import { myApi } from '../../../shared';

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function downloadPublicBook(bookId, filename) {
    try {
        const response = await myApi.get(`/books/public/file/${bookId}`, {
            responseType: 'arraybuffer',
        });

        const fileUri = `${FileSystem.documentDirectory}${filename || `book_${bookId}.pdf`}`;

        const base64Data = arrayBufferToBase64(response.data);

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
        });

        console.log('Файл збережено за шляхом:', fileUri);

        return fileUri;
    } catch (error) {
        console.error('Помилка при завантаженні книги:', error);
        throw error;
    }
}
