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
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlayCenter}>
        <TouchableOpacity style={styles.overlayFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.centerCard}>
          <Text style={styles.title}>Примітка</Text>
          {!!previewText && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Виділений текст:</Text>
              <Text style={styles.preview}>{String(previewText || '').slice(0, 180)}</Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder="Введіть свій коментар"
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChange}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.rowRight}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
              <Text style={styles.saveText}>Зберегти</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayCenter: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  overlayFill: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
  },
  centerCard: { 
    width: '85%', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#111', 
    marginBottom: 12 
  },
  previewContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#008655',
  },
  previewLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  preview: { 
    color: '#333', 
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    borderRadius: 6, 
    minHeight: 80,
    fontSize: 14,
    marginBottom: 16,
  },
  rowRight: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
  },
  cancelBtn: {
    padding: 10,
  },
  cancelText: {
    color: '#d32f2f',
    fontSize: 16,
  },
  saveBtn: {
    padding: 10,
  },
  saveText: {
    color: '#008655',
    fontSize: 16,
    fontWeight: '700',
  },
});


