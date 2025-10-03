import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function CommentInputModal({
  visible,
  onClose,
  previewText,
  value,
  onChange,
  onSave,
}) {
  return (
    <Modal visible={!!visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlayCenter}>
        <TouchableOpacity style={styles.overlayFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.centerCard}>
          <Text style={styles.title}>Коментар</Text>
          {!!previewText && (
            <Text style={styles.preview}>{String(previewText || '').slice(0, 180)}</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Введіть коментар"
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChange}
            multiline
          />
          <View style={styles.rowRight}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
              <Text style={{ color: '#444' }}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave}>
              <Text style={{ color: '#008655', fontWeight: '700' }}>Зберегти</Text>
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
  centerCard: { width: '86%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 8 },
  preview: { color: '#666', marginBottom: 8 },
  input: { flexGrow: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, minHeight: 80 },
  rowRight: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
});


