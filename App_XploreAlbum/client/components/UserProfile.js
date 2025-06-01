import React, { useEffect, useState, useCallback } from 'react';
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
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { 
  obtenerCantidadColeccionablesDesbloqueados, 
  obtenerCantidadSeguidores, 
  obtenerCantidadSeguidos 
} from '../services/api';

const UserProfile = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const [user, setUser] = useState(null);
  const [seguidores, setSeguidores] = useState(0);
  const [siguiendo, setSiguiendo] = useState(0);
  const [desbloqueables, setDesbloqueables] = useState(0);

  // Datos del usuario que viene de la navegación o estado local
  useFocusEffect(
  React.useCallback(() => {
    const loadUserData = async () => {
      try {
        if (route.params?.user) {
          const user = route.params.user;
          setUser(user);

          const id = user.id_usuario; // Asegurate de usar el nombre correcto del campo

          const seguidoresValue = await obtenerCantidadSeguidores(id);
          const siguiendoValue = await obtenerCantidadSeguidos(id);
          const desbloqueablesValue = await obtenerCantidadColeccionablesDesbloqueados(id);

          setSeguidores(seguidoresValue);
          setSiguiendo(siguiendoValue);
          setDesbloqueables(desbloqueablesValue);
        }
      } catch (e) {
        console.error('Error al cargar datos del usuario:', e);
      }
    };

    loadUserData();
  }, [route.params?.user])
);

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

        {/* Social Stats Section */}
        <View 
          style={styles.socialStatsContainer}
          accessible={true}
          accessibilityLabel="Estadísticas sociales del usuario"
        >
          <TouchableOpacity 
            style={styles.socialStatItem}
            onPress={() => navigation.navigate('UserFollowers', { userId: user?.id })}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Seguidores: ${seguidores || 0}`}
            accessibilityHint="Toca para ver la lista de seguidores"
          >
            <Text style={styles.socialStatNumber}>
              {seguidores || 0}
            </Text>
            <Text style={styles.socialStatLabel}>Seguidores</Text>
          </TouchableOpacity>
          
          <View style={styles.socialStatDivider} />
          
          <TouchableOpacity 
            style={styles.socialStatItem}
            onPress={() => navigation.navigate('UserFollowing', { userId: user?.id })}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Siguiendo: ${siguiendo || 0}`}
            accessibilityHint="Toca para ver la lista de usuarios que sigue"
          >
            <Text style={styles.socialStatNumber}>
              {siguiendo || 0}
            </Text>
            <Text style={styles.socialStatLabel}>Siguiendo</Text>
          </TouchableOpacity>
          
          <View style={styles.socialStatDivider} />
          
          <View 
            style={styles.socialStatItem}
            accessible={true}
            accessibilityLabel={`Coleccionables desbloqueados: ${desbloqueables || 0}`}
          >
            <Text style={styles.socialStatNumber}>
              {desbloqueables || 0}
            </Text>
            <Text style={styles.socialStatLabel}>Coleccionables</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View 
          style={styles.actionButtonsContainer}
          accessible={true}
          accessibilityLabel="Botones de acción para el usuario"
        >
          <TouchableOpacity 
            style={[styles.actionButton, styles.followButton]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Seguir usuario"
            accessibilityHint="Toca para seguir a este usuario"
          >
            <Icon name="person-add" size={20} color="white" />
            <Text style={styles.followButtonText}>Seguir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.collectButton]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Coleccionables"
            accessibilityHint="Toca para ver los coleccionables de este usuario"
          >
            <Icon name="stars" size={20} color="#8BC34A" />
            <Text style={styles.collectButtonText}>Coleccionables</Text>
          </TouchableOpacity>
        </View>

        {/* Información del usuario */}
        <View 
          style={styles.profileForm}
          accessible={true}
          accessibilityLabel="Información detallada del usuario"
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
              name="3p" 
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
          >
            {achievements.map((achievement, index) => (
              <View
                key={achievement.id}
                accessible={true}
                accessibilityLabel={`Logro ${index + 1} de ${achievements.length}: ${achievement.title}. ${achievement.description}`}
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
  // Nuevos estilos para las estadísticas sociales
  socialStatsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  socialStatItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  socialStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  socialStatLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  socialStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  // Nuevos estilos para los botones de acción
  actionButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  followButton: {
    backgroundColor: '#8BC34A',
  },
  collectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#8BC34A',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  collectButtonText: {
    color: '#8BC34A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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