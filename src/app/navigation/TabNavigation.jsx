import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { HomeScreen } from '../../screens/HomeScreen';
import LibraryScreen from '../../screens/LibraryScreen';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60 + (insets?.bottom || 0),
          paddingTop: 8,
          paddingBottom: Math.max(insets?.bottom || 0, 8),
        },
        tabBarActiveTintColor: '#2E8B57',
        tabBarInactiveTintColor: '#666',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            HomeTab: 'home',
            LibraryTab: 'library-outline',
            ImportTab: 'download-outline',
            ProfileTab: 'person-outline',
            PremiumTab: 'diamond-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: t('tabs.Home') }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen}
        options={{ tabBarLabel: t('tabs.Library') }}
      />
      <Tab.Screen
        name="ImportTab"
        component={View}
        options={{ tabBarLabel: t('tabs.Import') }}
        listeners={{
          tabPress: (e) => { e.preventDefault(); },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={View}
        options={{ tabBarLabel: t('tabs.Profile') }}
        listeners={{
          tabPress: (e) => { e.preventDefault(); },
        }}
      />
      <Tab.Screen
        name="PremiumTab"
        component={View}
        options={{ tabBarLabel: t('tabs.Premium') }}
        listeners={{
          tabPress: (e) => { e.preventDefault(); },
        }}
      />
    </Tab.Navigator>
  );
}


