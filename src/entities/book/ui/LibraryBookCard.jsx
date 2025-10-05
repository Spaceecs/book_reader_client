import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

export function LibraryBookCard({ book, readingProgressMap, onLongPress, onPress }) {
    const { t } = useTranslation();

    const backendId = Number(book?.onlineId ?? book?.id);
    const serverProgress = readingProgressMap?.[backendId] ?? (book?.onlineId != null ? readingProgressMap?.[Number(book.onlineId)] : undefined) ?? (book?.id != null ? readingProgressMap?.[Number(book.id)] : undefined);
    const hasLocal = Number(book?.totalPages) > 0;
    const localProgress = hasLocal ? (Number(book?.currentPage) || 0) / Math.max(1, Number(book?.totalPages)) : undefined;
    const progress = Math.max(0, Math.min(1, Number((hasLocal ? localProgress : serverProgress) ?? serverProgress ?? 0)));
    const isRead = progress >= 1;
    const isReading = progress > 0 && progress < 1;

    const percentText = `${Math.round(progress * 100)}%`;
    const statusLabel = isRead ? t('libraryScreen.bookCard.read') : isReading ? t('libraryScreen.bookCard.reading') : '';
    const statusColor = isRead ? '#008655' : isReading ? '#FFB743' : '#9e9e9e';
    const statusBg = isRead ? '#0086554D' : isReading ? '#FFB7434D' : '#eeeeee';

    const getPlaceholder = () => {
        if (book?.filePath?.endsWith('.pdf')) return require('../../../../assets/pdf_placeholder.png');
        if (book?.filePath?.endsWith('.epub')) return require('../../../../assets/epub_placeholder.png');
        return require('../../../../assets/placeholder-cover.png');
    };

    const isPlaceholder = !book?.imageUrl;

    return (
        <View style={styles.card}>
            <TouchableOpacity activeOpacity={0.88} onPress={onPress} delayLongPress={350} onLongPress={onLongPress}>
                <Image
                    source={isPlaceholder ? getPlaceholder() : { uri: book.imageUrl }}
                    style={[styles.cover, isPlaceholder && { resizeMode: 'contain', padding: 16 }]}
                />
                <Text style={styles.title} numberOfLines={2}>{book?.title || t('libraryScreen.bookCard.no_title')}</Text>
                {!!book?.author && <Text style={styles.author} numberOfLines={1}>{book.author}</Text>}

                <View style={styles.progressRow}>
                    <View style={{ flexDirection:'row', alignItems:'center' }}>
                        <Image source={require('../../../../assets/Book.png')} style={[styles.progressIcon, { tintColor: '#8C8C8C' }]} />
                        <Text style={[styles.percent]}>{percentText}</Text>
                    </View>
                    {!!statusLabel && (
                        <View style={[styles.badge, { backgroundColor: statusBg, alignSelf:'flex-end' }]}>
                            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 16 * 2 - 12) / 2;

const styles = StyleSheet.create({
    card: {
        width: cardWidth,
        backgroundColor: '#fff',
    },
    cover: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        marginBottom: 8,
    },
    title: { fontSize: 13, fontWeight: '700', color: '#0F0F0F' },
    author: { fontSize: 12, color: '#666', marginTop: 2, marginBottom: 6 },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, justifyContent:'space-between' },
    progressIcon: { width: 16, height: 16, marginRight: 6, tintColor: '#9e9e9e', resizeMode: 'contain' },
    percent: { fontSize: 12, marginRight: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    progressBarBg: { height: 4, borderRadius: 2, backgroundColor: '#e6e6e6', overflow: 'hidden' },
    progressBarFill: { height: 4, backgroundColor: '#0F0F0F' },
});
