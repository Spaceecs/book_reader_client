import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import {getOnlineBooks, getReadingProgress} from '../shared';
import {openOnlineBook} from "../entities";
import {BookCard} from "../entities";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const tabs = ['Книги', 'Аудіокниги'];
const filters = ['Усі книги', 'Читаю', 'Прочитано', 'Не прочитано'];

export default function LibraryScreen({ navigation }) {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('Книги');
    const [activeFilter, setActiveFilter] = useState('Усі книги');
  const [isSortVisible, setIsSortVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Назва книги (за алфавітом)');
  const [isLangPickerVisible, setIsLangPickerVisible] = useState(false);
  const [isPublisherPickerVisible, setIsPublisherPickerVisible] = useState(false);
  const [isGenrePickerVisible, setIsGenrePickerVisible] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showFilterReadModal, setShowFilterReadModal] = useState(false);
  const [readStatusFilter, setReadStatusFilter] = useState('all'); // all|reading|read|unread
  const [readingProgressMap, setReadingProgressMap] = useState({}); // bookId -> progress 0..1
  const [pickerQuery, setPickerQuery] = useState('');
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMarkedRead, setIsMarkedRead] = useState(false);
  const coverScale = useRef(new Animated.Value(1)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchBooks = async () => {
                try {
                    const response = await getOnlineBooks();
                    if (isActive) setBooks(response || []);
                } catch (e) {
                    console.error('Не вдалося завантажити книги:', e);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchBooks();

            return () => { isActive = false; }; // cleanup
        }, [])
    );

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getReadingProgress();
        const map = {};
        (data || []).forEach(p => {
          if (p.book?.id != null && typeof p.progress === 'number') {
            map[p.book.id] = p.progress;
          }
        });
        setReadingProgressMap(map);
      } catch (e) {
        // ignore
      }
    };
    fetchProgress();
  }, []);

  useEffect(() => {
    if (isActionsVisible) {
      Animated.parallel([
        Animated.timing(coverScale, { toValue: 1.5, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      coverScale.setValue(1);
      sheetOpacity.setValue(0);
    }
  }, [isActionsVisible]);

  const ALL_LANGUAGES = ['Українська', 'English', 'Deutsch', 'Polski', 'Español', 'Français', 'Italiano', '中文', '日本語'];
  const ALL_PUBLISHERS = ['Віхола', 'Vivat', 'Yakaboo', 'КСД', 'Nebo BookLab', 'ArtHuss', 'Project Gutenberg', 'READBERRY'];
  const ALL_GENRES = ['Детектив', 'Фантастика', 'Фентезі', 'Романтика', 'Трилер', 'Нон-фікшн', 'Мемуари', 'Пригоди', 'Історія'];

  const filteredPickerData = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    const list = isLangPickerVisible ? ALL_LANGUAGES : isPublisherPickerVisible ? ALL_PUBLISHERS : ALL_GENRES;
    if (!q) return list;
    return list.filter(x => x.toLowerCase().includes(q));
  }, [pickerQuery, isLangPickerVisible, isPublisherPickerVisible, isGenrePickerVisible]);

  const visibleBooks = useMemo(() => {
    let list = books;
    if (activeTab === 'Аудіокниги') {
      list = list.filter(b => b.format === 'audio');
    } else {
      list = list.filter(b => b.format !== 'audio');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(b => (b.title || '').toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q));
    }
    // apply read status filter
    if (readStatusFilter === 'reading') {
      list = list.filter(b => (readingProgressMap[b.id] || 0) > 0 && (readingProgressMap[b.id] || 0) < 1);
    } else if (readStatusFilter === 'read') {
      list = list.filter(b => (readingProgressMap[b.id] || 0) >= 1);
    } else if (readStatusFilter === 'unread') {
      list = list.filter(b => !readingProgressMap[b.id] || readingProgressMap[b.id] === 0);
    }
    return list;
  }, [books, activeTab, searchQuery, readStatusFilter, readingProgressMap]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color="#222" />
        </TouchableOpacity>
        <View style={styles.searchStub}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Пошук"
            placeholderTextColor="#9e9e9e"
            returnKeyType="search"
          />
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity onPress={() => setIsSortVisible(true)}>
            <Ionicons name="swap-vertical-outline" size={20} color="#222" style={styles.topIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsFilterVisible(true)}>
            <Ionicons name="funnel-outline" size={20} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFilterReadModal(true)}>
            <Ionicons name="checkmark-done-outline" size={20} color="#222" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.segmentTrack}>
        {tabs.map((t, idx) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.segmentPill,
              activeTab === t && styles.segmentPillActive,
              idx === 0 && styles.segmentPillFirst,
              idx === tabs.length - 1 && styles.segmentPillLast,
            ]}
            onPress={() => setActiveTab(t)}
            activeOpacity={0.9}
          >
            <Text style={[styles.segmentLabel, activeTab === t && styles.segmentLabelActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {filters.map(f => (
          <TouchableOpacity key={f} style={[styles.filterChip, activeFilter === f && styles.filterChipActive]} onPress={() => setActiveFilter(f)}>
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderTitle}>
          {activeFilter === 'Усі книги' ? 'Усі' : activeFilter}
        </Text>
      </View>

      <FlatList
        data={visibleBooks}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[styles.grid, { paddingBottom: 60 + insets.bottom }]}
        renderItem={({ item }) => <BookCard book={item} setSelectedItem={setSelectedItem} setIsActionsVisible={setIsActionsVisible} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? (
          <View style={{ padding: 24 }}>
            <Text>Список порожній</Text>
          </View>
        ) : null}
      />

      <View style={styles.bottomSpacer} />

      {/* Read status filter modal */}
      <Modal visible={showFilterReadModal} transparent animationType="slide" onRequestClose={() => setShowFilterReadModal(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowFilterReadModal(false)} />
          <View style={[styles.sheetContainer, { paddingBottom: 20 + (insets?.bottom || 0) }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <TouchableOpacity onPress={() => setShowFilterReadModal(false)}>
                <Ionicons name="chevron-back" size={22} color="#222" />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Статус читання</Text>
              <View style={{ width: 24 }} />
            </View>
            {[
              { key: 'all', label: 'Усі' },
              { key: 'reading', label: 'Читаю' },
              { key: 'read', label: 'Прочитано' },
              { key: 'unread', label: 'Не прочитано' },
            ].map(opt => {
              const active = readStatusFilter === opt.key;
              return (
                <View key={opt.key} style={styles.rowBlock}>
                  <TouchableOpacity style={styles.optionRow} onPress={() => setReadStatusFilter(opt.key)}>
                    <Text style={styles.optionText}>{opt.label}</Text>
                    <View style={[styles.radioOuter, active && { borderColor: '#2E8B57' }]}>
                      {active && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Actions modal (long-press card) */}
      <Modal visible={isActionsVisible} transparent animationType="fade" onRequestClose={() => setIsActionsVisible(false)}>
        <View style={styles.actionsOverlay}>
          <BlurView style={styles.blurFill} intensity={40} tint="dark" />
          <TouchableOpacity style={styles.blurFill} activeOpacity={1} onPress={() => setIsActionsVisible(false)} />
          {selectedItem && (
            <View style={styles.actionsStack}>
              <Animated.View style={[styles.actionsContainer, { opacity: sheetOpacity }] }>
                <View style={styles.actionsHeaderTitle}>
                  <Text style={styles.actionsTitle} numberOfLines={1}>{selectedItem.title}</Text>
                  <Text style={styles.actionsSubtitle}>{(selectedItem.format || '').toUpperCase()}</Text>
                </View>
                <View style={styles.actionsList}>
                  {[
                    { key: 'info', label: 'Інформація' },
                    { key: 'read', label: 'Читати', onPress: () => { setIsActionsVisible(false); openOnlineBook(selectedItem.onlineId, selectedItem); } },
                    { key: 'mark', label: 'Позначити як прочитане', renderRight: () => (isMarkedRead ? <Ionicons name="checkmark" size={18} color="#2E8B57" /> : <Ionicons name="ellipse-outline" size={18} color="#999" />), onPress: () => setIsMarkedRead(prev => !prev) },
                    { key: 'collections', label: 'Колекції' },
                    { key: 'share', label: 'Поділитись' },
                    { key: 'delete', label: 'Видалити', destructive: true },
                  ].map((row, index, arr) => {
                    const isLast = index === arr.length - 1;
                    return (
                      <TouchableOpacity
                        key={row.key}
                        style={[styles.actionRow, isLast && styles.actionRowLast]}
                        onPress={row.onPress}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.actionText, row.destructive && styles.actionTextDestructive]}>{row.label}</Text>
                        {row.renderRight ? row.renderRight() : <Ionicons name="chevron-forward" size={18} color="#222" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </View>
          )}
        </View>
      </Modal>

      {/* Sort bottom sheet */}
      <Modal visible={isSortVisible} transparent animationType="slide" onRequestClose={() => setIsSortVisible(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsSortVisible(false)} />
          <View style={[styles.sheetContainer, { paddingBottom: 20 + (insets?.bottom || 0) }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <TouchableOpacity onPress={() => setIsSortVisible(false)}>
                <Ionicons name="chevron-back" size={22} color="#222" />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Сортування</Text>
              <Ionicons name="swap-vertical-outline" size={18} color="#2E8B57" />
            </View>
            {['Назва книги (за алфавітом)', 'Автор (за алфавітом)', 'За датою додавання', 'За кількістю сторінок'].map(option => {
              const active = sortBy === option;
              return (
                <View key={option} style={styles.rowBlock}>
                  <TouchableOpacity style={styles.optionRow} onPress={() => setSortBy(option)}>
                    <Text style={styles.optionText}>{option}</Text>
                    <View style={[styles.radioOuter, active && { borderColor: '#2E8B57' }]}>
                      {active && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Filter bottom sheet */}
      <Modal visible={isFilterVisible} transparent animationType="slide" onRequestClose={() => setIsFilterVisible(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsFilterVisible(false)} />
          <View style={[styles.sheetContainer, { paddingBottom: 20 + (insets?.bottom || 0) }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="chevron-back" size={22} color="#222" />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Фільтр</Text>
              <TouchableOpacity onPress={() => { setSelectedLanguages([]); setSelectedGenres([]); setSelectedPublishers([]); }}>
                <Text style={styles.clearText}>Очистити</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowBlock}>
              <TouchableOpacity style={styles.optionRow} onPress={() => { setIsLangPickerVisible(true); setPickerQuery(''); }}>
                <Text style={styles.optionText}>Мова</Text>
                <View style={styles.optionRight}>
                  <Text numberOfLines={1} style={styles.optionValue}>
                    {selectedLanguages.length ? `${selectedLanguages.slice(0, 2).join(', ')}${selectedLanguages.length > 2 ? '…' : ''}` : '—'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#888" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.rowBlock}>
              <TouchableOpacity style={styles.optionRow} onPress={() => { setIsGenrePickerVisible(true); setPickerQuery(''); }}>
                <Text style={styles.optionText}>Жанр</Text>
                <View style={styles.optionRight}>
                  <Text numberOfLines={1} style={styles.optionValue}>
                    {selectedGenres.length ? `${selectedGenres.slice(0, 2).join(', ')}${selectedGenres.length > 2 ? '…' : ''}` : '—'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#888" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.rowBlock}>
              <TouchableOpacity style={styles.optionRow} onPress={() => { setIsPublisherPickerVisible(true); setPickerQuery(''); }}>
                <Text style={styles.optionText}>Видавництво</Text>
                <View style={styles.optionRight}>
                  <Text numberOfLines={1} style={styles.optionValue}>
                    {selectedPublishers.length ? `${selectedPublishers.slice(0, 2).join(', ')}${selectedPublishers.length > 2 ? '…' : ''}` : '—'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#888" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {(isLangPickerVisible || isGenrePickerVisible || isPublisherPickerVisible) && (
        <Modal visible transparent animationType="slide" onRequestClose={() => { setIsLangPickerVisible(false); setIsPublisherPickerVisible(false); setIsGenrePickerVisible(false); }}>
          <View style={styles.sheetOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => { setIsLangPickerVisible(false); setIsPublisherPickerVisible(false); setIsGenrePickerVisible(false); }} />
            <View style={[styles.sheetContainer, { paddingBottom: 20 + (insets?.bottom || 0) }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeaderRow}>
                <TouchableOpacity onPress={() => { setIsLangPickerVisible(false); setIsPublisherPickerVisible(false); setIsGenrePickerVisible(false); }}>
                  <Ionicons name="chevron-back" size={22} color="#222" />
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>{isLangPickerVisible ? 'Мова' : isPublisherPickerVisible ? 'Видавництво' : 'Жанр'}</Text>
                <View style={{ width: 24 }} />
              </View>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#666" />
                <TextInput style={styles.searchInputPicker} placeholder="Пошук" value={pickerQuery} onChangeText={setPickerQuery} />
              </View>
              <View style={styles.pickerList}>
                {filteredPickerData.map(item => {
                  const array = isLangPickerVisible ? selectedLanguages : isPublisherPickerVisible ? selectedPublishers : selectedGenres;
                  const setArray = isLangPickerVisible ? setSelectedLanguages : isPublisherPickerVisible ? setSelectedPublishers : setSelectedGenres;
                  const checked = array.includes(item);
                  return (
                    <TouchableOpacity key={item} style={styles.selectRow} onPress={() => {
                      setArray(prev => checked ? prev.filter(x => x !== item) : [...prev, item]);
                    }}>
                      <Text style={styles.selectText}>{item}</Text>
                      <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={20} color={checked ? '#2E8B57' : '#666'} />
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchStub: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 36,
    flex: 1,
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111',
  },
  topIcons: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  topIcon: {
    marginRight: 10,
  },
  segmentTrack: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    marginTop: 8,
    backgroundColor: '#d9d9d9',
    marginHorizontal: 12,
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
  },
  segmentPill: {
    flex: 1,
    height: 40,
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentPillActive: {
    backgroundColor: '#fff',
  },
  segmentPillFirst: {},
  segmentPillLast: {},
  segmentLabel: {
    fontSize: 16,
    color: '#8a8a8a',
    fontWeight: '700',
  },
  segmentLabelActive: {
    color: '#1a1a1a',
  },
  filtersRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#008655',
    borderColor: '#008655',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    lineHeight: 18,
  },
  filterTextActive: {
    color: '#fff',
    lineHeight: 18,
  },
  grid: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 76,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 1,
  },
  listHeaderRow: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  // Actions modal styles
  actionsOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
  },
  actionsStack: {
    width: '86%',
    maxWidth: 360,
  },
  actionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    maxHeight: 370,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
  },
  actionsHeaderTitle: {
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F0F0F',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionsSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
    textAlign: 'center',
  },
  actionsList: {
    paddingTop: 4,
    alignSelf: 'stretch'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionRowLast: { borderBottomWidth: 0 },
  actionText: {
    fontSize: 15,
    color: '#0F0F0F',
    fontWeight: '600',
  },
  actionTextDestructive: { color: '#d62f2f' },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 8,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  clearText: {
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  rowBlock: {
    marginHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    marginBottom: 10,
  },
  optionRight: { flexDirection: 'row', alignItems: 'center', maxWidth: '60%' },
  optionValue: { color: '#9b9b9b', marginRight: 10 },
  optionText: {
    fontSize: 14,
    color: '#222',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2E8B57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E8B57',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  searchInputPicker: {
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
  pickerList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '60%',
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectText: {
    fontSize: 14,
    color: '#222',
  },
});