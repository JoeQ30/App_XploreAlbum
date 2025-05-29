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
        </View>

         {/* Información del usuario */}
        <View 
          style={styles.profileForm}
          accessible={true}
          accessibilityLabel="Información del perfil del usuario"
        >
          <View 
            style={styles.inputContainer}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Nombre de usuario: ${loguedUser?.nombre || 'Nombre de usuario'}`}
          >
            <Text style={styles.input}>
              {loguedUser?.nombre || 'Nombre de usuario'}
            </Text>
          </View>
          <View 
            style={styles.inputContainer}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Correo electrónico: ${loguedUser?.correo || 'Nombre y Apellidos'}`}
          >
            <Text style={styles.input}>
              {loguedUser?.correo || 'Nombre y Apellidos'}
            </Text>
          </View>
          <View 
            style={styles.inputContainer}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Biografía: ${loguedUser?.biografia || 'Soy nuevo en la app, ¡encantado de conocerte!'}`}
          >
            <Text style={styles.input}>
              {loguedUser?.biografia || 'Soy nuevo en la app, ¡encantado de conocerte!'}
            </Text>
          </View>
          <View 
            style={styles.inputContainer}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Año de registro: ${loguedUser?.fecha_registro?.slice(0, 4) || 'No disponible'}`}
          >
            <Text style={styles.input}>
              {"Año de Registro: " + (loguedUser?.fecha_registro?.slice(0, 4) || 'No disponible')}
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
              Logros 
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

        {/* Statistics Section */}
        <View 
          style={styles.section}
          accessible={true}
          accessibilityLabel="Sección de estadísticas del usuario"
        >
          <View 
            style={styles.sectionHeader}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel="Encabezado de la sección de estadísticas"
          >
            <Text 
              style={styles.sectionTitle}
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel="Título: Estadísticas"
            >
              Estadísticas
            </Text>
            <TouchableOpacity
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ver más estadísticas"
              accessibilityHint="Toca para ver estadísticas detalladas"
            >
              <Icon name="keyboard-arrow-right" size={24} color="#8BC34A" />
            </TouchableOpacity>
          </View>
          <View 
            style={styles.statisticsContainer}
            accessible={true}
            accessibilityLabel="Contenedor de estadísticas"
          >
            <View 
              style={styles.statisticItem}
              accessible={true}
              accessibilityRole="summary"
              accessibilityLabel="Progreso: Has descubierto 16 de 30 lugares"
            >
              <View 
                style={styles.chartIcon}
                accessible={true}
                accessibilityLabel="Icono de gráfico de tendencia ascendente"
              >
                <Icon name="trending-up" size={30} color="#8BC34A" />
              </View>
              <View style={styles.statisticInfo}>
                <Text 
                  style={styles.statisticTitle}
                  accessible={true}
                  accessibilityRole="header"
                  accessibilityLabel="Título de estadística: Progreso"
                >
                  Progreso
                </Text>
                <Text 
                  style={styles.statisticDescription}
                  accessible={true}
                  accessibilityRole="text"
                  accessibilityLabel="Descripción: Has descubierto 16 de 30 lugares"
                >
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