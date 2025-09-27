import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { addLocalBook } from "../../../shared";

export const pickBook = async () => {
    try {
        const res = await DocumentPicker.getDocumentAsync({
            type: ["application/pdf", "application/epub+zip"], // дозволяємо і PDF, і EPUB
            copyToCacheDirectory: false,
        });

        if (res.canceled || !res.assets?.length) {
            console.log("⛔ Книгу не вибрано або вибір скасовано");
            return null;
        }

        const { name, uri, mimeType } = res.assets[0];
        const newPath = FileSystem.documentDirectory + name;

        await FileSystem.copyAsync({ from: uri, to: newPath });
        console.log("📁 Скопійовано файл:", newPath);

        const base64 = await FileSystem.readAsStringAsync(newPath, {
            encoding: FileSystem.EncodingType.Base64,
        });
        console.log("📦 base64 довжина:", base64.length);

        let format;
        let base64Prefix;

        if (mimeType === "application/epub+zip" || name.toLowerCase().endsWith(".epub")) {
            format = "epub";
            base64Prefix = "data:application/epub+zip;base64,";
        } else {
            format = "pdf";
            base64Prefix = "data:application/pdf;base64,";
        }

        await addLocalBook(
            name,
            newPath,
            format,
            `${base64Prefix}${base64}`
        );

        return {
            title: name,
            path: newPath,
            format,
            base64: `${base64Prefix}${base64}`,
        };
    } catch (error) {
        console.error("📛 Помилка при виборі файлу:", error);
        return null;
    }
};
