import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import BottomNavigation from './BottomNavigation';
import AlbumScreen from './AlbumScreen';
import CameraScreen from './CameraScreen';
import FriendsScreen from './FriendsScreen';
import ProfileScreen from './ProfileScreen';
import { useRoute } from '@react-navigation/native';

const AppNavigator = () => {
  const [activeTab, setActiveTab] = useState('Album');
  const [user, setUser] = useState(null);
  const route = useRoute();

  useEffect(() => {
    if (route.params?.user) {
      setUser(route.params.user);
      console.log('[AppNavigator] Usuario recibido:', route.params.user);
    }
  }, [route.params?.user]);

  const renderActiveScreen = () => {
    switch(activeTab) {
      case 'Cámara':
        return <CameraScreen />;
      case 'Album':
        return <AlbumScreen user={user} />;
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

export default AppNavigator;