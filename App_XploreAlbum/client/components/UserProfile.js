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

  const memberSince = user?.fecha_registro?.slice(0, 4) || 'Año no disponible';

  return (
    <SafeAreaView 
      style={styles.container}
      accessible={true}
      accessibilityLabel={`Perfil de usuario de ${user?.nombre || 'Usuario desconocido'}`}
    >
      <StatusBar backgroundColor="#4A4A4A" barStyle="light-content" />
      
      {/* Header */}
      <View 
        style={[styles.header, { paddingTop: insets.top }]}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Barra de navegación del perfil"
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Volver atrás"
          accessibilityHint="Toca para regresar a la pantalla anterior"
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text 
            style={styles.logoText}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Título de la pantalla: Perfil de Usuario"
          >
            Perfil de Usuario
          </Text>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIcon}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Más opciones"
            accessibilityHint="Toca para ver más opciones del perfil"
          >
            <Icon name="more-vert" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Contenido del perfil de usuario"
        accessibilityRole="scrollbar"
      >
        {/* Profile Avatar */}
        <View 
          style={styles.avatarContainer}
          accessible={true}
          accessibilityLabel={`Información básica de ${user?.nombre || 'Usuario'}`}
          accessibilityRole="summary"
        >
          <View 
            style={styles.avatar}
            accessible={true}
            accessibilityLabel={`Foto de perfil de ${user?.nombre || 'Usuario'}`}
            accessibilityRole="image"
          >
            <Icon 
              name="person" 
              size={60} 
              color="#666"
              accessible={false}
            />
          </View>
          <Text 
            style={styles.userName}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Nombre de usuario: ${user?.nombre || 'Usuario'}`}
          >
            {user?.nombre || 'Usuario'}
          </Text>
          <Text 
            style={styles.userLocation}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Ubicación: ${user?.ubicacion || 'Ubicación no especificada'}`}
          >
            {user?.ubicacion || 'Ubicación no especificada'}
          </Text>
        </View>

        {/* Información del usuario */}
        <View 
          style={styles.profileForm}
          accessible={true}
          accessibilityLabel="Información detallada del usuario"
          accessibilityRole="group"
        >
          <View 
            style={styles.infoRow}
            accessible={true}
            accessibilityLabel={`Correo electrónico: ${user?.correo || 'Correo no disponible'}`}
            accessibilityRole="text"
          >
            <Icon 
              name="email" 
              size={20} 
              color="#666" 
              style={styles.infoIcon}
              accessible={false}
            />
            <Text style={styles.infoText}>
              {user?.correo || 'Correo no disponible'}
            </Text>
          </View>
          
          <View 
            style={styles.infoRow}
            accessible={true}
            accessibilityLabel={`Biografía: ${user?.biografia || 'Este usuario no ha agregado una biografía'}`}
            accessibilityRole="text"
          >
            <Icon 
              name="info" 
              size={20} 
              color="#666" 
              style={styles.infoIcon}
              accessible={false}
            />
            <Text style={styles.infoText}>
              {user?.biografia || 'Este usuario no ha agregado una biografía'}
            </Text>
          </View>
          
          <View 
            style={styles.infoRow}
            accessible={true}
            accessibilityLabel={`Miembro desde el año ${memberSince}`}
            accessibilityRole="text"
          >
            <Icon 
              name="calendar-today" 
              size={20} 
              color="#666" 
              style={styles.infoIcon}
              accessible={false}
            />
            <Text style={styles.infoText}>
              Miembro desde: {memberSince}
            </Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View 
          style={styles.section}
          accessible={true}
          accessibilityLabel="Sección de logros del usuario"
          accessibilityRole="group"
        >
          <View style={styles.sectionHeader}>
            <Text 
              style={styles.sectionTitle}
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel="Logros obtenidos"
            >
              Logros 🏆
            </Text>
          </View>
          <View 
            style={styles.achievementsContainer}
            accessible={true}
            accessibilityLabel={`Lista de logros: ${achievements.length} logros disponibles`}
            accessibilityRole="list"
          >
            {achievements.map((achievement, index) => (
              <View
                key={achievement.id}
                accessible={true}
                accessibilityLabel={`Logro ${index + 1} de ${achievements.length}: ${achievement.title}. ${achievement.description}`}
                accessibilityRole="listitem"
              >
                <AchievementItem
                  icon={achievement.icon}
                  title={achievement.title}
                  description={achievement.description}
                  iconBg={achievement.iconBg}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Statistics Section */}
        <View 
          style={styles.section}
          accessible={true}
          accessibilityLabel="Sección de estadísticas del usuario"
          accessibilityRole="group"
        >
          <View style={styles.sectionHeader}>
            <Text 
              style={styles.sectionTitle}
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel="Estadísticas de progreso"
            >
              Estadísticas
            </Text>
          </View>
          <View 
            style={styles.statisticsContainer}
            accessible={true}
            accessibilityLabel="Información de estadísticas"
            accessibilityRole="group"
          >
            <View 
              style={styles.statisticItem}
              accessible={true}
              accessibilityLabel="Progreso de descubrimiento: Ha descubierto 16 de 30 lugares"
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 30, now: 16 }}
            >
              <View 
                style={styles.chartIcon}
                accessible={true}
                accessibilityLabel="Icono de tendencia ascendente"
                accessibilityRole="image"
              >
                <Icon 
                  name="trending-up" 
                  size={30} 
                  color="#8BC34A"
                  accessible={false}
                />
              </View>
              <View style={styles.statisticInfo}>
                <Text 
                  style={styles.statisticTitle}
                  accessible={true}
                  accessibilityRole="text"
                  accessibilityLabel="Título de estadística: Progreso"
                >
                  Progreso
                </Text>
                <Text 
                  style={styles.statisticDescription}
                  accessible={true}
                  accessibilityRole="text"
                  accessibilityLabel="Descripción: Ha descubierto 16 de 30 lugares disponibles"
                >
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