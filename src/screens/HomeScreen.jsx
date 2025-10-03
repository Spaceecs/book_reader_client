import {
    ScrollView,
    View,
    ActivityIndicator,
    StyleSheet,
    Text,
    Dimensions,
    StatusBar,
    Modal,
    TouchableOpacity
} from "react-native";
import React, {useCallback, useEffect, useState} from "react";
import { useDispatch } from "react-redux";
import { BookListWidget, LOBookWidget, DynamicBooksSection } from "../widgets";
import { Ionicons } from '@expo/vector-icons';
import { getCollections, addBookToCollection, removeBookFromCollection, createCollection } from '../shared/api';
import { getHomePageBooks, getMe } from "../entities";
import {MainHeader} from "../shared";
import {useFocusEffect, useNavigation} from "@react-navigation/native";

export function HomeScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [books, setBooks] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActionsVisible, setIsActionsVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isCollectionsModalVisible, setIsCollectionsModalVisible] = useState(false);
    const [collections, setCollections] = useState([]);

    const getServerBookId = (item) => {
        if (!item) return null;
        const prefer = item?.onlineId ?? item?.id ?? item?.bookId ?? item?.book?.id;
        const n = Number(prefer);
        if (Number.isFinite(n) && n > 0) return n;
        if (typeof item?.onlineId === 'string') {
            const m = item.onlineId.match(/\d+/);
            if (m) {
                const v = Number(m[0]);
                if (Number.isFinite(v) && v > 0) return v;
            }
        }
        return null;
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await getMe(dispatch);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        fetchUser();
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchBooks = async () => {
                try {
                    const response = await getHomePageBooks();
                    if (isActive) setBooks(response);
                } catch (error) {
                    console.error("Failed to fetch books:", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchBooks();

            return () => {
                isActive = false;
            };
        }, [])
    );


    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    if (!books) {
        return (
            <View style={styles.loaderContainer}>
                <StatusBar barStyle="dark-content" />
                <MainHeader />
                <Text>Не вдалося завантажити книги 😢</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <MainHeader />
            <ScrollView>
                <LOBookWidget />
                <BookListWidget books={books.latest} sectionHeader={'novelty'} setSelectedItem={setSelectedItem} setIsActionsVisible={setIsActionsVisible} />
                <BookListWidget books={books.topRated} sectionHeader={'topRated'} setSelectedItem={setSelectedItem} setIsActionsVisible={setIsActionsVisible} />
                <DynamicBooksSection titleKey={'publicBooks'} params={{ limit: 12 }} />
            </ScrollView>

            {/* Actions modal minimal (add to collections) */}
            <Modal visible={isActionsVisible} transparent animationType="fade" onRequestClose={() => setIsActionsVisible(false)}>
                <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' }}>
                    <TouchableOpacity style={{ flex:1 }} onPress={() => setIsActionsVisible(false)} />
                    <View style={{ backgroundColor:'#fff', borderTopLeftRadius:16, borderTopRightRadius:16, paddingBottom: 16 }}>
                        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:12 }}>
                            <Text style={{ fontSize:16, fontWeight:'700' }}>{selectedItem?.title || 'Книга'}</Text>
                            <TouchableOpacity onPress={() => setIsActionsVisible(false)}><Ionicons name="close" size={20} color="#222" /></TouchableOpacity>
                        </View>
                        <TouchableOpacity style={{ paddingHorizontal:16, paddingVertical:12, borderTopWidth:1, borderTopColor:'#eee' }} onPress={async () => {
                            try{
                                const list = await getCollections();
                                const arr = Array.isArray(list)?list:[];
                                setCollections(arr);
                                setIsCollectionsModalVisible(true);
                            }catch(_){ setIsCollectionsModalVisible(true);} }}>
                            <Text style={{ fontSize:15, fontWeight:'600', color:'#0F0F0F' }}>Додати до колекції</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Collections choose modal */}
            {isCollectionsModalVisible && (
                <Modal visible transparent animationType="slide" onRequestClose={() => setIsCollectionsModalVisible(false)}>
                    <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' }}>
                        <TouchableOpacity style={{ flex:1 }} onPress={() => setIsCollectionsModalVisible(false)} />
                        <View style={{ backgroundColor:'#fff', borderTopLeftRadius:16, borderTopRightRadius:16, paddingBottom: 16 }}>
                            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:12 }}>
                                <TouchableOpacity onPress={() => setIsCollectionsModalVisible(false)}>
                                    <Ionicons name="chevron-back" size={22} color="#222" />
                                </TouchableOpacity>
                                <Text style={{ fontSize:16, fontWeight:'700', color:'#222' }}>Додати до колекції</Text>
                                <View style={{ width:24 }} />
                            </View>
                            <View style={{ paddingHorizontal:16, paddingBottom:24, maxHeight:'60%' }}>
                                {[{ key: 'audio', label: 'Аудіо книги' }, { key: 'downloaded', label: 'Завантажені на пристрій' }].map(row => (
                                    <View key={row.key} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#eee', opacity:0.6 }}>
                                        <Text style={{ fontSize:14, color:'#666' }}>{row.label}</Text>
                                        <Ionicons name="information-circle-outline" size={20} color="#999" />
                                    </View>
                                ))}
                                {/* System collections (always visible) */}
                                {(() => {
                                    const targetBookId = getServerBookId(selectedItem);
                                    const saved = (collections||[]).find(c => (c.name || c.title) === 'Збережені');
                                    const postponed = (collections||[]).find(c => (c.name || c.title) === 'Відкладені');
                                    const sysRows = [
                                        { key: 'saved', label: 'Збережені', col: saved },
                                        { key: 'postponed', label: 'Відкладені', col: postponed },
                                    ];
                                    return sysRows.map(({ key, label, col }) => {
                                        const isIn = !!(targetBookId && col && Array.isArray(col.books) && col.books.some(b => Number(b?.id) === targetBookId));
                                        return (
                                            <TouchableOpacity
                                                key={`sys-${key}`}
                                                style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#eee', ...(isIn ? { backgroundColor:'#e6f5ef' } : {}) }}
                                                onPress={async () => {
                                                    try{
                                                        if (!targetBookId) return;
                                                        let collectionId = col?.id;
                                                        if (!collectionId) {
                                                            try { const created = await createCollection(label); collectionId = created?.id; } catch(_) {}
                                                        }
                                                        if (!collectionId) return;
                                                        setCollections(prev => {
                                                            const exists = prev.some(c => c.id === collectionId);
                                                            const baseCol = exists ? prev.find(c => c.id === collectionId) : { id: collectionId, name: label, books: [] };
                                                            const nextCol = {
                                                                ...baseCol,
                                                                books: isIn
                                                                    ? (Array.isArray(baseCol.books) ? baseCol.books.filter(b => Number(b?.id) !== targetBookId) : [])
                                                                    : [ ...(Array.isArray(baseCol.books) ? baseCol.books : []), { id: targetBookId } ],
                                                            };
                                                            const without = prev.filter(c => c.id !== collectionId);
                                                            return [nextCol, ...without];
                                                        });
                                                        if (isIn) await removeBookFromCollection(collectionId, targetBookId);
                                                        else await addBookToCollection(collectionId, targetBookId);
                                                        const list = await getCollections(); setCollections(Array.isArray(list)?list:[]);
                                                    }catch(_){ }
                                                }}
                                                activeOpacity={0.85}
                                            >
                                                <Text style={{ fontSize:14, color: isIn ? '#0E7A4A' : '#222', fontWeight: isIn ? '700' : '400' }}>{label}</Text>
                                                <Ionicons name={isIn ? 'checkbox' : 'square-outline'} size={20} color={isIn ? '#2E8B57' : '#666'} />
                                            </TouchableOpacity>
                                        );
                                    });
                                })()}
                                {(collections||[]).map(c => {
                                    const targetBookIdRaw = selectedItem?.onlineId ?? selectedItem?.id;
                                    const targetBookId = Number(targetBookIdRaw);
                                    const isIn = Array.isArray(c.books) ? c.books.some(b => Number(b?.id) === targetBookId) : false;
                                    if ((c.name || c.title) === 'Збережені' || (c.name || c.title) === 'Відкладені') return null;
                                    return (
                                        <TouchableOpacity
                                            key={String(c.id)}
                                            style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#eee', ...(isIn ? { backgroundColor:'#e6f5ef' } : {}) }}
                                            onPress={async () => {
                                                try{
                                                    if (!targetBookId) return;
                                                    // optimistic update
                                                    setCollections(prev => prev.map(col => col.id === c.id
                                                        ? {
                                                            ...col,
                                                            books: isIn
                                                                ? (Array.isArray(col.books) ? col.books.filter(b => Number(b?.id) !== targetBookId) : [])
                                                                : [ ...(Array.isArray(col.books) ? col.books : []), { id: targetBookId } ],
                                                        }
                                                        : col
                                                    ));
                                                    if (isIn) await removeBookFromCollection(c.id, targetBookId);
                                                    else await addBookToCollection(c.id, targetBookId);
                                                    const list = await getCollections(); setCollections(Array.isArray(list)?list:[]);
                                                }catch(_){ }
                                            }}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={{ fontSize:14, color: isIn ? '#0E7A4A' : '#222', fontWeight: isIn ? '700' : '400' }}>{c.name || c.title || 'Без назви'}</Text>
                                            <Ionicons name={isIn ? 'checkbox' : 'square-outline'} size={20} color={isIn ? '#2E8B57' : '#666'} />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );

}

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
    loaderContainer: {
        height: height,
        width: width,
        justifyContent: "center",
        alignItems: "center",
    },
});