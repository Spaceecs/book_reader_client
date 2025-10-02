import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { HomeStack } from './stacks/HomeStack';
import LibraryScreen from '../../screens/LibraryScreen';
import {pickBook} from "../../features";

const Tab = createBottomTabNavigator();

export function MainTabs() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const baseStyle = {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60 + (insets?.bottom || 0),
          paddingTop: 8,
          paddingBottom: Math.max(insets?.bottom || 0, 8),
        };
        let tabBarStyle = baseStyle;
        if (route.name === 'HomeTab') {
          const nested = getFocusedRouteNameFromRoute(route) ?? 'Home';
          const shouldHide = nested === 'PdfReaderScreen' || nested === 'EpubReaderScreen';
          if (shouldHide) tabBarStyle = { ...baseStyle, display: 'none' };
        }
        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle,
          tabBarActiveTintColor: '#2E8B57',
          tabBarInactiveTintColor: '#666',
          tabBarIcon: ({ color, size, focused }) => {
            const base = {
              HomeTab: ['home-outline', 'home'],
              LibraryTab: ['library-outline', 'library'],
              ImportTab: ['download-outline', 'download'],
              ProfileTab: ['person-outline', 'person'],
              PremiumTab: ['diamond-outline', 'diamond'],
            };
            const [inactive, active] = base[route.name] || ['ellipse-outline', 'ellipse'];
            const iconName = focused ? active : inactive;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        };
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: t('tabs.Home') }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen}
        options={{ tabBarLabel: t('tabs.Library') }}
      />
        <Tab.Screen
            name="ImportTab"
            component={View} // компонент не буде відкриватися
            options={{ tabBarLabel: t('tabs.Import') }}
            listeners={{
                tabPress: (e) => {
                    e.preventDefault();
                    (async () => {
                        try {
                            await pickBook();
                        } catch (err) {
                            console.error('Помилка при імпорті книги:', err);
                        }
                    })();
                },
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


