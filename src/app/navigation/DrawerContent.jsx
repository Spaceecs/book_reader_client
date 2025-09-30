import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import {useTranslation} from "react-i18next";

const DrawerContent = ({ navigation }) => {
    const { t } = useTranslation();
    const [activeItem, setActiveItem] = useState('Home');

    const handlePress = (key, navigateTo) => {
        setActiveItem(key);
        if (navigateTo) {
            navigation.navigate(navigateTo);
            navigation.closeDrawer();
        }
    };

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Image source={require("../../../assets/Logo1.png")} style={styles.logo} />
        <Text style={styles.logoText}>BookNest</Text>
      </View>

      <View style={styles.menuSection}>
        <DrawerItem
          icon={require("../../../assets/Main.png")}
          label={t('drawerMenu.Home')}
          isActive={activeItem === 'Home'}
          onPress={() => handlePress('Home', 'Home')}
        />
        <DrawerItem
          icon={require("../../../assets/collections.png")}
          label={t('drawerMenu.Collections')}
          isActive={activeItem === 'Collections'}
          onPress={() => handlePress('Collections', 'Collections')}
        />
        <DrawerItem
          icon={require("../../../assets/Book.png")}
          label={t('drawerMenu.readMore')}
          isActive={activeItem === 'ReadMore'}
          onPress={() => handlePress('ReadMore', 'ReadMore')}
        />
        <DrawerItem
          icon={require("../../../assets/basket.png")}
          label={t('drawerMenu.Trash')}
          isActive={activeItem === 'Trash'}
          onPress={() => handlePress('Trash', 'Trash')}
        />
      </View>

      <View style={styles.divider} />
      <View style={styles.menuSection}>
        <DrawerItem
          icon={require("../../../assets/settings.png")}
          label={t('drawerMenu.Settings')}
          isActive={activeItem === 'Settings'}
          onPress={() => handlePress('Settings', 'Settings')}
        />
        <DrawerItem
          icon={require("../../../assets/feedback.png")}
          label={t('drawerMenu.Feedback')}
          isActive={activeItem === 'Feedback'}
          onPress={() => handlePress('Feedback')}
        />
      </View>
    </View>
  );
};

const DrawerItem = ({ icon, label, isActive, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Image source={icon} style={[styles.itemIcon, isActive && styles.itemIconActive]} />
    <Text style={[styles.itemText, isActive && styles.itemTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 48,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#008655",
  },
  menuSection: {
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  itemIcon: {
    width: 22,
    height: 22,
    marginRight: 18,
    resizeMode: 'contain',
    tintColor: '#222',
  },
  itemIconActive: {
    tintColor: '#008655',
  },
  itemText: {
    fontSize: 16,
    color: "#222",
  },
  itemTextActive: {
    color: '#008655',
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
    marginHorizontal: 20,
  },
});

export default DrawerContent;
