import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function SettingsChangePassword({ navigation }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');

  const canSubmit = useMemo(() => current.length >= 6 && next.length >= 6 && repeat === next, [current, next, repeat]);

  return (
    <View style={[styles.container, { backgroundColor: '#f5f5f7' }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.headerLeft}>
          <Image source={require('../../assets/weui_arrow-filled (1).png')} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>{t('settings.changePassword')}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.card}>
        <Text style={{ color: '#8C8C8C', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
          {t('resetPassword.subtitle')}
        </Text>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text style={{ color: '#0F0F0F', marginBottom: 6 }}>{t('resetPassword.passwordLabel')}</Text>
          <TextInput style={styles.input} placeholder={t('resetPassword.passwordPlaceholder')} secureTextEntry value={current} onChangeText={setCurrent} />
          <Text style={{ color: '#0F0F0F', marginBottom: 6 }}>{t('resetPassword.passwordLabel')}</Text>
          <TextInput style={styles.input} placeholder={t('resetPassword.passwordPlaceholder')} secureTextEntry value={next} onChangeText={setNext} />
          <Text style={{ color: '#0F0F0F', marginBottom: 6 }}>{t('resetPassword.confirmPasswordLabel')}</Text>
          <TextInput style={[styles.input, { borderColor: repeat && repeat !== next ? '#efc2c2' : '#eee' }]} placeholder={t('resetPassword.confirmPasswordPlaceholder')} secureTextEntry value={repeat} onChangeText={setRepeat} />
          {repeat && repeat !== next ? <Text style={{ color: '#ef4444', marginBottom: 8 }}>{t('validation.confirmPassword.oneOf')}</Text> : null}
          <TouchableOpacity onPress={() => navigation && navigation.navigate && navigation.navigate('ForgotPasswordScreen')} style={{ alignSelf: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#ef4444', fontWeight: '600' }}>{t('forgotPassword.title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: canSubmit ? '#008655' : '#0086554D', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }} disabled={!canSubmit}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>{t('settings.changePassword')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  headerLeft: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, alignItems: 'center' },
  headerRight: { width: 44 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111' },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12, marginBottom: 12 },
});


