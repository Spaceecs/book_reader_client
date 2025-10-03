import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChangeLanguage } from '../features';
import {useTranslation} from "react-i18next";
import {logout} from "../entities";
import {useDispatch} from "react-redux";

const Row = ({ left, right, onPress, isDestructive = false }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={styles.row}>
    <Text style={[styles.rowLabel, isDestructive && styles.destructive]}>{left}</Text>
    {right || <Ionicons name="chevron-forward" size={18} color="#8C8C8C" />}
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
    const {t} = useTranslation();
    const dispatch = useDispatch();
  const [brightnessGesture, setBrightnessGesture] = useState(false);
  const [keepScreenOn, setKeepScreenOn] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.headerLeft}>
          <Image source={require('../../assets/weui_arrow-filled (1).png')} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>{t("settings.settings")}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.card}>
            <Row left={t("settings.language")} onPress={() => navigation && navigation.navigate && navigation.navigate('ChangeLanguage')} />
        </View>

        <View style={styles.card}>
          <View style={styles.switchRowWrapper}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>{t("settings.brightnessGesture")}</Text>
              <Text style={styles.switchSubtitle}>{t("settings.brightnessDescription")}</Text>
            </View>
            <Switch value={brightnessGesture} onValueChange={setBrightnessGesture} trackColor={{ true: '#9bd3bf', false: '#ddd' }} thumbColor={brightnessGesture ? '#2E8B57' : '#f5f5f5'} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.switchRowWrapper}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>{t("settings.screenOff")}</Text>
              <Text style={styles.switchSubtitle}>{t("settings.screenOffDescription")}</Text>
            </View>
            <Switch value={keepScreenOn} onValueChange={setKeepScreenOn} trackColor={{ true: '#9bd3bf', false: '#ddd' }} thumbColor={keepScreenOn ? '#2E8B57' : '#f5f5f5'} />
          </View>
        </View>

        <View style={styles.card}>
          <Row left={t("settings.scanFiles")} onPress={() => {}} />
          <View style={styles.separator} />
          <Row left={t("settings.changePassword")} onPress={() => navigation && navigation.navigate && navigation.navigate('SettingsChangePassword')} />
          <View style={styles.separator} />
          <Row left={t("settings.deviceList")} onPress={() => navigation && navigation.navigate && navigation.navigate('SettingsDevices')} />
          <View style={styles.separator} />
          <Row left={t('settings.changeEmail', 'Змінити пошту')} onPress={() => navigation && navigation.navigate && navigation.navigate('SettingsChangeEmail')} />
          <View style={styles.separator} />
          <View style={styles.switchRowOnly}>
            <Text style={styles.rowLabel}>{t("settings.onlyWIFIDownload")}</Text>
            <Switch value={wifiOnly} onValueChange={setWifiOnly} trackColor={{ true: '#9bd3bf', false: '#ddd' }} thumbColor={wifiOnly ? '#2E8B57' : '#f5f5f5'} />
          </View>
        </View>

          <View style={styles.card}>
              <Row left={t("settings.support")} onPress={() => {}} isDestructive />
              <View style={styles.separator} />
              <Row left={t("settings.rateApp")} onPress={() => {}} />
              <View style={styles.separator} />
              <Row left={t("settings.aboutApp")} onPress={() => {}} />
          </View>

        <TouchableOpacity style={styles.logout} onPress={() => logout(dispatch, navigation)}>
          <Text style={styles.logoutText}>{t("settings.logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { padding: 4 },
  titleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F0F0F' },
  headerRight: { width: 22 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6E6E6', padding: 12, marginHorizontal: 16, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowLabel: { color: '#0F0F0F' },
  destructive: { color: '#e11d48' },
  switchRowWrapper: { flexDirection: 'row', alignItems: 'center' },
  switchTitle: { color: '#0F0F0F', fontWeight: '600' },
  switchSubtitle: { color: '#8C8C8C', fontSize: 12 },
  switchRowOnly: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  separator: { height: 1, backgroundColor: '#eee' },
  logout: { marginTop: 16, marginHorizontal: 16, borderRadius: 12, backgroundColor: '#efefef', alignItems: 'center', paddingVertical: 12 },
  logoutText: { color: '#e11d48', fontWeight: '700' },
  sectionTitle: { color: '#0F0F0F', fontWeight: '700', marginBottom: 8 },
});
