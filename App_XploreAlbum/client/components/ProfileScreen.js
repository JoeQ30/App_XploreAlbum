import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AchievementItem from './Items/AchievementItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [loguedUser, setLoguedUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('usuario');
        if (jsonValue != null) {
          setLoguedUser(JSON.parse(jsonValue));
          console.log('[PROFILE]: Usuario cargado:', JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error('Error al cargar el usuario:', e);
      }
    };

    loadUser();
  }, []);

  const achievements = [
    {
      id: 1,
      icon: '🏃‍♂️',
      title: 'Viajero Extremo',
      description: 'Descubre 10 lugares de difícil acceso',
      iconBg: '#E3F2FD',
    },
    {
      id: 2,
      icon: '👥',
      title: 'Viajero social',
      description: 'Consigue 20 amigos',
      iconBg: '#FFF3E0',
    },
  ];

  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A4A4A" barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoX}>
            <Image 
            source={require('../assets/images/logo/LogoXVerde.png')} 
            style={styles.logoImage}
            resizeMode="contain"
            />
          </Text>
          <Text style={styles.logoText}>Perfil</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications')}>
            <Icon name="notifications" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={60} color="#666" />
          </View>
        </View>

         {/* Información del usuario */}
        <View style={styles.profileForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.input}>
              {loguedUser?.nombre || 'Nombre de usuario'}
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.input}>
              {loguedUser?.correo || 'Nombre y Apellidos'}
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.input}>
              {loguedUser?.biografia || 'Soy nuevo en la app, ¡encantado de conocerte!'}
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.input}>
              {"Año de Registro: " + (loguedUser?.fecha_registro.slice(0, 4) || 'No disponible')}
            </Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Logros 🏆</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
              <Icon name="keyboard-arrow-right" size={24} color="#8BC34A" />
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement) => (
              <AchievementItem
                key={achievement.id}
                icon={achievement.icon}
                title={achievement.title}
                description={achievement.description}
                iconBg={achievement.iconBg}
              />
            ))}
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            <TouchableOpacity>
              <Icon name="keyboard-arrow-right" size={24} color="#8BC34A" />
            </TouchableOpacity>
          </View>
          <View style={styles.statisticsContainer}>
            <View style={styles.statisticItem}>
              <View style={styles.chartIcon}>
                <Icon name="trending-up" size={30} color="#8BC34A" />
              </View>
              <View style={styles.statisticInfo}>
                <Text style={styles.statisticTitle}>Progreso</Text>
                <Text style={styles.statisticDescription}>
                  Has descubierto 16 de 30 lugares
                </Text>
              </View>
            </View>
          </View>
        </View>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoX: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8BC34A',
    marginRight: 8,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 8,
 },
  logoText: {
    fontSize: 25,
    fontWeight: '600',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileForm: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  achievementsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statisticsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statisticItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F0F8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statisticInfo: {
    flex: 1,
  },
  statisticTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statisticDescription: {
    fontSize: 14,
    color: '#666',
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

export default ProfileScreen;