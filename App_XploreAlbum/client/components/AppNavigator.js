import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import BottomNavigation from './BottomNavigation';
import AlbumScreen from './AlbumScreen';
import CameraScreen from './CameraScreen';
import FriendsScreen from './FriendsScreen';
import ProfileScreen from './ProfileScreen';

const AppNavigator = () => {
  const [activeTab, setActiveTab] = useState('Album');

  const renderActiveScreen = () => {
    switch(activeTab) {
      case 'Cámara':
        return <CameraScreen />;
      case 'Album':
        return <AlbumScreen />;
      case 'Amigos':
        return <FriendsScreen />;
      case 'Perfil':
        return <ProfileScreen />;
      default:
        return <AlbumScreen />;
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

export default AppNavigator;