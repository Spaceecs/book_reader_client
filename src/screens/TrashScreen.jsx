import React, { useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

const deletePng = require('../../assets/Delete_Colection.png');
const emptyPng = require('../../assets/Corzina.png');

const seedRemovedBooks = [];

export default function TrashScreen({ navigation }) {
  const [items, setItems] = useState(seedRemovedBooks);
  const [toast, setToast] = useState({ visible: false, text: '', mode: 'success' });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastProgress = useRef(new Animated.Value(0)).current;
  const [toastTrackWidth, setToastTrackWidth] = useState(0);

  const ACTION_BUTTON_WIDTH = 120;
  const ACTION_PEEK_WIDTH = 96;
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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

  const restoreItem = (item) => {
    setItems(prev => prev.filter(b => b.id !== item.id));
    showToast(`Книгу відновлено\n«${item.title}» відновлено в вашій бібліотеці`, 'success');
  };

  const deleteForever = (item) => {
    setItems(prev => prev.filter(b => b.id !== item.id));
    showToast(`Книгу видалено назавжди\n«${item.title}» видалено назавжди`, 'danger');
  };

  const renderRightActions = (item, progress, dragX) => {
    const opacity = progress.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 0.7, 1], extrapolate: 'clamp' });
    const scale = dragX.interpolate({ inputRange: [-ACTION_PEEK_WIDTH, -20, 0], outputRange: [1, 0.97, 0.9], extrapolate: 'clamp' });
    const translateX = dragX.interpolate({ inputRange: [-ACTION_PEEK_WIDTH, 0], outputRange: [0, ACTION_PEEK_WIDTH * 0.3], extrapolate: 'clamp' });
    return (
      <Animated.View style={[styles.rightActionContainer, { width: ACTION_PEEK_WIDTH, flex: 0, marginLeft: 0, marginRight: 0, transform: [{ translateX }] }]}> 
        <AnimatedTouchable
          style={[styles.deleteAction, { width: ACTION_BUTTON_WIDTH, opacity, transform: [{ scale }] }]}
          onPress={() => deleteForever(item)}
          activeOpacity={0.9}
        >
          <Image source={deletePng} style={{ width: 24, height: 24, tintColor: '#fff', resizeMode: 'contain', marginBottom: 8 }} />
          <Text style={styles.deleteActionText}>Видалити</Text>
        </AnimatedTouchable>
      </Animated.View>
    );
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(item, progress, dragX)}
      overshootRight={false}
      friction={1.2}
      rightThreshold={40}
    >
      <View style={styles.card}>
        <Image source={{ uri: item.cover }} style={styles.cover} defaultSource={require('../../assets/placeholder-cover.png')} />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <TouchableOpacity style={styles.restoreBtn} onPress={() => restoreItem(item)}>
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

  const clearAll = () => setItems([]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.openDrawer?.()} style={styles.backButton}>
          <Ionicons name="menu" size={22} color="#0F0F0F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Корзина</Text>
        <TouchableOpacity onPress={clearAll} style={styles.headerRight}>
          <Image source={require('../../assets/trash.png')} style={{ width: 20, height: 20, tintColor: '#0F0F0F', resizeMode: 'contain' }} />
        </TouchableOpacity>
      </View>

      <Text style={styles.autoCleanText}>Автоматичне очищення через 30 днів</Text>

      {items.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Image source={emptyPng} style={styles.emptyImage} />
          <Text style={styles.emptyTitle}>Корзина порожня</Text>
          <Text style={styles.emptySubtitle}>Тут з'являться ваші видалені книги</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff' },
  backButton: { position: 'absolute', left: 16, padding: 4 },
  headerRight: { position: 'absolute', right: 16, padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#0F0F0F' },
  autoCleanText: { color: '#8C8C8C', fontSize: 13, paddingHorizontal: 16, marginBottom: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, borderWidth: 1, borderColor: '#f0f0f0', alignItems: 'center' },
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
  rightActionContainer: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 0, marginRight: 16, marginLeft: -120 },
  deleteAction: { width: 120, height: '90%', backgroundColor: '#ef4444', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: -17 },
  deleteActionText: { color: '#fff', fontWeight: '700' },
  emptyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyImage: { width: '80%', height: undefined, aspectRatio: 986 / 768, tintColor: '#d6d6d6' },
  emptyTitle: { marginTop: 12, fontSize: 22, fontWeight: '700', color: '#0F0F0F' },
  emptySubtitle: { marginTop: 4, fontSize: 14, color: '#8C8C8C' },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 24, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 16, borderTopWidth: 0, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5, overflow: 'hidden' },
  toastText: { color: '#0F0F0F', textAlign: 'left' },
  toastProgressTrack: { position: 'absolute', left: 0, right: 0, top: 0, height: 3, backgroundColor: '#eaeaea' },
  toastProgressFill: { position: 'absolute', left: 0, top: 0, height: 3, backgroundColor: '#2E8B57' },
});


