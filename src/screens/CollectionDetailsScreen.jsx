import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { BookCard } from '../entities';
import { getCollection } from '../shared/api';
import { getCollections, addBookToCollection, removeBookFromCollection } from '../shared/api';
import { useFocusEffect } from '@react-navigation/native';

export default function CollectionDetailsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initial = route?.params?.collection || {};
  const collectionId = route?.params?.collectionId ?? initial?.id;

  const [title, setTitle] = React.useState(initial?.name || initial?.title || 'Колекція');
  const [books, setBooks] = React.useState(Array.isArray(initial?.books) ? initial.books : []);
  const [loading, setLoading] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [isActionsVisible, setIsActionsVisible] = React.useState(false);
  const [isCollectionsModalVisible, setIsCollectionsModalVisible] = React.useState(false);
  const [collections, setCollections] = React.useState([]);

  const load = React.useCallback(async () => {
    if (!collectionId) return;
    setLoading(true);
    try {
      const full = await getCollection(collectionId);
      const fetchedBooks = Array.isArray(full?.books) ? full.books : [];
      setTitle(full?.name || full?.title || title);
      setBooks(fetchedBooks);
      // fallback: if empty, try via collections list (bypass any cache issues)
      if (!fetchedBooks.length) {
        try {
          const list = await getCollections();
          const fromList = (Array.isArray(list) ? list : []).find(c => Number(c?.id) === Number(collectionId));
          if (fromList && Array.isArray(fromList.books) && fromList.books.length) {
            setBooks(fromList.books);
          }
        } catch(_) {}
      }
    } finally {
      setLoading(false);
    }
  }, [collectionId, title]);

  useFocusEffect(React.useCallback(() => {
    load();
  }, [load]));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 6 : 12 }] }>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F0F0F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 + (insets?.bottom || 0), paddingTop: 6 }}
        renderItem={({ item }) => (
          <BookCard book={item} setSelectedItem={setSelectedItem} setIsActionsVisible={setIsActionsVisible} />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? (
          <View style={{ padding: 24 }}>
            <Text>Список порожній</Text>
          </View>
        ) : null}
      />

      {/* Actions modal (long-press card) */}
      <Modal visible={isActionsVisible} transparent animationType="fade" onRequestClose={() => setIsActionsVisible(false)}>
        <View style={styles.actionsOverlay}>
          <TouchableOpacity style={styles.actionsBackdrop} activeOpacity={1} onPress={() => setIsActionsVisible(false)} />
          {selectedItem && (
            <View style={styles.actionsContainer}>
              <View style={styles.actionsHeaderRow}>
                <Text style={styles.actionsTitle} numberOfLines={1}>{selectedItem.title}</Text>
              </View>
              <View style={styles.actionsList}>
                {[ 
                  { key: 'read', label: 'Читати', onPress: () => { setIsActionsVisible(false); } },
                  { key: 'collections', label: 'Колекції', onPress: async () => {
                      try {
                        setIsActionsVisible(false);
                        const list = await getCollections();
                        setCollections(Array.isArray(list) ? list : []);
                        setIsCollectionsModalVisible(true);
                      } catch(_) { setIsCollectionsModalVisible(true); }
                    } },
                ].map((row, idx, arr) => (
                  <TouchableOpacity key={row.key} style={[styles.actionRow, idx === arr.length - 1 && styles.actionRowLast]} onPress={row.onPress}>
                    <Text style={styles.actionText}>{row.label}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#222" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Collections choose modal */}
      {isCollectionsModalVisible && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setIsCollectionsModalVisible(false)}>
          <View style={styles.sheetOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsCollectionsModalVisible(false)} />
            <View style={[styles.sheetContainer, { paddingBottom: 20 + (insets?.bottom || 0) }] }>
              <View style={styles.sheetHeaderRow}>
                <TouchableOpacity onPress={() => setIsCollectionsModalVisible(false)}>
                  <Ionicons name="chevron-back" size={22} color="#222" />
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>Додати до колекції</Text>
                <View style={{ width: 24 }} />
              </View>
              <View style={{ paddingHorizontal: 16, paddingBottom: 24, maxHeight: '60%' }}>
                {(collections || []).map(c => {
                  const targetBookId = Number(selectedItem?.onlineId ?? selectedItem?.id);
                  const isIn = Array.isArray(c.books) ? c.books.some(b => Number(b?.id) === targetBookId) : false;
                  return (
                    <TouchableOpacity key={String(c.id)} style={styles.selectRow} onPress={async () => {
                      try {
                        if (!targetBookId) return;
                        if (isIn) { await removeBookFromCollection(c.id, targetBookId); }
                        else { await addBookToCollection(c.id, targetBookId); }
                        const list = await getCollections();
                        setCollections(Array.isArray(list) ? list : []);
                      } catch(_) {}
                    }}>
                      <Text style={styles.selectText}>{c.name || c.title || 'Без назви'}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F0F0F' },
  // actions modal minimal
  actionsOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  actionsBackdrop: { ...StyleSheet.absoluteFillObject },
  actionsContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 12, width: '86%', maxWidth: 360 },
  actionsHeaderRow: { alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  actionsTitle: { fontSize: 16, fontWeight: '700', color: '#0F0F0F' },
  actionsList: { paddingTop: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  actionRowLast: { borderBottomWidth: 0 },
  actionText: { fontSize: 15, color: '#0F0F0F', fontWeight: '600' },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 20 },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  selectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee', paddingHorizontal: 16 },
  selectText: { fontSize: 14, color: '#222' },
});


