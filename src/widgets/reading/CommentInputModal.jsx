import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';

export default function CommentInputModal({
  visible,
  onClose,
  previewText,
  value,
  onChange,
  onSave,
}) {
  const maxHeight = Math.round(Dimensions.get('window').height * 0.85);
  return (
    <Modal visible={!!visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlayCenter}>
        <TouchableOpacity style={styles.overlayFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.centerCard, { maxHeight }] }>
          <Text style={styles.title}>Коментар</Text>
          <ScrollView style={{ flexGrow: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
            {!!previewText && (
              <Text style={styles.preview}>{String(previewText || '')}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Введіть коментар"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </ScrollView>
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={onClose} style={[styles.btnOutline, { marginRight: 8 }]}>
              <Text style={styles.btnOutlineText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} style={[styles.btnOutline, { marginLeft: 8 }]}>
              <Text style={styles.btnOutlineText}>Ок</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  overlayFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  centerCard: { width: '92%', maxWidth: 560, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  title: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 8 },
  preview: { color: '#666', marginBottom: 8 },
  input: { flexGrow: 1, borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 10, minHeight: 140, backgroundColor: '#fff' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  btnOutline: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d9d9d9', alignItems: 'center' },
  btnOutlineText: { color: '#111', fontWeight: '600' },
  btnGhost: { paddingHorizontal: 14, paddingVertical: 10, marginRight: 12, borderRadius: 10, backgroundColor: '#f5f5f5' },
  btnGhostText: { color: '#444', fontWeight: '600' },
  btnPrimary: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#008655' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});


