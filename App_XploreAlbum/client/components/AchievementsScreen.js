import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AchievementItem from './Items/AchievementItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listarLogros } from '../services/api';

const AchievementsScreen = ({ navigation }) => {

  const insets = useSafeAreaInsets();

  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await listarLogros(); 
        setAchievements(data);
      } catch (error) {
        console.error('Error al cargar logros:', error);
      }
    };

    fetchAchievements();
  }, []);

  // Iconos usando Material Icons
  const BackIcon = () => (
    <Icon name="arrow-back" size={24} color="white" />
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A4A4A" barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackIcon />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoX}>
            <Image 
            source={require('../assets/images/LogoXVerde.png')} 
            style={styles.logoImage}
            resizeMode="contain"
            />
          </Text>
          <Text style={styles.logoText}>Logros</Text>
        </View>
      </View>

      {/* Achievements List */}
      <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
        {achievements.map((achievement) => (
          <AchievementItem
            key={achievement.id}
            icon={achievement.icon}
            title={achievement.title}
            description={achievement.description}
            iconBg={achievement.iconBg}
            />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A4A4A',
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  backButton: {
    padding: 8,
  },
  logoX: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8BC34A',
    marginRight: 8,
  },
  logoText: {
    fontSize: 25,
    fontWeight: '600',
    color: 'white',
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  friendsList: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeTab: {
    backgroundColor: '#F0F8E8',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#8BC34A',
    fontWeight: '600',
  },
});

export default AchievementsScreen;
