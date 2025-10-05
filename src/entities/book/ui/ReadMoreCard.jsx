import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
    Easing,
    StyleSheet,
    Alert
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { getOnlineBookById } from "../../../shared";
import * as FileSystem from "expo-file-system/legacy";
import {useNavigation} from "@react-navigation/native";
import {openOnlineBook} from "../utils/openOnlineBook";
import {openLocalBook} from "../utils/openLocalBook";
import {useDispatch} from "react-redux";

const ACTION_BUTTON_WIDTH = 120;
const ACTION_PEEK_WIDTH = 96;

export function ReadMoreCard({ book }) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

    const deletePng = require('../../../../assets/Delete_Colection.png');
    const postponedPng = require('../../../../assets/Vidckad.png');

    const progressPercent = book.totalPages > 0
        ? (book.currentPage / book.totalPages) * 100
        : 0;


    const addToPostponed = (item) => {
        // тут твій toast або будь-яка логіка
        console.log("Закинуто:", item.title);
    };

    const deleteBook = (item) => {
        // тут твоя логіка видалення
        console.log("Видалено:", item.title);
    };

    const handlePress = async () => {
        console.log(book.title, book.filePath, book.format, book.base64);
        if (book.onlineId) {
            await openOnlineBook( book.onlineId, book ,dispatch, navigation)
        } else {
            await openLocalBook( book.id, book, dispatch, navigation );
        }
    }

    const renderLeftActions = (item, progress, dragX) => {
        const opacity = progress.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0, 0.7, 1],
            extrapolate: 'clamp',
        });
        const scale = dragX.interpolate({
            inputRange: [0, 20, ACTION_PEEK_WIDTH],
            outputRange: [0.9, 0.97, 1],
            extrapolate: 'clamp',
        });
        const translateX = dragX.interpolate({
            inputRange: [0, ACTION_PEEK_WIDTH],
            outputRange: [-ACTION_PEEK_WIDTH * 0.3, 0],
            extrapolate: 'clamp',
        });
        return (
            <Animated.View style={[
                styles.leftActionContainer,
                { width: ACTION_PEEK_WIDTH, flex: 0, marginLeft: 0, marginRight: 0, transform: [{ translateX }] },
            ]}>
                <AnimatedTouchable
                    style={[
                        styles.pinAction,
                        { width: ACTION_BUTTON_WIDTH, opacity, transform: [{ scale }] },
                    ]}
                    onPress={() => addToPostponed(item)}
                    activeOpacity={0.9}
                >
                    <Image source={postponedPng} style={{ width: 22, height: 22, tintColor: '#fff', resizeMode: 'contain', marginBottom: 8 }} />
                    <Text style={styles.pinActionText}>Закинути</Text>
                </AnimatedTouchable>
            </Animated.View>
        );
    };

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
                    onPress={() => deleteBook(item)}
                    activeOpacity={0.9}
                >
                    <Image source={deletePng} style={{ width: 24, height: 24, tintColor: '#fff', resizeMode: 'contain', marginBottom: 8 }} />
                    <Text style={styles.deleteActionText}>Видалити</Text>
                </AnimatedTouchable>
            </Animated.View>
        );
    };

    const getPlaceholder = () => {
        if (book?.filePath?.endsWith('.pdf')) return require('../../../../assets/pdf_placeholder.png');
        if (book?.filePath?.endsWith('.epub')) return require('../../../../assets/epub_placeholder.png');
        return require('../../../../assets/placeholder-cover.png');
    };

    const isPlaceholder = !book?.imageUrl;

    if (!book) return null;

    return (
        <Swipeable
            renderLeftActions={(progress, dragX) => renderLeftActions(book, progress, dragX)}
            renderRightActions={(progress, dragX) => renderRightActions(book, progress, dragX)}
            overshootLeft={false}
            overshootRight={false}
            friction={1.2}
            leftThreshold={40}
            rightThreshold={40}
        >
            <View style={styles.card}>
                <Image
                    source={isPlaceholder ? getPlaceholder() : { uri: book.imageUrl }}
                    style={[styles.cover, isPlaceholder && { resizeMode: 'contain', padding: 16 }]}
                />
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                        {book.title}
                    </Text>
                    <Text style={styles.author}>{book.author}</Text>
                    <Text style={styles.pageInfo}>Сторінка {book.currentPage} з {book.totalPages}</Text>
                    <View style={styles.progressBarWrapper}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{book.progress}%</Text>
                    </View>
                    <TouchableOpacity onPress={handlePress}>
                        <Text style={styles.continueButtonText}>{t("continueReading")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    card: {
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
        marginHorizontal: 24,
    },
    cover: {
        width: 100,
        height: 150,
        backgroundColor: '#f5f5f5',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 2,
    },
    author: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    pageInfo: {
        fontSize: 13,
        color: '#8C8C8C',
        marginBottom: 2,
    },
    progressBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginRight: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2E8B57',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#2E8B57',
        fontWeight: '600',
        minWidth: 32,
        textAlign: 'right',
    },
    continueButtonText: {
        color: '#2E8B57',
        fontSize: 14,
        fontWeight: '600',
    },
    leftActionContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 0,
        marginLeft: 16,
        marginRight: -120,
    },
    pinAction: {
        flexDirection: 'column',
        width: 120,
        height: '90%',
        backgroundColor: '#2E8B57',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -17,
    },
    pinActionText: { color: '#fff', fontWeight: '700' },

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


    toast: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopWidth: 0,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        overflow: 'hidden',
    },
    toastText: { color: '#0F0F0F', textAlign: 'center' },
    toastProgressTrack: { position: 'absolute', left: 0, right: 0, top: 0, height: 3, backgroundColor: '#eaeaea' },
    toastProgressFill: { position: 'absolute', left: 0, top: 0, height: 3, backgroundColor: '#2E8B57' },
});