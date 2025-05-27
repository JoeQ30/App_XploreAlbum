import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AchievementItem from './Items/AchievementItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const UserProfile = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const [user, setUser] = useState(null);

  // Datos del usuario que viene de la navegación o estado local
  useEffect(() => {
    if (route.params?.user) {
      setUser(route.params.user);
    }
  }, [route.params?.user]);

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Perfil de Usuario</Text>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="more-vert" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={60} color="#666" />
          </View>
          <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
          <Text style={styles.userLocation}>{user?.ubicacion || 'Ubicación no especificada'}</Text>
        </View>

        {/* Información del usuario */}
        <View style={styles.profileForm}>
          <View style={styles.infoRow}>
            <Icon name="email" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>{user?.correo || 'Correo no disponible'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="info" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {user?.biografia || 'Este usuario no ha agregado una biografía'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="calendar-today" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Miembro desde: {user?.fecha_registro?.slice(0, 4) || 'Año no disponible'}
            </Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Logros 🏆</Text>
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
          </View>
          <View style={styles.statisticsContainer}>
            <View style={styles.statisticItem}>
              <View style={styles.chartIcon}>
                <Icon name="trending-up" size={30} color="#8BC34A" />
              </View>
              <View style={styles.statisticInfo}>
                <Text style={styles.statisticTitle}>Progreso</Text>
                <Text style={styles.statisticDescription}>
                  Ha descubierto 16 de 30 lugares
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
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 10,
  },
  logoText: {
    fontSize: 20,
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
    paddingVertical: 25,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
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
});

export default UserProfile;