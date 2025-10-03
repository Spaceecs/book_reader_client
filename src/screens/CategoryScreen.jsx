import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookCard, getAllBooks, rateBook } from '../entities';
import { SecondHeader } from '../shared';
import { Ionicons } from '@expo/vector-icons';

export function CategoryScreen({ route, navigation }) {
  const { t } = useTranslation();
  const params = route?.params || {};
  const [books, setBooks] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isRateVisible, setIsRateVisible] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [isSortVisible, setIsSortVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortByKey, setSortByKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  const [rating, setRating] = useState(0);
  const [bookFormats, setBookFormats] = useState([]);
  const [docFormats, setDocFormats] = useState([]);

  const title = useMemo(() => {
    if (params.titleKey) return t(params.titleKey);
    if (params.title) return params.title;
    return t('publicBooks');
  }, [params.titleKey, params.title, t]);

    const filteredBooks = useMemo(() => {
        if (!searchText) return books;
        const lower = searchText.toLowerCase();
        return books.filter(b =>
            (b.title?.toLowerCase().includes(lower)) ||
            (b.author?.toLowerCase().includes(lower))
        );
    }, [books, searchText]);

    useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mapFormats = (arr) => {
          const out = [];
          (arr || []).forEach(f => {
            if (f === 'CBR/CBZ') { out.push('cbr', 'cbz'); }
            else if (typeof f === 'string') { out.push(f.toLowerCase()); }
          });
          return out;
        };
        const res = await getAllBooks({
          ...params,
          limit: 40,
          sortBy: sortByKey,
          sortOrder: sortDir,
          minRating: rating || undefined,
          languages: selectedLanguages,
          formats: mapFormats(docFormats),
          publishers: selectedPublishers,
        });
        if (!mounted) return;
        setBooks(res?.books || []);
      } catch (e) {
        if (!mounted) return;
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [JSON.stringify(params), sortByKey, sortDir, rating, selectedLanguages.join(','), selectedPublishers.join(','), docFormats.join(','), bookFormats.join(',')]);

  // accept updates from nested pickers
  useEffect(() => {
    if (route?.params?.languages) setSelectedLanguages(route.params.languages);
    if (route?.params?.publishers) setSelectedPublishers(route.params.publishers);
  }, [route?.params?.languages, route?.params?.publishers]);

  const toggleItem = (list, setList, value) => {
    setList(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
        <SecondHeader
            title={title}
            searchValue={searchText}
            onSearchChange={setSearchText}
        />
        <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionPill, styles.actionPillSort]} activeOpacity={0.85} onPress={() => setIsSortVisible(true)}>
          <Ionicons name="swap-vertical-outline" size={18} color="#222" />
          <Text style={styles.actionPillText}>Сортування</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionPill, styles.actionPillFilter]} activeOpacity={0.85} onPress={() => setIsFilterVisible(true)}>
          <Ionicons name="funnel-outline" size={18} color="#222" />
          <Text style={styles.actionPillText}>Фільтр</Text>
        </TouchableOpacity>
      </View>
        <FlatList
            data={filteredBooks}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
                <BookCard book={item} setSelectedItem={setSelectedItem} setIsActionsVisible={setIsRateVisible} />
            )}
            ListEmptyComponent={!loading ? (
                <View style={{ padding: 24 }}>
                    <Text>{t('libraryScreen.emptyList')}</Text>
                </View>
            ) : null}
        />

        {/* Rate modal (bottom sheet) */}
      <Modal visible={isRateVisible} transparent animationType="slide" onRequestClose={() => setIsRateVisible(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsRateVisible(false)} />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeaderRow}>
              <TouchableOpacity onPress={() => setIsRateVisible(false)}>
                <Ionicons name="chevron-back" size={22} color="#222" />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Оцінити книгу</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={{ paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F0F0F', marginBottom: 12 }} numberOfLines={1}>{selectedItem?.title || 'Книга'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                {[1,2,3,4,5].map(v => (
                  <TouchableOpacity key={v} onPress={() => setTempRating(v)} style={{ padding: 6 }}>
                    <Ionicons name={tempRating >= v ? 'star' : 'star-outline'} size={28} color={tempRating >= v ? '#FFCC66' : '#999'} />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={async () => {
                  try{
                    const bid = Number(selectedItem?.id ?? selectedItem?.onlineId);
                    if (!bid || !tempRating) return;
                    await rateBook(bid, tempRating);
                    // refetch list to update avgRating filters
                    setLoading(true);
                    const mapFormats = (arr) => {
                      const out = [];
                      (arr || []).forEach(f => {
                        if (f === 'CBR/CBZ') { out.push('cbr', 'cbz'); }
                        else if (typeof f === 'string') { out.push(f.toLowerCase()); }
                      });
                      return out;
                    };
                    const res = await getAllBooks({
                      ...params,
                      limit: 40,
                      sortBy: sortByKey,
                      sortOrder: sortDir,
                      minRating: rating || undefined,
                      languages: selectedLanguages,
                      formats: mapFormats(docFormats),
                      publishers: selectedPublishers,
                    });
                    setBooks(res?.books || []);
                  }catch(_){ }
                  finally {
                    setIsRateVisible(false);
                    setTempRating(0);
                    setLoading(false);
                  }
                }}
                style={{ backgroundColor:'#2E8B57', paddingVertical:12, paddingHorizontal:24, borderRadius: 24 }}
                activeOpacity={0.9}
              >
                <Text style={{ color:'#fff', fontWeight:'700' }}>Зберегти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort bottom sheet */}
      <Modal visible={isSortVisible} transparent animationType="slide" onRequestClose={() => setIsSortVisible(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsSortVisible(false)} />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeaderRow}>
              <TouchableOpacity onPress={() => setIsSortVisible(false)}>
                <Ionicons name="chevron-back" size={22} color="#222" />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Сортування</Text>
              <TouchableOpacity onPress={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}>
                <Ionicons name={sortDir === 'asc' ? 'arrow-up' : 'arrow-down'} size={20} color="#2E8B57" />
              </TouchableOpacity>
            </View>
            {[
              { key: 'title', label: 'Назва книги (за алфавітом)' },
              { key: 'author', label: 'Автор (за алфавітом)' },
              { key: 'createdAt', label: 'За новизною' },
              { key: 'avgRating', label: 'За популярністю' },
            ].map(opt => (
              <TouchableOpacity key={opt.key} style={styles.selectRow} onPress={() => { setSortByKey(opt.key); setIsSortVisible(false); }}>
                <Text style={styles.selectText}>{opt.label}</Text>
                <Ionicons name={sortByKey === opt.key ? 'radio-button-on' : 'radio-button-off'} size={20} color={sortByKey === opt.key ? '#2E8B57' : '#666'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Filter bottom sheet */}
      <Modal visible={isFilterVisible} transparent animationType="slide" onRequestClose={() => setIsFilterVisible(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsFilterVisible(false)} />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeaderRow}>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="chevron-back" size={22} color="#222" />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Фільтр</Text>
              <TouchableOpacity onPress={() => {
                setSelectedLanguages([]);
                setSelectedPublishers([]);
                setBookFormats([]);
                setDocFormats([]);
                setRating(0);
                try { navigation.setParams({ languages: [], publishers: [] }); } catch(_) {}
              }}>
                <Text style={styles.clearText}>Очистити</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              {/* Формат книги */}
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Формат книги</Text>
                <View style={styles.chipsRow}>
                  {['eBook', 'Аудіокниги'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.chip, bookFormats.includes(opt) && styles.chipActive]}
                      onPress={() => toggleItem(bookFormats, setBookFormats, opt)}
                    >
                      <Text style={[styles.chipText, bookFormats.includes(opt) && styles.chipTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Формат документа */}
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Формат документа</Text>
                <View style={styles.chipsRow}>
                  {['PDF', 'EPUB', 'DJVU', 'CBR/CBZ'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.chip, docFormats.includes(opt) && styles.chipActive]}
                      onPress={() => toggleItem(docFormats, setDocFormats, opt)}
                    >
                      <Text style={[styles.chipText, docFormats.includes(opt) && styles.chipTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Рейтинг */}
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Рейтинг</Text>
                <View style={styles.ratingBlocksRow}>
                  {[1,2,3,4,5].map(starCount => {
                    const isActive = starCount === rating;
                    const blockStyle = styles[`ratingBlock${starCount}`];
                    return (
                      <TouchableOpacity key={starCount} onPress={() => setRating(isActive ? 0 : starCount)} style={[blockStyle, isActive && styles.ratingBlockActive]}>
                        {Array.from({ length: starCount }).map((_, idx) => (
                          <Ionicons key={idx} name="star" size={16} color={isActive ? '#F1F1F1' : '#FFCC66'} style={styles.starIcon} />
                        ))}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Мова */}
              <TouchableOpacity style={[styles.rowItem, { width: '100%' }]} onPress={() => { setIsFilterVisible(false); navigation.navigate('FilterLanguage', { selected: selectedLanguages }); }}>
                <Text style={styles.rowItemText}>Мова</Text>
                <Text numberOfLines={1} style={{ flex: 1, textAlign: 'right', color: '#999', marginRight: 8 }}>
                  {selectedLanguages.length ? selectedLanguages.join(', ') : '—'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>

              {/* Видавництво */}
              <TouchableOpacity style={[styles.rowItem, { width: '100%' }]} onPress={() => { setIsFilterVisible(false); navigation.navigate('FilterPublisher', { selected: selectedPublishers }); }}>
                <Text style={styles.rowItemText}>Видавництво</Text>
                <Text numberOfLines={1} style={{ flex: 1, textAlign: 'right', color: '#999', marginRight: 8 }}>
                  {selectedPublishers.length ? selectedPublishers.join(', ') : '—'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BCBCBC',
    opacity: 0.8,
  },
  actionPillSort: {
    width: 171,
    paddingHorizontal: 24,
  },
  actionPillFilter: {
    width: 170,
    paddingHorizontal: 8,
  },
  actionPillText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '85%'
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#0F0F0F' },
  clearText: { color: '#008655', fontWeight: '600' },
  rowItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12,
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E6E6E6', marginHorizontal: 0, marginTop: 10
  },
  rowItemText: { fontSize: 16, color: '#0F0F0F', fontWeight: '700' },
  selectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee', paddingHorizontal: 16 },
  selectText: { fontSize: 14, color: '#222' },
  // filter blocks
  block: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    padding: 12,
    marginTop: 10,
  },
  blockTitle: { fontSize: 16, fontWeight: '700', color: '#0F0F0F', marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#EFEFEF',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: '#008655', borderColor: '#008655' },
  chipText: { color: '#0F0F0F', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#F1F1F1', fontWeight: '700' },
  ratingBlocksRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  ratingBlock1: { alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: 'transparent' },
  ratingBlock2: { alignItems: 'center', justifyContent: 'center', width: 50, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: 'transparent', flexDirection: 'row' },
  ratingBlock3: { alignItems: 'center', justifyContent: 'center', width: 60, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: 'transparent', flexDirection: 'row' },
  ratingBlock4: { alignItems: 'center', justifyContent: 'center', width: 80, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: 'transparent', flexDirection: 'row' },
  ratingBlock5: { alignItems: 'center', justifyContent: 'center', width: 95, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: 'transparent', flexDirection: 'row' },
  ratingBlockActive: { backgroundColor: '#008655', borderColor: '#008655' },
  starIcon: { marginHorizontal: 1 },
});


