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

// Iconos usando Material Icons
const BackIcon = () => (
  <Icon name="arrow-back" size={24} color="white" />
);

const UserIcon = () => (
  <View style={styles.userIcon}>
    <Icon name="person" size={20} color="#4a5568" />
  </View>
);

const CheckIcon = () => (
  <View style={styles.checkIcon}>
    <Icon name="check" size={18} color="white" />
  </View>
);

const CloseIcon = () => (
  <View style={styles.closeIcon}>
    <Icon name="close" size={18} color="white" />
  </View>
);

const LandmarkIcon = () => (
  <View style={styles.landmarkIcon}>
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

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          {renderIcon(item.icon)}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.notificationText}>
            {item.user && <Text style={styles.userName}>{item.user} </Text>}
            {item.message}
          </Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>
      
      {item.type === 'friend_request' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAccept(item.id)}
          >
            <CheckIcon />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a5568" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/images/logo/LogoXVerde.png')}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>
      
      {/* Lista de notificaciones */}
      <View style={styles.content}>
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
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