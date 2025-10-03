import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const bookmarkIcon = require('../../../assets/Ecran_Libery.png');

export default function ChaptersDrawer({ visible, onClose, chapters = [], currentId, readIds = [], onSelectChapter, expandedIds = [], onToggleExpand, currentIndex = 0, totalCount = 0, activeTab = 'chapters', onChangeTab, bookmarks = [], onSelectBookmark, onDeleteBookmark }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} activeOpacity={1} onPress={onClose} />
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '85%', backgroundColor: '#fff', padding: 16 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 6, padding: 4, alignItems: 'center', width: '100%' }}>
            <TouchableOpacity style={{ flex: 1, borderRadius: 999, overflow: 'hidden' }} onPress={() => onChangeTab && onChangeTab('chapters')}>
              <View style={{ borderRadius: 999, paddingVertical: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: activeTab === 'chapters' ? '#008655' : 'transparent' }}>
                <Text style={{ color: activeTab === 'chapters' ? '#fff' : '#9e9e9e', fontWeight: activeTab === 'chapters' ? '700' : '400' }}>Розділи</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, borderRadius: 999, overflow: 'hidden' }} onPress={() => onChangeTab && onChangeTab('bookmarks')}>
              <View style={{ borderRadius: 999, paddingVertical: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: activeTab === 'bookmarks' ? '#008655' : 'transparent' }}>
                <Text style={{ color: activeTab === 'bookmarks' ? '#fff' : '#9e9e9e', fontWeight: activeTab === 'bookmarks' ? '700' : '400' }}>Закладки</Text>
              </View>
            </TouchableOpacity>
          </View>

          {activeTab === 'chapters' ? (
            <ScrollView style={{ flex: 1, marginTop: 12 }}>
              {chapters.map((ch, idx) => {
                const isRead = readIds.includes(ch.id);
                const isCurrent = (currentIndex === (idx + 1)) || (currentId === ch.id);
                const isExpanded = expandedIds.includes(ch.id);
                return (
                  <View key={ch.id} style={{ marginBottom: 8 }}>
                    <TouchableOpacity style={{ paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: isCurrent ? '#008655' : '#e0e0e0', borderRadius: 12, backgroundColor: isCurrent ? '#0086551A' : '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: isRead ? 0.7 : 1 }} onPress={() => onSelectChapter(ch)}>
                      <Text style={{ color: isCurrent ? '#008655' : '#000', fontWeight: isCurrent ? '700' : '400' }}>{ch.title}</Text>
                      {ch.children && ch.children.length > 0 && (
                        <TouchableOpacity onPress={() => onToggleExpand(ch.id)}>
                          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                    {isExpanded && ch.children && ch.children.length > 0 && (
                      <View style={{ marginLeft: 16, marginTop: 8 }}>
                        {ch.children.map((sub) => {
                          const subRead = readIds.includes(sub.id);
                          const subCurrent = currentId === sub.id;
                          return (
                            <TouchableOpacity key={sub.id} style={{ paddingVertical: 8 }} onPress={() => onSelectChapter(sub)}>
                              <Text style={{ color: subCurrent ? '#008655' : '#000', fontWeight: subCurrent ? '700' : '400', opacity: subRead ? 0.7 : 1 }}>↳ {sub.title}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, marginTop: 12 }}>
              {(!bookmarks || bookmarks.length === 0) ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Image source={bookmarkIcon} style={{ width: 110, height: 110, opacity: 0.5, marginBottom: 12 }} />
                  <Text style={{ color: '#000' }}>Закладок поки що немає</Text>
                </View>
              ) : (
                <ScrollView>
                  {bookmarks.map((bm) => (
                    <TouchableOpacity key={bm.id} onPress={() => onSelectBookmark && onSelectBookmark(bm)} onLongPress={() => onDeleteBookmark && onDeleteBookmark(bm)}>
                      <View style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, backgroundColor: '#fff', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontWeight: '700', color: '#000', marginBottom: 6 }}>{bm.type}</Text>
                          <Text style={{ color: '#666' }}>{bm.meta}</Text>
                        </View>
                        <Text numberOfLines={2} style={{ color: bm.kind === 'highlight' ? '#0a8f5b' : '#444' }}>{bm.text}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          <View style={{ paddingTop: 8, paddingBottom: 12, alignItems: 'flex-start' }}>
            <Text style={{ color: '#008655' }}>Розділ {currentIndex} з {totalCount}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}


