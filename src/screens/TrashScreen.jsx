import React, { useCallback, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrashBookCard } from "../entities";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import {
    deleteLocalBook,
    deleteOnlineBook,
    getLocalBooks,
    getOnlineBooks,
    markIsDeletedLocalBook,
    markIsDeletedOnlineBook
} from "../shared";

const deletePng = require('../../assets/Delete_Colection.png');
const emptyPng = require('../../assets/Corzina.png');

export default function TrashScreen({ navigation }) {
    const { t } = useTranslation();

    const [books, setBooks] = useState([]);
    const [toast, setToast] = useState({ visible: false, text: '', mode: 'success' });
    const toastOpacity = useRef(new Animated.Value(0)).current;
    const toastProgress = useRef(new Animated.Value(0)).current;
    const [toastTrackWidth, setToastTrackWidth] = useState(0);

    // ==== Функція для вибірки тільки видалених книг ====
    const filterDeletedBooks = (booksArray) => {
        return (booksArray || []).filter(b => b.isDeleted === 1 || b.isDeleted === true);
    };

    // ==== Функція для оновлення списку кошика ====
    const fetchDeletedBooks = async () => {
        try {
            let onlineBooks = filterDeletedBooks(await getOnlineBooks());
            let localBooks = filterDeletedBooks(await getLocalBooks());
            setBooks([...onlineBooks, ...localBooks]);
        } catch (e) {
            console.error(t('trash.fetchError'), e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            if (isActive) fetchDeletedBooks();
            return () => { isActive = false; };
        }, [])
    );

    // ==== Toast ====
    const showToast = (text, mode = 'success') => {
        setToast({ visible: true, text, mode });
        const trackWidth = toastTrackWidth || 260;
        toastOpacity.setValue(0);
        toastProgress.setValue(trackWidth);
        Animated.timing(toastOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
        Animated.timing(toastProgress, { toValue: 0, duration: 2000, easing: Easing.linear, useNativeDriver: false }).start(() => {
            Animated.timing(toastOpacity, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
                setToast({ visible: false, text: '', mode });
            });
        });
    };

    // ==== Відновлення книги ====
    const restoreItem = async (item) => {
        try {
            if (item.onlineId) {
                await markIsDeletedOnlineBook(item.id, 0);
            } else {
                await markIsDeletedLocalBook(item.id, 0);
            }
            await fetchDeletedBooks();
            showToast(t('trash.restored', { title: item.title }), 'success');
        } catch (error) {
            console.error(error);
        }
    };

    // ==== Видалення книги назавжди ====
    const deleteForever = async (item) => {
        try {
            if (item.onlineId) {
                await deleteOnlineBook(item.id);
            } else {
                await deleteLocalBook(item.id);
            }
            await fetchDeletedBooks();
            showToast(t('trash.deletedForever', { title: item.title }), 'danger');
        } catch (e) {
            console.error(e);
        }
    };

    // ==== Очистити все ====
    const clearAll = async () => {
        try {
            for (const book of books) {
                if (book.onlineId) {
                    await deleteOnlineBook(book.id);
                } else {
                    await deleteLocalBook(book.id);
                }
            }
            await fetchDeletedBooks();
        } catch (e) {
            console.error(t('trash.clearAllError'), e);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.openDrawer?.()} style={styles.backButton}>
                    <Ionicons name="menu" size={22} color="#0F0F0F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('trash.title')}</Text>
                <TouchableOpacity onPress={clearAll} style={styles.headerRight}>
                    <Image source={require('../../assets/trash.png')} style={{ width: 20, height: 20, tintColor: '#0F0F0F', resizeMode: 'contain' }} />
                </TouchableOpacity>
            </View>

            <Text style={styles.autoCleanText}>{t('trash.autoClean')}</Text>

            {books.length === 0 ? (
                <View style={styles.emptyWrapper}>
                    <Image source={emptyPng} style={styles.emptyImage} />
                    <Text style={styles.emptyTitle}>{t('trash.emptyTitle')}</Text>
                    <Text style={styles.emptySubtitle}>{t('trash.emptySubtitle')}</Text>
                </View>
            ) : (
                <FlatList
                    data={books}
                    renderItem={({ item }) => <TrashBookCard
                        item={item}
                        onRestore={restoreItem}
                        onDeleteForever={deleteForever}
                    />}
                    keyExtractor={(item, index) => `${item.id ?? item.onlineId}-${index}`}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {toast.visible && (
                <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
                    <View style={styles.toastProgressTrack} onLayout={(e) => setToastTrackWidth(e.nativeEvent.layout.width)} />
                    <Animated.View style={[styles.toastProgressFill, { width: toastProgress, backgroundColor: toast.mode === 'danger' ? '#e11d48' : '#2E8B57' }]} />
                    <Text style={styles.toastText}>{toast.text}</Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingTop: 40, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff'
    },
    backButton: { position: 'absolute', left: 16, padding: 4 },
    headerRight: { position: 'absolute', right: 16, padding: 4 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#0F0F0F' },
    autoCleanText: { color: '#8C8C8C', fontSize: 13, paddingHorizontal: 16, marginBottom: 8 },

    listContent: { paddingHorizontal: 16, paddingBottom: 80 },
    card: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
        borderWidth: 1, borderColor: '#f0f0f0', alignItems: 'center'
    },
    cover: { width: 60, height: 90, borderRadius: 8, backgroundColor: '#f5f5f5', marginRight: 16 },
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

    emptyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
    emptyImage: { width: '80%', height: undefined, aspectRatio: 986 / 768, tintColor: '#d6d6d6' },
    emptyTitle: { marginTop: 12, fontSize: 22, fontWeight: '700', color: '#0F0F0F' },
    emptySubtitle: { marginTop: 4, fontSize: 14, color: '#8C8C8C' },

    toast: {
        position: 'absolute', left: 16, right: 16, bottom: 24, backgroundColor: '#fff', borderRadius: 12,
        paddingVertical: 16, paddingHorizontal: 16, borderTopWidth: 0, shadowColor: '#000', shadowOpacity: 0.15,
        shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5, overflow: 'hidden',
    },
    toastText: { color: '#0F0F0F', textAlign: 'left' },
    toastProgressTrack: { position: 'absolute', left: 0, right: 0, top: 0, height: 3, backgroundColor: '#eaeaea' },
    toastProgressFill: { position: 'absolute', left: 0, top: 0, height: 3, backgroundColor: '#2E8B57' },
});
