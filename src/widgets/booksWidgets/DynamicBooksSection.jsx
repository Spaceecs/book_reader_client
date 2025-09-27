import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { HomeBookCard, getAllBooks } from '../../entities';

export function DynamicBooksSection({ titleKey = 'publicBooks', params = { limit: 10 } }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAllBooks(params);
        if (mounted) setBooks(res?.books || []);
      } catch (e) {
        console.warn('Failed to fetch public books:', e);
      }
    })();
    return () => { mounted = false; };
  }, [JSON.stringify(params)]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t(titleKey)}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SearchScreen', params)}>
          <Text style={styles.seeAll}>{t('more')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={books}
        renderItem={({ item }) => <HomeBookCard book={item} />}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalBooksContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '500',
  },
  horizontalBooksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});


