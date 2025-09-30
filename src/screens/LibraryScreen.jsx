import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getOnlineBooks, getReadingProgress } from '../shared';
import { BookCard } from "../entities";

export default function LibraryScreen({ navigation }) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const tabs = [t('libraryScreen.tabs.books'), t('libraryScreen.tabs.audiobooks')];
    const filters = [
        t('libraryScreen.filters.all'),
        t('libraryScreen.filters.reading'),
        t('libraryScreen.filters.read'),
        t('libraryScreen.filters.unread')
    ];

    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [activeFilter, setActiveFilter] = useState(filters[0]);
    const [isSortVisible, setIsSortVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState(t('libraryScreen.sortOptions.title'));
    const [isLangPickerVisible, setIsLangPickerVisible] = useState(false);
    const [isPublisherPickerVisible, setIsPublisherPickerVisible] = useState(false);
    const [isGenrePickerVisible, setIsGenrePickerVisible] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedPublishers, setSelectedPublishers] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [showFilterReadModal, setShowFilterReadModal] = useState(false);
    const [readStatusFilter, setReadStatusFilter] = useState('all');
    const [readingProgressMap, setReadingProgressMap] = useState({});
    const [pickerQuery, setPickerQuery] = useState('');
    const [isActionsVisible, setIsActionsVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isMarkedRead, setIsMarkedRead] = useState(false);
    const coverScale = useRef(new Animated.Value(1)).current;
    const sheetOpacity = useRef(new Animated.Value(0)).current;
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const ALL_LANGUAGES = ['Українська', 'English', 'Deutsch', 'Polski', 'Español', 'Français', 'Italiano', '中文', '日本語'];
    const ALL_PUBLISHERS = ['Віхола', 'Vivat', 'Yakaboo', 'КСД', 'Nebo BookLab', 'ArtHuss', 'Project Gutenberg', 'READBERRY'];
    const ALL_GENRES = ['Детектив', 'Фантастика', 'Фентезі', 'Романтика', 'Трилер', 'Нон-фікшн', 'Мемуари', 'Пригоди', 'Історія'];

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
            return () => { isActive = false; };
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
            } catch (e) {}
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

    const filteredPickerData = useMemo(() => {
        const q = pickerQuery.trim().toLowerCase();
        const list = isLangPickerVisible ? ALL_LANGUAGES : isPublisherPickerVisible ? ALL_PUBLISHERS : ALL_GENRES;
        if (!q) return list;
        return list.filter(x => x.toLowerCase().includes(q));
    }, [pickerQuery, isLangPickerVisible, isPublisherPickerVisible, isGenrePickerVisible]);

    const visibleBooks = useMemo(() => {
        let list = books;
        if (activeTab === t('libraryScreen.tabs.audiobooks')) {
            list = list.filter(b => b.format === 'audio');
        } else {
            list = list.filter(b => b.format !== 'audio');
        }
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            list = list.filter(b => (b.title || '').toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q));
        }
        if (readStatusFilter === 'reading') {
            list = list.filter(b => (readingProgressMap[b.id] || 0) > 0 && (readingProgressMap[b.id] || 0) < 1);
        } else if (readStatusFilter === 'read') {
            list = list.filter(b => (readingProgressMap[b.id] || 0) >= 1);
        } else if (readStatusFilter === 'unread') {
            list = list.filter(b => !readingProgressMap[b.id] || readingProgressMap[b.id] === 0);
        }
        return list;
    }, [books, activeTab, searchQuery, readStatusFilter, readingProgressMap, t]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Top Bar */}
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
                        placeholder={t('header')}
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

            {/* Segment Tabs */}
            <View style={styles.segmentTrack}>
                {tabs.map((tName, idx) => (
                    <TouchableOpacity
                        key={tName}
                        style={[styles.segmentPill, activeTab === tName && styles.segmentPillActive]}
                        onPress={() => setActiveTab(tName)}
                        activeOpacity={0.9}
                    >
                        <Text style={[styles.segmentLabel, activeTab === tName && styles.segmentLabelActive]}>{tName}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Filters Row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
                {filters.map(f => (
                    <TouchableOpacity key={f} style={[styles.filterChip, activeFilter === f && styles.filterChipActive]} onPress={() => setActiveFilter(f)}>
                        <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* List Header */}
            <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderTitle}>{activeFilter}</Text>
            </View>

            {/* Book Grid */}
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
                        <Text>{t('libraryScreen.emptyList')}</Text>
                    </View>
                ) : null}
            />

            {/* Sort Modal */}
            <Modal visible={isSortVisible} transparent animationType="fade">
                <BlurView intensity={80} style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('libraryScreen.sortTitle')}</Text>
                        {[t('libraryScreen.sortOptions.title'), t('libraryScreen.sortOptions.author'), t('libraryScreen.sortOptions.newest')].map(option => (
                            <TouchableOpacity key={option} onPress={() => { setSortBy(option); setIsSortVisible(false); }}>
                                <Text style={styles.modalOption}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </BlurView>
            </Modal>

            {/* Filter Modal */}
            <Modal visible={isFilterVisible} transparent animationType="fade">
                <BlurView intensity={80} style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('libraryScreen.filterOptions.title')}</Text>
                        <TouchableOpacity onPress={() => { setIsLangPickerVisible(true); setIsFilterVisible(false); }}>
                            <Text style={styles.modalOption}>{t('libraryScreen.filterOptions.language')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setIsPublisherPickerVisible(true); setIsFilterVisible(false); }}>
                            <Text style={styles.modalOption}>{t('libraryScreen.filterOptions.publisher')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setIsGenrePickerVisible(true); setIsFilterVisible(false); }}>
                            <Text style={styles.modalOption}>{t('libraryScreen.filterOptions.genre')}</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>

            {/* Read Status Modal */}
            <Modal visible={showFilterReadModal} transparent animationType="fade">
                <BlurView intensity={80} style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('libraryScreen.filters.readStatus')}</Text>
                        {['all', 'reading', 'read', 'unread'].map(status => (
                            <TouchableOpacity key={status} onPress={() => { setReadStatusFilter(status); setShowFilterReadModal(false); }}>
                                <Text style={styles.modalOption}>{t(`libraryScreen.filters.${status}`)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </BlurView>
            </Modal>

            {/* Picker Modal (Language/Publisher/Genre) */}
            <Modal visible={isLangPickerVisible || isPublisherPickerVisible || isGenrePickerVisible} transparent animationType="fade">
                <BlurView intensity={80} style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <TextInput
                            style={styles.pickerSearchInput}
                            value={pickerQuery}
                            onChangeText={setPickerQuery}
                            placeholder={t('libraryScreen.filterOptions.search')}
                        />
                        <ScrollView>
                            {filteredPickerData.map(item => (
                                <TouchableOpacity key={item} onPress={() => {
                                    if (isLangPickerVisible) setSelectedLanguages([...selectedLanguages, item]);
                                    else if (isPublisherPickerVisible) setSelectedPublishers([...selectedPublishers, item]);
                                    else setSelectedGenres([...selectedGenres, item]);
                                }}>
                                    <Text style={styles.modalOption}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => { setIsLangPickerVisible(false); setIsPublisherPickerVisible(false); setIsGenrePickerVisible(false); }}>
                            <Text style={[styles.modalOption, { color: 'red' }]}>{t('libraryScreen.actions.close')}</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
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