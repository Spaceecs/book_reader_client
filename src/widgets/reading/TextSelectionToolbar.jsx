import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
const translateIcon = require('../../../assets/Translate.png');
const underlineIcon = require('../../../assets/Ico.png');
const copyIcon = require('../../../assets/Copy.png');
const commentIcon = require('../../../assets/Comment.png');
const colorWheelIcon = require('../../../assets/Color_RGB.png');

export default function TextSelectionToolbar({ onTranslate, onUnderline, onCopy, onComment, onColorPicker, style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6, elevation: 6 }, style]}>
      <TouchableOpacity style={{ padding: 6, marginHorizontal: 4 }} onPress={onTranslate}>
        <Image source={translateIcon} style={{ width: 24, height: 24 }} />
      </TouchableOpacity>
      <TouchableOpacity style={{ padding: 6, marginHorizontal: 4 }} onPress={onUnderline}>
        <Image source={underlineIcon} style={{ width: 24, height: 24 }} />
      </TouchableOpacity>
      <TouchableOpacity style={{ padding: 6, marginHorizontal: 4 }} onPress={onCopy}>
        <Image source={copyIcon} style={{ width: 24, height: 24 }} />
      </TouchableOpacity>
      <TouchableOpacity style={{ padding: 6, marginHorizontal: 4 }} onPress={onComment}>
        <Image source={commentIcon} style={{ width: 24, height: 24 }} />
      </TouchableOpacity>
      <TouchableOpacity style={{ padding: 6, marginHorizontal: 4 }} onPress={onColorPicker}>
        <Image source={colorWheelIcon} style={{ width: 28, height: 28 }} />
      </TouchableOpacity>
    </View>
  );
}


