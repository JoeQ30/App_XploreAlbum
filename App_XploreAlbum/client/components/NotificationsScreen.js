import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Iconos usando Material Icons con accesibilidad mejorada
const BackIcon = () => (
  <Icon 
    name="arrow-back" 
    size={24} 
    color="white"
    accessible={true}
    accessibilityLabel="Icono de flecha hacia atrás"
  />
);

const UserIcon = () => (
  <View 
    style={styles.userIcon}
    accessible={true}
    accessibilityLabel="Icono de usuario"
    accessibilityRole="image"
  >
    <Icon name="person" size={20} color="#4a5568" />
  </View>
);

const CheckIcon = () => (
  <View 
    style={styles.checkIcon}
    accessible={true}
    accessibilityLabel="Icono de check para aceptar"
    accessibilityRole="image"
  >
    <Icon name="check" size={18} color="white" />
  </View>
);

const CloseIcon = () => (
  <View 
    style={styles.closeIcon}
    accessible={true}
    accessibilityLabel="Icono de X para rechazar"
    accessibilityRole="image"
  >
    <Icon name="close" size={18} color="white" />
  </View>
);

const LandmarkIcon = () => (
  <View 
    style={styles.landmarkIcon}
    accessible={true}
    accessibilityLabel="Icono de lugar de interés"
    accessibilityRole="image"
  >
    <Icon name="place" size={20} color="#d69e2e" />
  </View>
);

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'friend_request',
      user: 'Gabriela Fernández',
      message: 'te envió una solicitud',
      date: '30 abril 2025',
      icon: 'user',
    },
    {
      id: '2',
      type: 'friend_request',
      user: 'Ricardo Chaves',
      message: 'te envió una solicitud',
      date: '25 de abril',
      icon: 'user',
    },
    {
      id: '3',
      type: 'landmark',
      user: '',
      message: 'Tienes un landmark cerca, ¿quieres ver cuál es?',
      date: '24 abril del 2025',
      icon: 'landmark',
    },
  ]);

  const handleAccept = (id) => {
    console.log('Aceptar notificación:', id);
    // Aquí puedes agregar la lógica para aceptar
  };

  const handleReject = (id) => {
    console.log('Rechazar notificación:', id);
    // Aquí puedes agregar la lógica para rechazar
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'user':
        return <UserIcon />;
      case 'landmark':
        return <LandmarkIcon />;
      default:
        return <UserIcon />;
    }
  };

  const getNotificationAccessibilityLabel = (item) => {
    const baseMessage = item.user 
      ? `${item.user} ${item.message}` 
      : item.message;
    
    const typeDescription = item.type === 'friend_request' 
      ? 'Solicitud de amistad' 
      : 'Notificación de lugar de interés';
    
    return `${typeDescription}: ${baseMessage}. Fecha: ${item.date}`;
  };

  const renderNotification = ({ item, index }) => (
    <View 
      style={styles.notificationItem}
      accessible={true}
      accessibilityLabel={getNotificationAccessibilityLabel(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          {renderIcon(item.icon)}
        </View>
        
        <View style={styles.textContainer}>
          <Text 
            style={styles.notificationText}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={item.user ? `${item.user} ${item.message}` : item.message}
          >
            {item.user && (
              <Text 
                style={styles.userName}
                accessible={true}
                accessibilityLabel={`Usuario: ${item.user}`}
              >
                {item.user}{' '}
              </Text>
            )}
            {item.message}
          </Text>
          <Text 
            style={styles.dateText}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Fecha: ${item.date}`}
          >
            {item.date}
          </Text>
        </View>
      </View>
      
      {item.type === 'friend_request' && (
        <View 
          style={styles.actionsContainer}
          accessible={true}  
          accessibilityLabel="Acciones para la solicitud de amistad"
        >
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAccept(item.id)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Aceptar solicitud de amistad de ${item.user}`}
            accessibilityHint="Toca para aceptar la solicitud de amistad"
          >
            <CheckIcon />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Rechazar solicitud de amistad de ${item.user}`}
            accessibilityHint="Toca para rechazar la solicitud de amistad"
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#4a5568"
        accessible={true}
        accessibilityLabel="Barra de estado con fondo gris oscuro"
      />
      
      {/* Header */}
      <View 
        style={[styles.header, { paddingTop: insets.top }]}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Encabezado de la pantalla de notificaciones"
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Volver a la pantalla anterior"
          accessibilityHint="Toca para regresar"
        >
          <BackIcon />
        </TouchableOpacity>
        
        <View 
          style={styles.headerContent}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel="Logo de la aplicación y título de notificaciones"
        >
          <Image
            source={require('../assets/images/logo/LogoXVerde.png')}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Logo de la aplicación X en color verde"
            accessibilityRole="image"
          />
          <Text 
            style={styles.headerTitle}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel="Título de la sección: Notificaciones"
          >
            Notificaciones
          </Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>
      
      {/* Lista de notificaciones */}
      <View 
        style={styles.content}
        accessible={true}
        accessibilityLabel="Contenido principal con lista de notificaciones"
      >
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          accessible={true}
          accessibilityLabel={`Lista de notificaciones, ${notifications.length} elementos`}
          accessibilityHint="Desliza para ver todas las notificaciones"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A4A4A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 25,
    fontWeight: '600',
    marginLeft: 8,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    backgroundColor: '#f0f4f0',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#2d3748',
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
    color: '#2d3748',
  },
  dateText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  acceptButton: {
    marginRight: 8,
  },
  rejectButton: {
    // Sin estilos adicionales necesarios
  },
  // Estilos para iconos
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  landmarkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef5e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#48bb78',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f56565',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationsScreen;