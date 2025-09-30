import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';

const translateIcon = require('../../../assets/Translate.png');
const underlineIcon = require('../../../assets/Ico.png');
const copyIcon = require('../../../assets/Copy.png');
const commentIcon = require('../../../assets/Comment.png');
const colorWheelIcon = require('../../../assets/Color_RGB.png');

export default function TextSelectionModal({
  visible,
  onClose,
  onAddComment,
  onHighlight,
  onCopy,
  onDelete,
}) {
  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.toolbar}>
              <TouchableOpacity style={styles.button} onPress={() => onHighlight && onHighlight('green')}>
                <View style={[styles.colorCircle, { backgroundColor: 'green' }]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => onHighlight && onHighlight('red')}>
                <View style={[styles.colorCircle, { backgroundColor: 'red' }]} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={onDelete}>
                <Image source={colorWheelIcon} style={styles.icon} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={onDelete}>
                <Image source={underlineIcon} style={styles.icon} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Image source={translateIcon} style={styles.icon} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={onAddComment}>
                <Image source={commentIcon} style={styles.icon} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={onCopy}>
                <Image source={copyIcon} style={styles.icon} />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    alignItems: 'center',
  },
  button: { padding: 6, marginHorizontal: 4, borderRadius: 8 },
  icon: { width: 26, height: 26, resizeMode: 'contain' },
  colorCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#ccc' },
});


