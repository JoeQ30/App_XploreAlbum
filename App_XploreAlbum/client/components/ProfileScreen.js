import React, { useCallback , useState } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
  obtenerCantidadColeccionablesDesbloqueados, 
  obtenerCantidadSeguidores, 
  obtenerCantidadSeguidos,
  obtenerUsuarioPorId
} from '../services/api';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [loguedUser, setLoguedUser] = useState(null);
  const [seguidores, setSeguidores] = useState(0);
  const [siguiendo, setSiguiendo] = useState(0);
  const [desbloqueables, setDesbloqueables] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('usuario');
          if (jsonValue != null) {
            const parsedUser = JSON.parse(jsonValue);
            setLoguedUser(parsedUser);
            console.log('Usuario cargado:', parsedUser);

            const id = parsedUser.id;
            const seguidoresValue = await obtenerCantidadSeguidores(id);
            const siguiendoValue = await obtenerCantidadSeguidos(id);
            const desbloqueablesValue = await obtenerCantidadColeccionablesDesbloqueados(id);

            setSeguidores(seguidoresValue);
            setSiguiendo(siguiendoValue);
            setDesbloqueables(desbloqueablesValue);

          }
        } catch (e) {
          console.error('Error al cargar el usuario:', e);
        }
      };

      loadUser();
    }, [])
  );


  const handleLogOut = async () => {
  try {
    await AsyncStorage.multiRemove(['usuario', 'token']);
    //console.log('[PROFILE]: Usuario desconectado');

    // Redirigir y limpiar historial de navegación
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } catch (e) {
    console.error('Error al cerrar sesión:', e);
  }
};

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

  const memberSince = loguedUser?.fecha_registro?.slice(0, 4) || 'Año no disponible';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="#4A4A4A" 
        barStyle="light-content"
        accessible={true}
        accessibilityLabel="Barra de estado con fondo gris oscuro"
      />
      
      {/* Header */}
      <View 
        style={[styles.header, { paddingTop: insets.top }]}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Encabezado de la pantalla de perfil"
      >
        <View 
          style={styles.logoContainer}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel="Logo de la aplicación y título de perfil"
        >
          <Text style={styles.logoX}>
            <Image 
              source={require('../assets/images/logo/LogoXVerde.png')} 
              style={styles.logoImage}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="Logo de la aplicación X en color verde"
              accessibilityRole="image"
            />
          </Text>
          <Text 
            style={styles.logoText}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel="Título de la sección: Perfil"
          >
            Perfil
          </Text>
        </View>
        <View 
          style={styles.headerIcons}
          accessible={true}
          accessibilityRole="toolbar"
          accessibilityLabel="Botones de navegación del encabezado"
        >
          <TouchableOpacity 
            style={styles.headerIcon} 
            onPress={handleLogOut}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            accessibilityHint="Toca para cerrar sesión"
          >
            <Icon name="logout" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon} 
            onPress={() => navigation.navigate('Notifications')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ir a notificaciones"
            accessibilityHint="Toca para ver tus notificaciones"
          >
            <Icon name="notifications" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            accessible={true}
            onPress={() => navigation.navigate('Configuration')}
            accessibilityRole="button"
            accessibilityLabel="Abrir configuración"
            accessibilityHint="Toca para acceder a la configuración"
          >
            <Icon name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Contenido del perfil, desliza para ver más información"
      >
        {/* Profile Avatar */}
        <View 
          style={styles.avatarContainer}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel="Foto de perfil del usuario"
        >
          <View 
            style={styles.avatar}
            accessible={true}
            accessibilityLabel="Avatar predeterminado del usuario, icono de persona"
          >
            <Icon name="person" size={60} color="#666" />
          </View>
          <Text 
            style={styles.userName}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Nombre de usuario: ${loguedUser?.nombre || 'Usuario'}`}
          >
            {loguedUser?.nombre || 'Usuario'}
          </Text>
          <Text 
            style={styles.userLocation}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Ubicación: ${loguedUser?.ubicacion || 'Ubicación no especificada'}`}
          >
            {loguedUser?.ubicacion || 'Ubicación no especificada'}
          </Text>
        </View>

        {/* Followers and Following Section */}
        <View 
          style={styles.socialStatsContainer}
          accessible={true}
          accessibilityLabel="Estadísticas sociales del usuario"
        >
          <TouchableOpacity 
            style={styles.socialStatItem}
            onPress={() => navigation.navigate('Followers')}
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
            onPress={() => navigation.navigate('Following')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Siguiendo: ${siguiendo || 0}`}
            accessibilityHint="Toca para ver la lista de usuarios que sigues"
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

         {/* Información del usuario */}
        <View 
          style={styles.profileForm}
          accessible={true}
          accessibilityLabel="Información del perfil del usuario"
        >
          <View 
            style={styles.infoRow}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Correo electrónico: ${loguedUser?.correo || 'Correo no disponible'}`}
          >
            <Icon 
              name="email" 
              size={20} 
              color="#666" 
              style={styles.infoIcon}
              accessible={false}
            />
            <Text style={styles.infoText}>
              {loguedUser?.correo || 'Correo no disponible'}
            </Text>
          </View>
          
          <View 
            style={styles.infoRow}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Biografía: ${loguedUser?.biografia || 'Soy nuevo en la app, ¡encantado de conocerte!'}`}
          >
            <Icon 
              name="3p" 
              size={20} 
              color="#666" 
              style={styles.infoIcon}
              accessible={false}
            />
            <Text style={styles.infoText}>
              {loguedUser?.biografia || 'Soy nuevo en la app, ¡encantado de conocerte!'}
            </Text>
          </View>
          
          <View 
            style={styles.infoRow}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Miembro desde el año ${memberSince}`}
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
          <View 
            style={styles.sectionHeader}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel="Encabezado de la sección de logros"
          >
            <Text 
              style={styles.sectionTitle}
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel="Título: Logros"
            >
              Logros 🏆
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Achievements')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ver todos los logros"
              accessibilityHint="Toca para ir a la pantalla completa de logros"
            >
              <Icon name="keyboard-arrow-right" size={24} color="#8BC34A" />
            </TouchableOpacity>
          </View>
          <View 
            style={styles.achievementsContainer}
            accessible={true}
            accessibilityLabel={`Lista de logros, ${achievements.length} elementos`}
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
    marginBottom: 20,
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