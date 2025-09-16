import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import {selectLastBook} from "../../entities";
import {useSelector} from "react-redux";

export function LOBookWidget() {
    const book = useSelector(selectLastBook);

    if (!book) return null;

    return (
        <View style={styles.currentReadingSection}>
            {(
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Читати далі</Text>
                    {(
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Більше</Text>
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
                            {book.progress != null && (
                                <View style={[styles.progressFill, { width: `${book.progress}%` }]} />
                            )}
                        </View>
                        <Text style={styles.progressText}>{book.progress}%</Text>
                    </View>

                    <Text style={styles.pageInfo}>
                        Сторінка {book.currentPage} з {book.totalPages}
                    </Text>

                    <TouchableOpacity style={styles.continueButton} onPress={() => console.log("Continue")}>
                        <Text style={styles.continueButtonText}>Продовжити читання</Text>
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