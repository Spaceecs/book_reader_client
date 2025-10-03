import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

const deletePng = require('../../../../assets/Delete_Colection.png');

export function TrashBookCard({ item, onRestore, onDeleteForever }) {
    const { t } = useTranslation();

    const progressPercent = item.totalPages > 0
        ? (item.currentPage / item.totalPages) * 100
        : 0;

    const ACTION_BUTTON_WIDTH = 120;
    const ACTION_PEEK_WIDTH = 96;
    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

    const renderRightActions = (item, progress, dragX) => {
        const opacity = progress.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0, 0.7, 1],
            extrapolate: 'clamp',
        });
        const scale = dragX.interpolate({
            inputRange: [-ACTION_PEEK_WIDTH, -20, 0],
            outputRange: [1, 0.97, 0.9],
            extrapolate: 'clamp',
        });
        const translateX = dragX.interpolate({
            inputRange: [-ACTION_PEEK_WIDTH, 0],
            outputRange: [0, ACTION_PEEK_WIDTH * 0.3],
            extrapolate: 'clamp',
        });
        return (
            <Animated.View style={[
                styles.rightActionContainer,
                { width: ACTION_PEEK_WIDTH, flex: 0, marginLeft: 0, marginRight: 0, transform: [{ translateX }] },
            ]}>
                <AnimatedTouchable
                    style={[
                        styles.deleteAction,
                        { width: ACTION_BUTTON_WIDTH, opacity, transform: [{ scale }] },
                    ]}
                    onPress={() => onDeleteForever(item)}
                    activeOpacity={0.9}
                >
                    <Image source={deletePng} style={{ width: 24, height: 24, tintColor: '#fff', resizeMode: 'contain', marginBottom: 8 }} />
                    <Text style={styles.deleteActionText}>{t('trashBookCard.deleteForever')}</Text>
                </AnimatedTouchable>
            </Animated.View>
        );
    };

    return (
        <Swipeable
            renderRightActions={(progress, dragX) => renderRightActions(item, progress, dragX)}
            overshootRight={false}
            friction={1.2}
            rightThreshold={40}
        >
            <View style={styles.card}>
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.cover}
                    defaultSource={require('../../../../assets/placeholder-cover.png')}
                />
                <View style={styles.info}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        <TouchableOpacity style={styles.restoreBtn} onPress={() => onRestore(item)}>
                            <Ionicons name="refresh" size={14} color="#2E8B57" />
                            <Text style={styles.restoreBtnText}>{t('trashBookCard.restore')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.author}>{item.author}</Text>
                    <Text style={styles.pageInfo}>
                        {t('trashBookCard.pageInfo', { currentPage: item.currentPage, totalPages: item.totalPages })}
                    </Text>
                    <View style={styles.progressBarWrapper}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{Math.round(progressPercent * 10) / 10}%</Text>
                    </View>
                    <Text style={styles.removedAgo}>
                        {t('trashBookCard.removedAgo', { deletedAt: item.deletedAt })}
                    </Text>
                </View>
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        alignItems: 'center',
    },
    cover: {
        width: 100,
        height: 150,
        backgroundColor: '#f5f5f5',
        marginRight: 16,
    },
    info: { flex: 1 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 16, fontWeight: '700', color: '#000', flex: 1, paddingRight: 12 },
    author: { fontSize: 14, color: '#666', marginTop: 2, marginBottom: 4 },
    pageInfo: { fontSize: 13, color: '#8C8C8C', marginBottom: 2 },
    progressBarWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, marginRight: 8 },
    progressBarFill: { height: '100%', backgroundColor: '#2E8B57', borderRadius: 3 },
    progressText: { fontSize: 12, color: '#2E8B57', fontWeight: '600', minWidth: 32, textAlign: 'right' },
    removedAgo: { fontSize: 12, color: '#8C8C8C' },
    restoreBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2E8B57', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
    restoreBtnText: { color: '#2E8B57', fontSize: 13, fontWeight: '600', marginLeft: 6 },


    rightActionContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: 0,
        marginRight: 16,
        marginLeft: -120,
    },
    deleteAction: {
        width: 120,
        height: '90%',
        backgroundColor: '#ef4444',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -17,
    },
    deleteActionText: { color: '#fff', fontWeight: '700' },

});
