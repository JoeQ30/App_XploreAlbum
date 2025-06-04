import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import BottomNavigation from './BottomNavigation';
import AlbumScreen from './AlbumScreen';
import CameraScreen from './CameraScreen';
import FriendsScreen from './FriendsScreen';
import ProfileScreen from './ProfileScreen';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppNavigator = () => {
  const [activeTab, setActiveTab] = useState('Album');
  const [loguedUser, setLoguedUser] = useState(null);
  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        console.log('Fetching user data...');
        const jsonValue = await AsyncStorage.getItem('usuario');
        setLoguedUser(JSON.parse(jsonValue));
      };

      fetchUser();
    }, [])
  );

  // Función para navegar a la cámara desde el álbum
  const handleNavigateToCamera = () => {
    setActiveTab('Cámara');
  };

  const renderActiveScreen = () => {
    switch(activeTab) {
      case 'Cámara':
        return <CameraScreen />;
      case 'Album':
        return <AlbumScreen onNavigateToCamera={handleNavigateToCamera} />;
      case 'Amigos':
        return <FriendsScreen />;
      case 'Perfil':
        return <ProfileScreen />;
      default:
        return <ProfileScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>
      <BottomNavigation 
        activeTab={activeTab} 
        onTabPress={setActiveTab} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  screenContainer: {
    flex: 1,
  },
});

export default AppNavigator;