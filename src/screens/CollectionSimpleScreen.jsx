import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { BookCard } from '../entities';
import { getCollections, getCollection } from '../shared/api';
import { getOnlineBooks, getLocalBooks } from '../shared';

// A simple screen to show books for system collections or special lists
// modes: 'saved' | 'postponed' | 'downloaded' | 'audio'
export default function CollectionSimpleScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const mode = route?.params?.mode || 'saved';

  const [title, setTitle] = useState('Колекція');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    if (mode === 'saved') setTitle('Збережені');
    else if (mode === 'postponed') setTitle('Відкладені');
    else if (mode === 'downloaded') setTitle('Завантажені на пристрій');
    else if (mode === 'audio') setTitle('Аудіо книги');
  }, [mode]);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      setLoading(true);
      try {
        if (mode === 'saved' || mode === 'postponed') {
          const list = await getCollections();
          const arr = Array.isArray(list) ? list : [];
          const targetName = mode === 'saved' ? 'Збережені' : 'Відкладені';
          const candidates = arr.filter(c => (c.name || c.title) === targetName);
          // pick the one with most books/count to avoid duplicate-empty collections
          const pick = candidates.sort((a, b) => {
            const ac = Number(a.count != null ? a.count : (Array.isArray(a.books) ? a.books.length : 0)) || 0;
            const bc = Number(b.count != null ? b.count : (Array.isArray(b.books) ? b.books.length : 0)) || 0;
            return bc - ac;
          })[0];
          if (pick?.id) {
            const fromListBooks = Array.isArray(pick.books) ? pick.books : [];
            if (isActive && fromListBooks.length) {
              setBooks(fromListBooks);
            } else {
              const full = await getCollection(pick.id);
              if (isActive) setBooks(Array.isArray(full?.books) ? full.books : []);
            }
          } else {
            if (isActive) setBooks([]);
          }
        } else if (mode === 'audio') {
          const localOnline = await getOnlineBooks();
          const filtered = (Array.isArray(localOnline) ? localOnline : []).filter(b => (b.format || '').toLowerCase() === 'audio');
          if (isActive) setBooks(filtered);
        } else if (mode === 'downloaded') {
          const locals = await getLocalBooks();
          if (isActive) setBooks(Array.isArray(locals) ? locals : []);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };
    load();
    return () => { isActive = false; };
  }, [mode]);

  const visibleBooks = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return books;
    return (books || []).filter(b => (String(b.title || '')).toLowerCase().includes(q) || (String(b.author || '')).toLowerCase().includes(q));
  }, [books, searchQuery]);

  const renderItem = ({ item }) => {
    if (mode === 'downloaded') {
      return (
        <View style={styles.localRow}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.localTitle}>{item.title || 'Без назви'}</Text>
            {!!item.author && <Text numberOfLines={1} style={styles.localSub}>{item.author}</Text>}
          </View>
          <Ionicons name="document-outline" size={18} color="#2E8B57" />
        </View>
      );
    }
    return (
      <BookCard book={item} />
    );
  };

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

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Пошук"
          placeholderTextColor="#9e9e9e"
        />
      </View>

      {mode === 'downloaded' ? (
        <FlatList
          data={visibleBooks}
          keyExtractor={(item, idx) => String(item.id || idx)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 + (insets?.bottom || 0) }}
        />
      ) : (
        <FlatList
          data={visibleBooks}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 + (insets?.bottom || 0), paddingTop: 6 }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading ? (
            <View style={{ padding: 24 }}>
              <Text>Список порожній</Text>
            </View>
          ) : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F0F0F' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f4f4', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12, height: 40, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8 },
  localRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  localTitle: { fontSize: 15, color: '#0F0F0F', fontWeight: '600' },
  localSub: { fontSize: 12, color: '#777', marginTop: 2 },
});


