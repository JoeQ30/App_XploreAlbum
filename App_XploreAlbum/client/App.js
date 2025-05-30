import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginForm from './components/LoginForm';
import AppNavigator from './components/AppNavigator'; 
import NotificationsScreen from './components/NotificationsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import UserProfile from './components/UserProfile'; 
import SplashScreen from './components/SplashScreen'; 
import RegisterScreen from './components/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  // Una vez que termina la carga, mostrar la navegación principal
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginForm} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Navigator" component={AppNavigator} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="Splash" component={SplashScreen} /> 
        <Stack.Screen name="Profile" component={UserProfile} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}