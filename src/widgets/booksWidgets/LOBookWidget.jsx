import {View, Text, Image, TouchableOpacity, StyleSheet, Alert} from "react-native";
import {selectLastBook} from "../../entities";
import {useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import * as FileSystem from "expo-file-system/legacy";
import {useNavigation} from "@react-navigation/native";

export function LOBookWidget() {
    const {t} = useTranslation();
    const book = useSelector(selectLastBook);
    const navigation = useNavigation();

    if (!book) return null;

    const handlePress = async () => {
        if (book.format === 'pdf') {
            if (!book.base64) {
                Alert.alert('⛔ Помилка', 'Цей файл не має збережених даних PDF.');
                return;
            }

            navigation.navigate('PdfReaderScreen', { book: book });
        } else if (book.format === 'epub') {
            const fileInfo = await FileSystem.getInfoAsync(book.path);
            if (!fileInfo.exists) {
                Alert.alert('Файл не знайдено', 'Цей файл більше не існує.');
                return;
            }

            navigation.navigate('EpubReaderScreen', { book: book });
        }
    }

    return (
        <View style={styles.currentReadingSection}>
            {(
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('readMore')}</Text>
                    {(
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>{t('more')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <TouchableOpacity style={styles.currentReadingCard} onPress={() => console.log("Pressed")}>
                <Image
                    source={book.imageUrl ? { uri: book.imageUrl } : require("../../../assets/placeholder-cover.png")}
                    style={styles.currentReadingCover}
                />

                <View style={styles.currentReadingInfo}>
                    <Text style={styles.currentReadingTitle} numberOfLines={2}>
                        {book.title}
                    </Text>
                    <Text style={styles.currentReadingAuthor}>
                        {book.author}
                    </Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            {book.currentPage > 0 && book.totalPages > 0 && (
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(book.currentPage / book.totalPages) * 100}%` },
                                    ]}
                                />
                            )}
                        </View>
                        <Text style={styles.progressText}>{book.progress}%</Text>
                    </View>

                    <Text style={styles.pageInfo}>
                        Сторінка {book.currentPage} з {book.totalPages}
                    </Text>

                    <TouchableOpacity style={styles.continueButton} onPress={handlePress}>
                        <Text style={styles.continueButtonText}>{t("continueReading")}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    currentReadingSection: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    seeAll: {
        fontSize: 14,
        color: '#2E8B57',
        fontWeight: '500',
    },
    currentReadingCard: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    currentReadingCover: {
        width: 80,
        height: 120,
        borderRadius: 8,
        marginRight: 16,
    },
    currentReadingInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    currentReadingTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    currentReadingAuthor: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginRight: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#2E8B57',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#2E8B57',
        fontWeight: '600',
    },
    pageInfo: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    continueButton: {
        backgroundColor: '#2E8B57',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
})