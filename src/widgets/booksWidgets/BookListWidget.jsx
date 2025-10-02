import React, { useEffect } from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import { useAuthRefresh } from "../../shared";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { HomeBookCard, getMe, selectId } from "../../entities";
import {useNavigation} from "@react-navigation/native";

export function BookListWidget({sectionHeader, books, setSelectedItem, setIsActionsVisible}) {
    useAuthRefresh();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const id = useSelector(selectId);

    useEffect(() => {
        if (id) {
            getMe(dispatch);
        }
    }, [id]);

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t(sectionHeader)}</Text>
                <TouchableOpacity onPress={() => {
                    const params = sectionHeader === 'novelty'
                        ? { titleKey: 'novelty', sortBy: 'createdAt', sortOrder: 'desc' }
                        : { titleKey: 'topRated', sortBy: 'avgRating', sortOrder: 'desc', minRating: 0 };
                    navigation.navigate('Category', params);
                }}>
                    <Text style={styles.seeAll}>{t('more')}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={books}
                renderItem={({ item }) => (
                    <HomeBookCard book={item} setSelectedItem={setSelectedItem} setIsActionsVisible={setIsActionsVisible} />
                )}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalBooksContainer}
            />
        </View>

    );
}

const styles = StyleSheet.create({
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
