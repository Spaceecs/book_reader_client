import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
const sunIcon = require('../../../assets/sun-icon.png');
const singlePageIcon = require('../../../assets/Book.png');
const scrollModeIcon = require('../../../assets/scroll-mode-icon.png');

export default function SettingsModal({
  visible,
  onClose,
  state,
  setters,
  isDraggingBrightness,
  onBrightnessStart,
  onBrightnessChange,
  onBrightnessEnd,
}) {
  const {
    isDarkTheme,
    brightness,
    fontSize,
    readingMode,
    spacing,
    lineSpacing,
    selectedTheme,
    selectedFont,
    showFontDropdown,
    showSpacingDropdown,
    showLineSpacingDropdown,
    fonts,
    spacingOptions,
    lineSpacingOptions,
  } = state;

  const {
    setIsDarkTheme,
    setFontSize,
    setReadingMode,
    setSpacing,
    setLineSpacing,
    setSelectedTheme,
    setSelectedFont,
    setShowFontDropdown,
    setShowSpacingDropdown,
    setShowLineSpacingDropdown,
  } = setters;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} activeOpacity={1} onPress={onClose} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>Налаштування</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color="#111" /></TouchableOpacity>
          </View>
          <ScrollView style={{ paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled" scrollEnabled={!isDraggingBrightness}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#000', fontWeight: '600', marginBottom: 8 }}>Тема</Text>
              <View style={{ flexDirection: 'row' }}>
                {['#FFFFFF', '#F7F3E9', '#2A2D3A'].map((c) => (
                  <TouchableOpacity key={c} style={{ width: 50, height: 50, borderRadius: 8, borderWidth: selectedTheme === c ? 2 : 1, borderColor: selectedTheme === c ? '#008655' : '#e0e0e0', backgroundColor: c, marginRight: 8 }} onPress={() => setSelectedTheme(c)} />
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#000', fontWeight: '600', marginBottom: 8 }}>Яскравість</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={sunIcon} style={{ width: 24, height: 24, marginRight: 10 }} />
                <Slider style={{ flex: 1 }} minimumValue={0} maximumValue={100} step={1} value={brightness} onValueChange={onBrightnessChange} onSlidingStart={onBrightnessStart} onSlidingComplete={onBrightnessEnd} minimumTrackTintColor="#008655" maximumTrackTintColor="#e0e0e0" thumbTintColor="#008655" />
                <Text style={{ minWidth: 40, textAlign: 'center', color: '#000' }}>{Math.round(brightness)}%</Text>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#000', fontWeight: '600', marginBottom: 8 }}>Розмір шрифту</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 1))} style={{ padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, minWidth: 60, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', color: '#000' }}>Aа-</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#000', fontWeight: '700', marginBottom: 4, fontSize }}>Aа</Text>
                  <Text style={{ color: '#666' }}>{fontSize} px</Text>
                </View>
                <TouchableOpacity onPress={() => setFontSize(Math.min(24, fontSize + 1))} style={{ padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, minWidth: 60, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', color: '#000' }}>Aа+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#000', fontWeight: '600', marginBottom: 8 }}>Шрифти</Text>
              <TouchableOpacity style={{ padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} onPress={() => { setters.setShowFontDropdown(!showFontDropdown); setters.setShowSpacingDropdown(false); setters.setShowLineSpacingDropdown(false); }}>
                <Text style={{ color: '#000' }}>{selectedFont}</Text>
                <Ionicons name={showFontDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
              </TouchableOpacity>
              {showFontDropdown && (
                <View style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, marginTop: 6, backgroundColor: '#fff' }}>
                  {fonts.map((font) => (
                    <TouchableOpacity key={font} style={{ paddingVertical: 14, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: selectedFont === font ? '#f7fff7' : '#fff' }} onPress={() => { setSelectedFont(font); setters.setShowFontDropdown(false); }}>
                      <Text style={{ color: selectedFont === font ? '#008655' : '#000', fontWeight: selectedFont === font ? '700' : '400' }}>{font}</Text>
                      {selectedFont === font && <Ionicons name="checkmark" size={18} color="#008655" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#000', fontWeight: '600', marginBottom: 8 }}>Режим читання</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={{ flex: 1, padding: 10, marginRight: 4, borderWidth: 1, borderColor: readingMode === 'Одна сторінка' ? '#008655' : '#e0e0e0', borderRadius: 8, alignItems: 'center', backgroundColor: readingMode === 'Одна сторінка' ? '#008655' : '#fff' }} onPress={() => setReadingMode('Одна сторінка')}>
                  <Image source={singlePageIcon} style={{ width: 24, height: 24, marginBottom: 8, tintColor: readingMode === 'Одна сторінка' ? '#fff' : '#000' }} />
                  <Text style={{ color: readingMode === 'Одна сторінка' ? '#fff' : '#000' }}>Одна сторінка</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, padding: 10, marginLeft: 4, borderWidth: 1, borderColor: readingMode === 'Режим прокручування' ? '#008655' : '#e0e0e0', borderRadius: 8, alignItems: 'center', backgroundColor: readingMode === 'Режим прокручування' ? '#008655' : '#fff' }} onPress={() => setReadingMode('Режим прокручування')}>
                  <Image source={scrollModeIcon} style={{ width: 24, height: 24, marginBottom: 8, tintColor: readingMode === 'Режим прокручування' ? '#fff' : '#000' }} />
                  <Text style={{ color: readingMode === 'Режим прокручування' ? '#fff' : '#000' }}>Режим прокручування</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={{ color: '#000', fontWeight: '600', marginBottom: 8 }}>Інтервал</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#000', fontWeight: '600', marginBottom: 8 }}>Поля</Text>
              <TouchableOpacity style={{ padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} onPress={() => { setters.setShowSpacingDropdown(!showSpacingDropdown); setters.setShowFontDropdown(false); setters.setShowLineSpacingDropdown(false); }}>
                <Text style={{ color: '#000' }}>{spacing}</Text>
                <Ionicons name={showSpacingDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
              </TouchableOpacity>
              {showSpacingDropdown && (
                <View style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, marginTop: 6, backgroundColor: '#fff' }}>
                  {spacingOptions.map((option) => (
                    <TouchableOpacity key={option} style={{ paddingVertical: 14, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: spacing === option ? '#f7fff7' : '#fff' }} onPress={() => { setSpacing(option); setters.setShowSpacingDropdown(false); }}>
                      <Text style={{ color: spacing === option ? '#008655' : '#000', fontWeight: spacing === option ? '700' : '400' }}>{option}</Text>
                      {spacing === option && <Ionicons name="checkmark" size={18} color="#008655" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={{ color: '#000', fontWeight: '600', marginBottom: 8 }}>Міжрядковий інтервал</Text>
              <TouchableOpacity style={{ padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} onPress={() => { setters.setShowLineSpacingDropdown(!showLineSpacingDropdown); setters.setShowSpacingDropdown(false); setters.setShowFontDropdown(false); }}>
                <Text style={{ color: '#000' }}>{lineSpacing}</Text>
                <Ionicons name={showLineSpacingDropdown ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
              </TouchableOpacity>
              {showLineSpacingDropdown && (
                <View style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, marginTop: 6, backgroundColor: '#fff' }}>
                  {lineSpacingOptions.map((option) => (
                    <TouchableOpacity key={option} style={{ paddingVertical: 14, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: lineSpacing === option ? '#f7fff7' : '#fff' }} onPress={() => { setLineSpacing(option); setters.setShowLineSpacingDropdown(false); }}>
                      <Text style={{ color: lineSpacing === option ? '#008655' : '#000', fontWeight: lineSpacing === option ? '700' : '400' }}>{option}</Text>
                      {lineSpacing === option && <Ionicons name="checkmark" size={18} color="#008655" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}


