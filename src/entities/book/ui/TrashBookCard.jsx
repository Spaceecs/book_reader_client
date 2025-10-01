import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

const deletePng = require('../../../../assets/Delete_Colection.png');

export function TrashBookCard({ item, onRestore, onDeleteForever, renderRightActions }) {
    return (
        <Swipeable
            renderRightActions={(progress, dragX) => renderRightActions(item, progress, dragX)}
            overshootRight={false}
            friction={1.2}
            rightThreshold={40}
        >
            <View style={styles.card}>
                <Image
                    source={{ uri: item.cover }}
                    style={styles.cover}
                    defaultSource={require('../../../../assets/placeholder-cover.png')}
                />
                <View style={styles.info}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        <TouchableOpacity style={styles.restoreBtn} onPress={() => onRestore(item)}>
                            <Ionicons name="refresh" size={14} color="#2E8B57" />
                            <Text style={styles.restoreBtnText}>Відновити</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.author}>{item.author}</Text>
                    <Text style={styles.pageInfo}>Сторінка {item.currentPage} з {item.totalPages}</Text>
                    <View style={styles.progressBarWrapper}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{item.progress}%</Text>
                    </View>
                    <Text style={styles.removedAgo}>Видалено {item.removedAgo}</Text>
                </View>
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        alignItems: 'center',
    },
    cover: {
        width: 60,
        height: 90,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginRight: 16,
    },
    info: { flex: 1 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 16, fontWeight: '700', color: '#000', flex: 1, paddingRight: 12 },
    author: { fontSize: 14, color: '#666', marginTop: 2, marginBottom: 4 },
    pageInfo: { fontSize: 13, color: '#8C8C8C', marginBottom: 2 },
    progressBarWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, marginRight: 8 },
    progressBarFill: { height: '100%', backgroundColor: '#2E8B57', borderRadius: 3 },
    progressText: { fontSize: 12, color: '#2E8B57', fontWeight: '600', minWidth: 32, textAlign: 'right' },
    removedAgo: { fontSize: 12, color: '#8C8C8C' },
    restoreBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2E8B57', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
    restoreBtnText: { color: '#2E8B57', fontSize: 13, fontWeight: '600', marginLeft: 6 },
});
