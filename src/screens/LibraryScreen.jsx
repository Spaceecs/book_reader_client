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
    Animated,
    Image
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import {
    getLocalBooks,
    getOnlineBooks,
    getReadingProgress,
    markIsDeletedLocalBook,
    markIsDeletedOnlineBook,
    setReadingProgress, updateOnlineBookProgress
} from '../shared';
import { getCollections, addBookToCollection, removeBookFromCollection, createCollection } from '../shared/api';

import {LibraryBookCard, openLocalBook, openOnlineBook, rateBook} from "../entities";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const TAB_OPTIONS = ['books', 'audiobooks'];
const FILTER_OPTIONS = ['all_books', 'reading', 'read', 'unread'];

export default function LibraryScreen({ navigation }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('books');
    const [activeFilter, setActiveFilter] = useState('all_books');
    const [isSortVisible, setIsSortVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('title_alpha');
    const [isLangPickerVisible, setIsLangPickerVisible] = useState(false);
    const [isPublisherPickerVisible, setIsPublisherPickerVisible] = useState(false);
    const [isGenrePickerVisible, setIsGenrePickerVisible] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedPublishers, setSelectedPublishers] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedLibLanguages, setSelectedLibLanguages] = useState([]);
    const [selectedLibPublishers, setSelectedLibPublishers] = useState([]);
    const [showFilterReadModal, setShowFilterReadModal] = useState(false);
    const [readStatusFilter, setReadStatusFilter] = useState('all');
    const [readingProgressMap, setReadingProgressMap] = useState({});
    const [pickerQuery, setPickerQuery] = useState('');
    const [isActionsVisible, setIsActionsVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isCollectionsModalVisible, setIsCollectionsModalVisible] = useState(false);
    const [collections, setCollections] = useState([]);
    const coverScale = useRef(new Animated.Value(1)).current;
    const sheetOpacity = useRef(new Animated.Value(0)).current;
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRateVisible, setIsRateVisible] = useState(false);
    const [tempRating, setTempRating] = useState(0);

    const insets = useSafeAreaInsets();

  const getServerBookId = useCallback((item) => {
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
  }, []);

  const isSelectedMarkedRead = useMemo(() => {
    const key = Number(selectedItem?.onlineId ?? selectedItem?.id);
    if (!key) return false;
    return (readingProgressMap[key] || 0) >= 1;
  }, [selectedItem, readingProgressMap]);

    const applyFilter = (label) => {
        setActiveFilter(label);
        if (label === 'all_books') setReadStatusFilter('all');
        else if (label === 'reading') setReadStatusFilter('reading');
        else if (label === 'read') setReadStatusFilter('read');
        else if (label === 'unread') setReadStatusFilter('unread');
    };

    useEffect(() => {
        // keep chip label in sync when status changes via modal
        if (readStatusFilter === 'all') setActiveFilter('all_books');
        else if (readStatusFilter === 'reading') setActiveFilter('reading');
        else if (readStatusFilter === 'read') setActiveFilter('read');
        else if (readStatusFilter === 'unread') setActiveFilter('unread');
    }, [readStatusFilter]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchBooks = async () => {
                try {
                    let onlineBooks = await getOnlineBooks();
                    let localBooks = await getLocalBooks();

                    localBooks = (localBooks || []).filter(b => !b.isDeleted || b.isDeleted === 0 || b.isDeleted === false);
                    onlineBooks = (onlineBooks || []).filter(b => !b.isDeleted || b.isDeleted === 0 || b.isDeleted === false);

                    const combined = [...(onlineBooks || []), ...localBooks];

                    if (isActive) setBooks(combined);
                } catch (e) {
                    console.error(t('libraryScreen.errors.load_books_failed'), e);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchBooks();

            return () => { isActive = false; };
        }, [books])
    );

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

    useEffect(() => {
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

    const handleOpenBook = async (book) => {
        try {
            if (book.onlineId) {
                await openOnlineBook(book.onlineId, book, dispatch, navigation)
            } else {
                await openLocalBook(book.id, book, dispatch, navigation);
            }
        } catch (e) {
            console.log("Open book error: ", e);
        }
    }

    const handleDelete = async (book) => {
        try {
            if (book.onlineId) {
                await markIsDeletedOnlineBook(book.id, 1);
            } else {
                await markIsDeletedLocalBook(book.id, 1);
            }

            // Локальне оновлення стану
            setBooks(prev => prev.filter(b => b.id !== book.id && b.onlineId !== book.onlineId));
        } catch (e) {
            console.error(t('libraryScreen.errors.delete_book_error'), e);
        }
    };

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
        if (activeTab === 'audiobooks') {
            list = list.filter(b => b.format === 'audio');
        } else {
            list = list.filter(b => b.format !== 'audio');
        }
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            list = list.filter(b => (b.title || '').toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q));
        }
        if (selectedLibLanguages.length) {
            const setL = new Set(selectedLibLanguages.map(s => s.toLowerCase()));
            list = list.filter(b => b.language && setL.has(String(b.language).toLowerCase()));
        }
        if (selectedLibPublishers.length) {
            const setP = new Set(selectedLibPublishers.map(s => s.toLowerCase()));
            list = list.filter(b => b.publisher && setP.has(String(b.publisher).toLowerCase()));
        }
        // apply read status filter
        if (readStatusFilter === 'reading') {
            list = list.filter(b => (readingProgressMap[b?.onlineId] || 0) > 0 && (readingProgressMap[b?.onlineId] || 0) < 1);
        } else if (readStatusFilter === 'read') {
            list = list.filter(b => (readingProgressMap[b?.onlineId] || 0) >= 1);
        } else if (readStatusFilter === 'unread') {
            list = list.filter(b => !readingProgressMap[b?.onlineId] || readingProgressMap[b?.onlineId] === 0);
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
                        placeholder={t('libraryScreen.search.placeholder')}
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
                {TAB_OPTIONS.map((tab, idx) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.segmentPill,
                            activeTab === tab && styles.segmentPillActive,
                            idx === 0 && styles.segmentPillFirst,
                            idx === TAB_OPTIONS.length - 1 && styles.segmentPillLast,
                        ]}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.9}
                    >
                        <Text style={[styles.segmentLabel, activeTab === tab && styles.segmentLabelActive]}>{t(`libraryScreen.tabs.${tab}`)}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
                {FILTER_OPTIONS.map(filter => (
                    <TouchableOpacity key={filter} style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]} onPress={() => applyFilter(filter)}>
                        <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{t(`libraryScreen.filters.${filter}`)}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {visibleBooks.length > 0 && (
                <View style={styles.listHeaderRow}>
                    <Text style={styles.listHeaderTitle}>
                        {activeFilter === 'all_books' ? t('libraryScreen.filters.all') : t(`libraryScreen.filters.${activeFilter}`)}
                    </Text>
                </View>
            )}

            <FlatList
                data={visibleBooks}
                keyExtractor={(item, index) => `${item.id ?? item.onlineId}-${index}`}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={[styles.grid, { paddingBottom: 60 + insets.bottom }]}
                renderItem={({ item }) => (
                    <LibraryBookCard
                        book={item}
                        readingProgressMap={readingProgressMap}
                        onLongPress={() => { setSelectedItem(item); setIsActionsVisible(true); }}
                        onPress={() => handleOpenBook(item)}
                    />
                )}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={!loading ? (
                    <View style={{ padding: 24 }}>
                        <Text>{t('libraryScreen.empty_list')}</Text>
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
                            <Text style={styles.sheetTitle}>{t('libraryScreen.read_status.title')}</Text>
                            <View style={{ width: 24 }} />
                        </View>
                        {[
                            { key: 'all', label: t('libraryScreen.read_status.all') },
                            { key: 'reading', label: t('libraryScreen.read_status.reading') },
                            { key: 'read', label: t('libraryScreen.read_status.read') },
                            { key: 'unread', label: t('libraryScreen.read_status.unread') },
                        ].map(opt => {
                            const active = readStatusFilter === opt.key;
                            return (
                                <View key={opt.key} style={styles.rowBlock}>
                                    <TouchableOpacity style={styles.optionRow} onPress={() => { setReadStatusFilter(opt.key); setShowFilterReadModal(false); }}>
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
            <View style={[styles.actionsStack, { alignSelf: 'flex-start', marginLeft: 20 }]}> 
              <Animated.View style={[styles.actionsContainer, { opacity: sheetOpacity, width: 300 }] }>
                <View style={styles.actionsHeaderTitle}>
                  <Text style={styles.actionsTitle} numberOfLines={1}>{selectedItem.title}</Text>
                  <Text style={styles.actionsSubtitle}>{(selectedItem.format || '').toUpperCase()}</Text>
                </View>
                <View style={styles.actionsList}>
                  {[
                    { key: 'info', label: 'Інформація', icon: require('../../assets/information-circle.png') },
                      {
                          key: 'read',
                          label: 'Позначити як читаю',
                          icon: require('../../assets/Book.png'),
                          onPress: async () => {
                              try {
                                  setIsActionsVisible(false);
                                  await fetchProgress();
                                  const bid = Number(selectedItem?.onlineId ?? selectedItem?.id);
                                  if (!bid) return;
                                  console.log(selectedItem.currentPage);
                                  await updateOnlineBookProgress(selectedItem.id, 1, selectedItem.totalPages);
                                  console.log(selectedItem.currentPage);
                                  const progress = selectedItem.totalPages > 0
                                      ? 1 / selectedItem.totalPages
                                      : 0;
                                  await setReadingProgress(bid, progress, String(selectedItem.currentPage));
                                  const data = await getReadingProgress();
                                  const map = {};
                                  (data || []).forEach(p => { if (p.book?.id != null && typeof p.progress === 'number') { map[p.book.id] = p.progress; } });
                                  setReadingProgressMap(map);
                              } catch(e) {
                                  console.error('Помилка при fetchProgress', e);
                              }
                          }
                      },
                      { key: 'rate', label: 'Оцінити книгу', renderRight: () => (<Ionicons name="star" size={18} color="#FFCC66" />), onPress: () => {
                        setIsActionsVisible(false);
                        setTempRating(0);
                        setIsRateVisible(true);
                      } },
                    { key: 'mark', label: 'Позначити як прочитане', renderRight: () => (isSelectedMarkedRead ? <Ionicons name="checkmark" size={18} color="#2E8B57" /> : <Ionicons name="ellipse-outline" size={18} color="#999" />), onPress: async () => {
                        try {
                          const bid = Number(selectedItem?.onlineId ?? selectedItem?.id);
                          if (!bid) return;
                          await setReadingProgress(bid, 1, 'done');
                          const data = await getReadingProgress();
                            await updateOnlineBookProgress(selectedItem.id, selectedItem.totalPages, selectedItem.totalPages);
                          const map = {};
                          (data || []).forEach(p => { if (p.book?.id != null && typeof p.progress === 'number') { map[p.book.id] = p.progress; } });
                          setReadingProgressMap(map);
                        } catch(_) {}
                      } },
                    { key: 'collections', label: 'Колекції', icon: require('../../assets/collections.png'), onPress: async () => {
                        try {
                          setIsActionsVisible(false);
                          const list = await getCollections();
                          const arr = Array.isArray(list) ? list : [];
                          setCollections(arr);
                          setIsCollectionsModalVisible(true);
                        } catch(_) { setIsCollectionsModalVisible(true); }
                      } },
                    { key: 'share', label: 'Поділитись', icon: require('../../assets/icon (1).png') },
                      { key: 'delete',
                          label: t('libraryScreen.actions.delete'),
                          destructive: true,
                          icon: require('../../assets/basket.png'),
                          onPress: async () => {
                              setIsActionsVisible(false);
                              if (!selectedItem) return;
                              try {
                                  await handleDelete(selectedItem);
                              } catch (e) {
                                  console.error(t('libraryScreen.errors.delete_book_error'), e);
                              }
                          } },
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
                        {row.renderRight ? row.renderRight() : (row.icon ? <Image source={row.icon} style={{ width:18, height:18, marginLeft:10, tintColor: row.destructive ? '#d62f2f' : '#0F0F0F', resizeMode:'contain' }} /> : null)}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </View>
          )}
        </View>
      </Modal>

            {/* Rate modal (bottom sheet) */}
            <Modal visible={isRateVisible} transparent animationType="slide" onRequestClose={() => setIsRateVisible(false)}>
                <View style={styles.sheetOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsRateVisible(false)} />
                    <View style={[styles.sheetContainer, { paddingBottom: 20 + (insets?.bottom || 0) }] }>
                        <View style={styles.sheetHeaderRow}>
                            <TouchableOpacity onPress={() => setIsRateVisible(false)}>
                                <Ionicons name="chevron-back" size={22} color="#222" />
                            </TouchableOpacity>
                            <Text style={styles.sheetTitle}>{t('libraryScreen.rate_book.title')}</Text>
                            <View style={{ width: 24 }} />
                        </View>
                        <View style={{ paddingHorizontal: 16, paddingBottom: 16, alignItems:'center' }}>
                            <Text style={{ fontSize:16, fontWeight:'700', color:'#0F0F0F', marginBottom: 12 }} numberOfLines={1}>{selectedItem?.title || t('libraryScreen.rate_book.title')}</Text>
                            <View style={{ flexDirection:'row', alignItems:'center', marginBottom: 16 }}>
                                {[1,2,3,4,5].map(v => (
                                    <TouchableOpacity key={v} onPress={() => setTempRating(v)} style={{ padding: 6 }}>
                                        <Ionicons name={tempRating >= v ? 'star' : 'star-outline'} size={28} color={tempRating >= v ? '#FFCC66' : '#999'} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity
                                onPress={async () => {
                                    try{
                                        const bid = Number(selectedItem?.onlineId ?? selectedItem?.id);
                                        if (!bid || !tempRating) return;
                                        await rateBook(bid, tempRating);
                                    }catch(_){}
                                    finally{
                                        setIsRateVisible(false);
                                        setTempRating(0);
                                    }
                                }}
                                style={{ backgroundColor:'#2E8B57', paddingVertical:12, paddingHorizontal:24, borderRadius: 24 }}
                                activeOpacity={0.9}
                            >
                                <Text style={{ color:'#fff', fontWeight:'700' }}>{t('libraryScreen.rate_book.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
                            <Text style={styles.sheetTitle}>{t('libraryScreen.sort.title')}</Text>
                            <Ionicons name="swap-vertical-outline" size={18} color="#2E8B57" />
                        </View>
                        {[
                            { key: 'title_alpha', label: t('libraryScreen.sort.title_alpha') },
                            { key: 'author_alpha', label: t('libraryScreen.sort.author_alpha') },
                            { key: 'date_added', label: t('libraryScreen.sort.date_added') },
                            { key: 'page_count', label: t('libraryScreen.sort.page_count') }
                        ].map(option => {
                            const active = sortBy === option.key;
                            return (
                                <View key={option.key} style={styles.rowBlock}>
                                    <TouchableOpacity style={styles.optionRow} onPress={() => setSortBy(option.key)}>
                                        <Text style={styles.optionText}>{option.label}</Text>
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
                            <Text style={styles.sheetTitle}>{t('libraryScreen.filter.title')}</Text>
                            <TouchableOpacity onPress={() => { setSelectedLibLanguages([]); setSelectedGenres([]); setSelectedLibPublishers([]); }}>
                                <Text style={styles.clearText}>{t('libraryScreen.filter.clear')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.rowBlock}>
                            <TouchableOpacity style={styles.optionRow} onPress={() => { setIsLangPickerVisible(true); setPickerQuery(''); }}>
                                <Text style={styles.optionText}>{t('libraryScreen.filter.language')}</Text>
                                <View style={styles.optionRight}>
                                    <Text numberOfLines={1} style={styles.optionValue}>
                                        {selectedLibLanguages.length ? `${selectedLibLanguages.slice(0, 2).join(', ')}${selectedLibLanguages.length > 2 ? '…' : ''}` : t('libraryScreen.filter.not_selected')}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={18} color="#888" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.rowBlock}>
                            <TouchableOpacity style={styles.optionRow} onPress={() => { setIsGenrePickerVisible(true); setPickerQuery(''); }}>
                                <Text style={styles.optionText}>{t('libraryScreen.filter.genre')}</Text>
                                <View style={styles.optionRight}>
                                    <Text numberOfLines={1} style={styles.optionValue}>
                                        {selectedGenres.length ? `${selectedGenres.slice(0, 2).join(', ')}${selectedGenres.length > 2 ? '…' : ''}` : t('libraryScreen.filter.not_selected')}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={18} color="#888" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.rowBlock}>
                            <TouchableOpacity style={styles.optionRow} onPress={() => { setIsPublisherPickerVisible(true); setPickerQuery(''); }}>
                                <Text style={styles.optionText}>{t('libraryScreen.filter.publisher')}</Text>
                                <View style={styles.optionRight}>
                                    <Text numberOfLines={1} style={styles.optionValue}>
                                        {selectedLibPublishers.length ? `${selectedLibPublishers.slice(0, 2).join(', ')}${selectedLibPublishers.length > 2 ? '…' : ''}` : t('libraryScreen.filter.not_selected')}
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
                                <Text style={styles.sheetTitle}>
                                    {isLangPickerVisible
                                        ? t('libraryScreen.filter.language')
                                        : isPublisherPickerVisible
                                            ? t('libraryScreen.filter.publisher')
                                            : t('libraryScreen.filter.genre')}
                                </Text>
                                <View style={{ width: 24 }} />
                            </View>
                            <View style={styles.searchBar}>
                                <Ionicons name="search" size={18} color="#666" />
                                <TextInput
                                    style={styles.searchInputPicker}
                                    placeholder={t('libraryScreen.search.placeholder')}
                                    value={pickerQuery}
                                    onChangeText={setPickerQuery}
                                />
                            </View>
                            <View style={styles.pickerList}>
                                {filteredPickerData.map(item => {
                                    const array = isLangPickerVisible ? selectedLibLanguages : isPublisherPickerVisible ? selectedLibPublishers : selectedGenres;
                                    const setArray = isLangPickerVisible ? setSelectedLibLanguages : isPublisherPickerVisible ? setSelectedLibPublishers : setSelectedGenres;
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

      {/* Collections choose modal */}
      {isCollectionsModalVisible && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setIsCollectionsModalVisible(false)}>
          <View style={styles.sheetOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsCollectionsModalVisible(false)} />
            <View style={[styles.sheetContainer, { paddingBottom: 20 + (insets?.bottom || 0) }] }>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeaderRow}>
                <TouchableOpacity onPress={() => setIsCollectionsModalVisible(false)}>
                  <Ionicons name="chevron-back" size={22} color="#222" />
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>Додати до колекції</Text>
                <View style={{ width: 24 }} />
              </View>
              <View style={{ paddingHorizontal: 16, paddingBottom: 24, maxHeight: '60%' }}>
                {[{ key: 'audio', label: 'Аудіо книги' }, { key: 'downloaded', label: 'Завантажені на пристрій' }].map(row => (
                  <View key={row.key} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#eee', opacity:0.6 }}>
                    <Text style={{ fontSize:14, color:'#666' }}>{row.label}</Text>
                    <Ionicons name="information-circle-outline" size={20} color="#999" />
                  </View>
                ))}
                {/* System collections (always visible): Saved / Postponed */}
                {(() => {
                  const targetBookId = getServerBookId(selectedItem);
                  const saved = (collections || []).find(c => (c.name || c.title) === 'Збережені');
                  const postponed = (collections || []).find(c => (c.name || c.title) === 'Відкладені');
                  const sysRows = [
                    { key: 'saved', label: 'Збережені', col: saved },
                    { key: 'postponed', label: 'Відкладені', col: postponed },
                  ];
                  return sysRows.map(({ key, label, col }) => {
                    const isIn = !!(targetBookId && col && Array.isArray(col.books) && col.books.some(b => Number(b?.id) === targetBookId));
                    return (
                      <TouchableOpacity
                        key={`sys-${key}`}
                        style={[styles.selectRow, isIn && { backgroundColor: '#e6f5ef' }]}
                        onPress={async () => {
                          try {
                            if (!targetBookId) return;
                            let collectionId = col?.id;
                            if (!collectionId) {
                              try {
                                const created = await createCollection(label);
                                collectionId = created?.id;
                              } catch(_) {}
                            }
                            if (!collectionId) return;
                            // optimistic update
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
                            if (isIn) { await removeBookFromCollection(collectionId, targetBookId); }
                            else { await addBookToCollection(collectionId, targetBookId); }
                            const list = await getCollections();
                            setCollections(Array.isArray(list) ? list : []);
                          } catch(_) { /* ignore */ }
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.selectText, isIn && { color: '#0E7A4A', fontWeight: '700' }]}>{label}</Text>
                        <Ionicons name={isIn ? 'checkbox' : 'square-outline'} size={20} color={isIn ? '#2E8B57' : '#666'} />
                      </TouchableOpacity>
                    );
                  });
                })()}
                {(collections || []).map(c => {
                  const targetBookId = getServerBookId(selectedItem);
                  const isIn = Array.isArray(c.books) ? c.books.some(b => Number(b?.id) === targetBookId) : false;
                  if ((c.name || c.title) === 'Збережені' || (c.name || c.title) === 'Відкладені') return null; // avoid duplicate rendering
                  return (
                    <TouchableOpacity
                      key={String(c.id)}
                      style={[styles.selectRow, isIn && { backgroundColor: '#e6f5ef' }]}
                      onPress={async () => {
                        try {
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
                          if (isIn) { await removeBookFromCollection(c.id, targetBookId); }
                          else { await addBookToCollection(c.id, targetBookId); }
                          // refresh from server
                          const list = await getCollections();
                          setCollections(Array.isArray(list) ? list : []);
                        } catch(_) { /* ignore */ }
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.selectText, isIn && { color: '#0E7A4A', fontWeight: '700' }]}>{c.name || c.title || 'Без назви'}</Text>
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
    marginBottom: 18,
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
    marginTop: 24,
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
    maxHeight: 420,
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