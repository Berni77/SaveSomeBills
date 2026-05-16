import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { colors } from '../data/theme';

import HomeScreen from '../screens/HomeScreen';
import AnalyseScreen from '../screens/AnalyseScreen';
import AddScreen from '../screens/AddScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DeviceDetailScreen from '../screens/DeviceDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// Stack-Navigator für den Home-Bereich: HomeMain → DeviceDetail / Settings
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
    </HomeStack.Navigator>
  );
}

// Haupt-Navigator: BottomTab mit vier Tabs, Home verwendet eigenen Stack
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home:    focused ? 'home'      : 'home-outline',
            Analyse: focused ? 'bar-chart' : 'bar-chart-outline',
            Add:     'add',
            Profile: focused ? 'person'    : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Analyse" component={AnalyseScreen}      options={{ title: 'Analyse' }} />
      <Tab.Screen name="Add"     component={AddScreen}          options={{ title: 'Hinzufügen' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}      options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBg,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 100,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
