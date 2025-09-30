import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Modal, Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { getCollections, getCollection, createCollection, deleteCollection as apiDeleteCollection } from '../shared/api';
import { getLocalBooks } from '../shared';

const iconAudio = require('../../assets/Audio_Books.png');
const iconSaved = require('../../assets/Save.png');
const iconDownloaded = require('../../assets/Dowload_Android.png');
const iconPostponed = require('../../assets/Vidckad.png');

const pinPng = require('../../assets/Zakrep_Colection.png');
const editPng = require('../../assets/Redakt_colection.png');
const deletePng = require('../../assets/Delete_Colection.png');

const iconMap = {
  audio: require('../../assets/Audio_Books.png'),
  download: require('../../assets/Dowload_Android.png'),
  postponed: require('../../assets/Vidckad.png'),
  saved: require('../../assets/Save.png'),
  baby: require('../../assets/Colection_Baby.png'),
  book: require('../../assets/Colection_Book.png'),
  coffee: require('../../assets/Colection_coffe.png'),
  death: require('../../assets/Colection_Deat.png'),
  fire: require('../../assets/Colection_Fire.png'),
  flag: require('../../assets/Colection_Flag.png'),
  love: require('../../assets/Colection_Love.png'),
  money: require('../../assets/Colection_Mone.png'),
  frost: require('../../assets/Colection_Moroz.png'),
  night: require('../../assets/Colection_Niht.png'),
  pc: require('../../assets/Colection_Pc.png'),
  cookie: require('../../assets/Colection_Pechenka.png'),
  rating: require('../../assets/Colection_Reting.png'),
  zorepad: require('../../assets/Colection_zorepad.png'),
};

const systemRows = [
  { id: 'audio', title: 'Аудіо книги', icon: iconAudio, route: 'CollectionAudio' },
  { id: 'saved', title: 'Збережені', icon: iconSaved, route: 'CollectionSaved' },
  { id: 'downloaded', title: 'Завантажені на пристрій', icon: iconDownloaded, route: 'CollectionDownloaded' },
  { id: 'postponed', title: 'Відкладені', icon: iconPostponed, route: 'CollectionPostponed' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ICON_COLS = 6;
const ICON_GAP = 12;
const AVAILABLE_WIDTH = SCREEN_WIDTH - 32 - 24;
const ICON_PILL_SIZE = Math.floor((AVAILABLE_WIDTH - ICON_GAP * (ICON_COLS - 1)) / ICON_COLS);

export function CollectionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nameDraft, setNameDraft] = useState('');
  const [iconDraft, setIconDraft] = useState('audio');
  const [colorDraft, setColorDraft] = useState('#2E8B57');
  const [pinnedDraft, setPinnedDraft] = useState(false);

  const [collections, setCollections] = useState([]);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [isSortVisible, setIsSortVisible] = useState(false);
  const SORT_OPTIONS = [
    { key: 'title', label: 'Назва (за алфавітом)' },
    { key: 'updated', label: 'За датою оновлення' },
    { key: 'created', label: 'За датою додавання' },
    { key: 'count', label: 'За кількістю книг у колекції' },
  ];
  const [sortKey, setSortKey] = useState('title');
  const [sortDir, setSortDir] = useState('asc');

  const iconChoices = Object.keys(iconMap);
  const colorChoices = ['#000000', '#9e9e9e', '#e5e7eb', '#22c55e', '#ef4444', '#f59e0b', '#6366f1'];

  const filteredCollections = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = collections;
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'title') {
        const at = String(a.name || a.title || '');
        const bt = String(b.name || b.title || '');
        cmp = at.localeCompare(bt);
      } else if (sortKey === 'updated') {
        cmp = (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0);
      } else if (sortKey === 'created') {
        cmp = (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
      } else if (sortKey === 'count') {
        const ac = Number(a.count != null ? a.count : (Array.isArray(a.books) ? a.books.length : 0)) || 0;
        const bc = Number(b.count != null ? b.count : (Array.isArray(b.books) ? b.books.length : 0)) || 0;
        cmp = bc - ac;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    if (!q) return list;
    return list.filter(c => String(c.name || c.title || '').toLowerCase().includes(q));
  }, [search, collections, sortKey, sortDir]);

  const chunk = (arr, size) => arr.reduce((rows, key, idx) => {
    if (idx % size === 0) rows.push([key]); else rows[rows.length - 1].push(key);
    return rows;
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setNameDraft('');
    setIconDraft('audio');
    setColorDraft('#2E8B57');
    setPinnedDraft(false);
    setIsModalVisible(true);
  };
  const openEdit = (item) => {
    setEditingId(item.id);
    setNameDraft(item.title);
    setIconDraft(item.icon);
    setColorDraft(item.color);
    setPinnedDraft(!!item.pinned);
    setIsModalVisible(true);
  };
  const saveCollection = async () => {
    if (!nameDraft.trim()) { setIsModalVisible(false); return; }
    try {
      if (editingId) {
        // simple local edit (no PATCH in API spec); recreate by delete/create could be used later
        setCollections(prev => prev.map(c => c.id === editingId ? { ...c, name: nameDraft.trim() } : c));
      } else {
        const created = await createCollection(nameDraft.trim());
        setCollections(prev => [created, ...prev]);
      }
    } catch(_) {}
    setIsModalVisible(false);
  };
  const togglePin = (id) => setCollections(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned, updatedAt: Date.now() } : c));
  const deleteCollection = async (id) => {
    try { await apiDeleteCollection(id); } catch(_) {}
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  React.useEffect(() => {
    (async () => {
      try {
        const list = await getCollections();
        let arr = Array.isArray(list) ? list : [];
        // Ensure system collections exist: "Збережені" and "Відкладені"
        const hasSaved = arr.some(c => (c.name || c.title) === 'Збережені');
        const hasPostponed = arr.some(c => (c.name || c.title) === 'Відкладені');
        if (!hasSaved) {
          try { const created = await createCollection('Збережені'); arr = [created, ...arr]; } catch(_) {}
        }
        if (!hasPostponed) {
          try { const created = await createCollection('Відкладені'); arr = [created, ...arr]; } catch(_) {}
        }
        setCollections(arr);
      } catch(_) {}
      try { const locals = await getLocalBooks(); setDownloadedCount(Array.isArray(locals) ? locals.length : 0); } catch(_) {}
    })();
  }, []);

  const pinned = filteredCollections.filter(c => c.pinned);
  const others = filteredCollections.filter(c => !c.pinned);

  const renderLeftActions = (item) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 0, marginLeft: 16, marginRight: -25, height: '100%', zIndex: 1 }}>
      <TouchableOpacity
        style={{ height: 60, width: 90, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#22c55e', marginTop: -10, marginRight: 0 }}
        activeOpacity={0.85}
        onPress={() => togglePin(item.id)}
      >
        <Image source={pinPng} style={{ width: 20, height: 20, tintColor: '#fff', resizeMode: 'contain' }} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{ height: 60, width: 90, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', marginTop: -10, marginLeft: -20 }}
        activeOpacity={0.85}
        onPress={() => openEdit(item)}
      >
        <Image source={editPng} style={{ width: 20, height: 20, tintColor: '#fff', resizeMode: 'contain' }} />
      </TouchableOpacity>
    </View>
  );

  const renderRightActions = (item) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16, height: '100%', marginLeft: -25 }}>
      <TouchableOpacity
        style={{ height: 60, width: 90, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', marginTop: -10 }}
        activeOpacity={0.85}
        onPress={() => deleteCollection(item.id)}
      >
        <Image source={deletePng} style={{ width: 22, height: 22, tintColor: '#fff', resizeMode: 'contain' }} />
      </TouchableOpacity>
    </View>
  );

    return (
        <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.openDrawer?.()}>
          <Ionicons name="menu" size={24} color="#0F0F0F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Колекції</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setIsSortVisible(true)} style={{ marginRight: 16 }}>
            <Ionicons name="swap-vertical" size={20} color="#0F0F0F" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openCreate}>
            <Ionicons name="add" size={22} color="#0F0F0F" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput style={styles.searchInput} placeholder="Пошук" placeholderTextColor="#9e9e9e" value={search} onChangeText={setSearch} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}>
        {pinned.map(item => (
          <View key={`p-${item.id}`} style={[styles.row, { borderColor: '#c7eadb', backgroundColor: '#f7fffb' }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIconCircle, { backgroundColor: item.color }]}>
                {iconMap[item.icon] ? (
                  <Image source={iconMap[item.icon]} style={{ width: 18, height: 18, tintColor: '#fff', resizeMode: 'contain' }} />
                ) : (
                  <Ionicons name={item.icon} size={18} color="#fff" />
                )}
              </View>
              <View>
                <Text style={styles.rowTitle}>{item.title || item.name}</Text>
                <Text style={styles.rowSubtitle}>{item.count}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => togglePin(item.id)}>
              <Image source={pinPng} style={{ width: 18, height: 18, tintColor: '#2E8B57', resizeMode: 'contain' }} />
            </TouchableOpacity>
          </View>
        ))}

        {others.map(item => (
          <Swipeable key={String(item.id)} renderLeftActions={() => renderLeftActions(item)} renderRightActions={() => renderRightActions(item)} overshootLeft={false} overshootRight={false} friction={2} leftThreshold={1} rightThreshold={24}>
            <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={() => {
              navigation && navigation.navigate && navigation.navigate('CollectionDetails', { collectionId: item.id });
            }}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconCircle, { backgroundColor: item.color || '#e5e7eb' }]}>
                  {iconMap[item.icon] ? (
                    <Image source={iconMap[item.icon]} style={{ width: 18, height: 18, tintColor: '#fff', resizeMode: 'contain' }} />
                  ) : (
                    <Ionicons name={item.icon || 'folder'} size={18} color="#fff" />
                  )}
                </View>
                <View>
                  <Text style={styles.rowTitle}>{item.name || item.title || 'Без назви'}</Text>
                  <Text style={styles.rowSubtitle}>{String(item.count != null ? item.count : (Array.isArray(item.books) ? item.books.length : 0))}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </TouchableOpacity>
          </Swipeable>
        ))}

        {systemRows.map(row => {
          let countText = '0';
          if (row.id === 'downloaded') countText = String(downloadedCount || 0);
          if (row.id === 'saved') {
            const c = collections.find(c => (c.name || c.title) === 'Збережені');
            countText = String((c && (c.count || (Array.isArray(c.books) ? c.books.length : 0))) || 0);
          }
          if (row.id === 'postponed') {
            const c = collections.find(c => (c.name || c.title) === 'Відкладені');
            countText = String((c && (c.count || (Array.isArray(c.books) ? c.books.length : 0))) || 0);
          }
          return (
          <TouchableOpacity key={row.id} style={styles.row} onPress={() => navigation && navigation.navigate && navigation.navigate(row.route)}>
            <View style={styles.rowLeft}>
              <Image source={row.icon} style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowSubtitle}>{countText}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        )})}
      </ScrollView>

      <Modal visible={isSortVisible} transparent animationType="slide" onRequestClose={() => setIsSortVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setIsSortVisible(false)} />
          <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <TouchableOpacity onPress={() => setIsSortVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="chevron-back" size={22} color="#0F0F0F" />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Сортування</Text>
              <TouchableOpacity onPress={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')} style={{ padding: 4 }}>
                <Ionicons name={sortDir === 'asc' ? 'arrow-up' : 'arrow-down'} size={20} color="#2E8B57" />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map(opt => {
              const active = sortKey === opt.key;
              return (
                <TouchableOpacity key={opt.key} style={styles.sortRow} onPress={() => setSortKey(opt.key)}>
                  <Text style={styles.sortText}>{opt.label}</Text>
                  <View style={[styles.radioOuter, active && { borderColor: '#2E8B57' }]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setIsModalVisible(false)} />
          <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.sheetHeaderBtn}>Скасувати</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Нова колекція</Text>
              <TouchableOpacity onPress={saveCollection}>
                <Text style={[styles.sheetHeaderBtn, { color: '#2E8B57' }]}>Зберегти</Text>
              </TouchableOpacity>
            </View>
            <TextInput value={nameDraft} onChangeText={setNameDraft} placeholder="Назва колекції" style={styles.nameInput} />
            <View style={styles.blockBox}>
              <Text style={styles.blockTitle}>Обрати іконку</Text>
              {chunk(iconChoices, ICON_COLS).map((rowKeys, rowIdx) => (
                <View key={`r-${rowIdx}`} style={{ flexDirection: 'row', marginBottom: rowIdx === iconChoices.length - 1 ? 0 : ICON_GAP }}>
                  {rowKeys.map((key, idx) => {
                    const active = iconDraft === key;
                    const isLast = idx === rowKeys.length - 1;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.iconPill, active && styles.iconPillActive, { width: ICON_PILL_SIZE, height: ICON_PILL_SIZE, marginRight: isLast ? 0 : ICON_GAP }]}
                        onPress={() => setIconDraft(key)}
                      >
                        <Image source={iconMap[key]} style={{ width: 18, height: 18, tintColor: active ? '#fff' : '#0F0F0F', resizeMode: 'contain' }} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
            <View style={styles.blockBox}>
              <Text style={styles.blockTitle}>Обрати колір теми</Text>
              <View style={styles.colorRow}>
                {colorChoices.map(c => {
                  const active = colorDraft === c;
                  return (
                    <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, active && styles.colorDotActive]} onPress={() => setColorDraft(c)} />
                  );
                })}
              </View>
            </View>
            <TouchableOpacity style={styles.pinRow} onPress={() => setPinnedDraft(v => !v)}>
              <View style={[styles.checkbox, pinnedDraft && styles.checkboxChecked]}>
                {pinnedDraft && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.pinLabel}>Закріпити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F0F0F' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f4f4', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12, height: 40, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6E6E6', paddingVertical: 12, paddingHorizontal: 12, marginBottom: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { width: 28, height: 28, resizeMode: 'contain', marginRight: 12 },
  rowIconCircle: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowTitle: { fontSize: 16, color: '#0F0F0F', fontWeight: '600' },
  rowSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, marginBottom: 8 },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetHeaderBtn: { color: '#777', fontWeight: '600' },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#0F0F0F' },
  nameInput: { backgroundColor: '#f4f4f4', borderRadius: 12, height: 40, paddingHorizontal: 12, marginBottom: 12 },
  blockBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6E6E6', padding: 12, marginBottom: 12 },
  blockTitle: { color: '#0F0F0F', fontWeight: '600', marginBottom: 10 },
  iconPill: { borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6E6E6' },
  iconPillActive: { backgroundColor: '#2E8B57', borderColor: '#2E8B57' },
  colorRow: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 26, height: 26, borderRadius: 13, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: '#008655' },
  pinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  checkbox: { width: 22, height: 22, borderRadius: 4, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxChecked: { backgroundColor: '#2E8B57' },
  pinLabel: { color: '#0F0F0F', fontWeight: '600' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, marginHorizontal: 8, marginBottom: 10, backgroundColor: '#fff' },
  sortText: { color: '#0F0F0F' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#cfcfcf', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2E8B57' },
});