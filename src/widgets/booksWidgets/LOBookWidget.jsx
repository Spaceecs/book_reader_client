import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useSelector } from "react-redux";
import { selectLastBook } from "../../entities";
import { useTranslation } from "react-i18next";
import * as FileSystem from "expo-file-system/legacy";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { getOnlineBookById } from "../../shared";

export function LOBookWidget() {
    const { t } = useTranslation();
    const savedBook = useSelector(selectLastBook);
    const navigation = useNavigation();
    const [last, setLast] = useState(null);

    useEffect(() => {
        const fetchBook = async () => {
            if (!savedBook?.id) return;
            try {
                const book = await getOnlineBookById(savedBook.id);
                setLast(book);
            } catch (e) {
                console.error("Failed to fetch book:", e);
            }
        };
        fetchBook();
    }, [savedBook]);

    if (!last) return null;

    const handlePress = async () => {
        try {
            if (last.format === 'pdf') {
                if (!last.base64) {
                    Alert.alert('⛔ Помилка', 'Цей файл не має збережених даних PDF.');
                    return;
                }
                navigation.navigate('PdfReaderScreen', { book: last });
            } else if (last.format === 'epub') {
                const fileInfo = await FileSystem.getInfoAsync(last.filePath);
                if (!fileInfo.exists) {
                    Alert.alert('Файл не знайдено', 'Цей файл більше не існує.');
                    return;
                }
                navigation.navigate('EpubReaderScreen', { book: last });
            }
        } catch (e) {
            console.error("Error opening book:", e);
        }
    };

    const handleSeeAllPress = () => {
        navigation.navigate("ReadMore");
    };

    const progressPercent = last.totalPages > 0
        ? (last.currentPage / last.totalPages) * 100
        : 0;

    return (
        <View style={styles.currentReadingSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('readMore')}</Text>
                <TouchableOpacity onPress={handleSeeAllPress}>
                    <Text style={styles.seeAll}>{t('more')}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.currentReadingCard} onPress={handlePress}>
                <Image
                    source={last.imageUrl ? { uri: last.imageUrl } : require("../../../assets/placeholder-cover.png")}
                    style={styles.currentReadingCover}
                />

                <View style={styles.currentReadingInfo}>
                    <Text style={styles.currentReadingTitle} numberOfLines={2}>
                        {last.title}
                    </Text>
                    <Text style={styles.currentReadingAuthor}>
                        {last.author || 'Unknown'}
                    </Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            {progressPercent > 0 && (
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${progressPercent}%` },
                                    ]}
                                />
                            )}
                        </View>
                        <Text style={styles.progressText}>{Math.round(progressPercent)}%</Text>
                    </View>

                    <Text style={styles.pageInfo}>
                        Сторінка {last.currentPage} з {last.totalPages}
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
});
