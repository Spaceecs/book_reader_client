import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const leftArrow = require('../../../assets/left_arrow.png');
const rightArrow = require('../../../assets/right_arrow.png');
const informationCircle = require('../../../assets/information-circle.png');
const scrollVertical = require('../../../assets/scroll-vertical.png');
const autoScroll = require('../../../assets/autoscroll.png');
const sections = require('../../../assets/Sections.png');
const search = require('../../../assets/search.png');

export default function BottomToolbar({
  progress = 0,
  onLeftPress,
  onRightPress,
  onInfoPress,
  onToggleImmersive,
  onAutoScrollPress,
  onChaptersPress,
  onSearchPress,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 0), backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, paddingBottom: 16 + Math.max(insets.bottom, 0), elevation: 6 }}>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#008655', textAlign: 'right', marginBottom: 8 }}>{progress}%</Text>
        <View style={{ height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#008655' }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={onLeftPress}><Image source={leftArrow} style={{ width: 24, height: 24 }} /></TouchableOpacity>
        <TouchableOpacity onPress={onRightPress}><Image source={rightArrow} style={{ width: 24, height: 24 }} /></TouchableOpacity>
        <TouchableOpacity onPress={onInfoPress}><Image source={informationCircle} style={{ width: 24, height: 24 }} /></TouchableOpacity>
        <TouchableOpacity onPress={onToggleImmersive}><Image source={scrollVertical} style={{ width: 24, height: 24 }} /></TouchableOpacity>
        <TouchableOpacity onPress={onAutoScrollPress}><Image source={autoScroll} style={{ width: 24, height: 24 }} /></TouchableOpacity>
        <TouchableOpacity onPress={onChaptersPress}><Image source={sections} style={{ width: 24, height: 24 }} /></TouchableOpacity>
        <TouchableOpacity onPress={onSearchPress}><Image source={search} style={{ width: 24, height: 24 }} /></TouchableOpacity>
      </View>
    </View>
  );
}


