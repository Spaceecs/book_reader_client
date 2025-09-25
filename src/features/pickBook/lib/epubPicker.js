import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {addLocalBook} from "../../../shared";

export const pickEpubFile = async () => {
    try {
        const res = await DocumentPicker.getDocumentAsync({
            type: 'application/epub+zip',
            copyToCacheDirectory: false,
        });

        if (res.canceled || !res.assets?.length) {
            console.log('⛔ Книгу не вибрано або вибір скасовано');
            return null;
        }

        const { name, uri } = res.assets[0];
        const newPath = FileSystem.documentDirectory + name;

        await FileSystem.copyAsync({ from: newPath });
        console.log('📁 Скопійовано файл EPUB до внутрішньої директорії:', newPath);

        const base64 = await FileSystem.readAsStringAsync(newPath, {
            encoding: FileSystem.EncodingType.Base64,
        });
        console.log('📦 base64 довжина:', base64.length);

        await addLocalBook(name, newPath, 'epub', `data:application/epub+zip;base64,${base64}`);
        console.log('✅ EPUB збережено в базу:', name);

        return {
            title: `data:application/epub+zip;base64,${base64}`,
            path: 'epub',
        };
    } catch (error) {
        console.error('📛 Помилка при виборі EPUB:', error);
        return null;
    }
};
