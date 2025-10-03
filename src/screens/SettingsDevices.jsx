import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import Constants from 'expo-constants';

export default function SettingsDevices({ navigation }) {
  const deviceInfo = useMemo(() => {
    const manifest = Constants; // keep reference minimal
    const platform = manifest?.platform || {};
    const osName = platform?.android ? 'Android' : platform?.ios ? 'iOS' : 'Unknown';
    const deviceName = manifest?.deviceName || manifest?.systemFonts?.[0] ? 'This device' : 'This device';
    const appOwnership = manifest?.appOwnership || 'standalone';
    const version = manifest?.expoRuntimeVersion || manifest?.nativeAppVersion || manifest?.nativeBuildVersion || manifest?.expoVersion || '';
    return {
      osName,
      deviceName,
      appOwnership,
      version: String(version || ''),
    };
  }, []);

  const items = [
    { key: 'device', label: 'Поточний пристрій', value: deviceInfo.deviceName },
    { key: 'os', label: 'ОС', value: deviceInfo.osName },
    { key: 'app', label: 'Тип встановлення', value: deviceInfo.appOwnership },
    { key: 'version', label: 'Версія застосунку', value: deviceInfo.version || '-' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{item.label}</Text>
      <Text style={styles.rowValue}>{item.value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.headerLeft}>
          <Image source={require('../../assets/weui_arrow-filled (1).png')} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>Список пристроїв</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Підключені пристрої</Text>
        <FlatList
          data={items}
          keyExtractor={(it) => it.key}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        <Text style={styles.note}>
          Поки що відображається поточний пристрій. Синхронізацію інших
          пристроїв можна додати після підтримки на сервері.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 12,
  },
  headerLeft: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, alignItems: 'center' },
  headerRight: { width: 44 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111' },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowLabel: { color: '#333', fontSize: 15 },
  rowValue: { color: '#111', fontSize: 15, fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#f0f0f0' },
  note: { marginTop: 12, color: '#666', fontSize: 12, lineHeight: 16 },
});


