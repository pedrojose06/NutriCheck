import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import DiarioScreen from './src/screens/DiarioScreen';
import PlanoScreen from './src/screens/PlanoScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';
import ConfigScreen from './src/screens/ConfigScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Diário: ['mic', 'mic-outline'],
  'Meu Plano': ['document-text', 'document-text-outline'],
  Histórico: ['time', 'time-outline'],
  Config: ['settings', 'settings-outline'],
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const [activeIcon, inactiveIcon] = TAB_ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
            return (
              <Ionicons
                name={focused ? activeIcon : inactiveIcon}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: '#1a5c3a',
          tabBarInactiveTintColor: '#b8cfc3',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e8f2ec',
            borderTopWidth: 1,
            paddingBottom: 6,
            paddingTop: 4,
            height: 62,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#111c17',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            letterSpacing: -0.3,
          },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
        })}
      >
        <Tab.Screen
          name="Diário"
          component={DiarioScreen}
          options={{ title: 'Diário' }}
        />
        <Tab.Screen
          name="Meu Plano"
          component={PlanoScreen}
          options={{ title: 'Meu Plano' }}
        />
        <Tab.Screen
          name="Histórico"
          component={HistoricoScreen}
          options={{ title: 'Histórico' }}
        />
        <Tab.Screen
          name="Config"
          component={ConfigScreen}
          options={{ title: 'Configurações' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
