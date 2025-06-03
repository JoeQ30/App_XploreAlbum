import React, { useState, useCallback  } from 'react';
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
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FriendItem from './Items/FriendItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listarUsuarios, seguirUsuario, obtenerSeguidos, isFollowing } from '../services/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const FriendsScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'users'
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [loguedUser, setLoguedUser] = useState(null);
  const [friends, setFriends] = useState([]); // Lista de amigos del usuario

  useFocusEffect(
  useCallback(() => {
    const fetchUsers = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('usuario');
        const parsedUser = JSON.parse(jsonValue);

        if (!parsedUser?.id && !parsedUser?.id_usuario) {
          throw new Error('Usuario inválido en AsyncStorage');
        }

        const id = parsedUser.id || parsedUser.id_usuario;

        setLoguedUser({ ...parsedUser, id }); // normalizamos

        const data = await listarUsuarios();
        setUsers(data);

        //console.log('Usuarios obtenidos:', parsedUser);

        const friendsData = await obtenerSeguidos(id);
        //console.log('Amigos obtenidos:', friendsData);
        setFriends(friendsData);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    };


    fetchUsers();
  }, [])
);

  const handleAddFriend = async (friendId) => {
    //console.log('Agregando amigo con ID:', friendId);
    const data = await seguirUsuario(loguedUser?.id, friendId);
    //console.log('Amigo agregado:', data);
    if (data) {
      setFriends((prevFriends) => [...prevFriends, data]);
    }
  };

  const handleViewProfile = async (user) => {
  const isUserFollowing = await isFollowing(loguedUser?.id, user.id_usuario);

  if (user.visibilidad_perfil === 'público') {
    navigation.navigate('Profile', { user });
    return;
  }
  
  if (isUserFollowing) {
    navigation.navigate('Profile', { user });
  } else {
    alert('Debes seguir a este usuario para ver su perfil.');
  }
};

  
const filteredUsers = users
  .filter((u) => u.id_usuario !== loguedUser?.id)
  .filter((u) => 
    Array.isArray(friends) && 
    !friends.some(friend => friend.id_usuario === u.id_usuario)
  )
  .filter((u) => 
    searchText === '' || 
    u.nombre.toLowerCase().includes(searchText.toLowerCase())
  );


  // Filtrar amigos
  const filteredFriends = friends.filter((friend) => 
    searchText === '' || 
    friend.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderTabButton = (tabKey, title) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tabKey && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tabKey)}
      accessible={true}
      accessibilityRole="tab"
      accessibilityLabel={`Pestaña ${title}`}
      accessibilityState={{ selected: activeTab === tabKey }}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tabKey && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderUsersList = () => {
    const isShowingFriends = activeTab === 'friends';
    const dataToShow = isShowingFriends ? filteredFriends : filteredUsers;
    const emptyMessage = isShowingFriends 
      ? (searchText ? 'No se encontraron amigos con ese nombre' : 'Aún no tienes amigos agregados')
      : (searchText ? 'No se encontraron usuarios con ese nombre' : 'No hay usuarios disponibles');

    return (
      <ScrollView 
        style={styles.friendsList} 
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel={`Lista de ${isShowingFriends ? 'amigos' : 'usuarios disponibles'}. ${dataToShow.length} ${isShowingFriends ? 'amigos' : 'usuarios'} encontrados`}
        accessibilityRole="list"
      >
        {dataToShow.length === 0 ? (
          <View 
            style={styles.emptyContainer}
            accessible={true}
            accessibilityLabel={emptyMessage}
            accessibilityRole="text"
          >
            <Text style={styles.emptyText}>
              {emptyMessage}
            </Text>
          </View>
        ) : (
          dataToShow.map((user, index) => (
            <TouchableOpacity 
              key={user.id_usuario}
              onPress={() => handleViewProfile(user)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Ver perfil de ${user.nombre}, ubicado en ${user.ubicacion || 'ubicación no especificada'}`}
              accessibilityHint="Toca para ver el perfil completo de este usuario"
              accessibilityState={{ selected: false }}
            >
              <FriendItem
                key={user.id_usuario}
                name={user.nombre}
                location={user.ubicacion}
                onAddPress={isShowingFriends ? undefined : () => handleAddFriend(user.id_usuario)}
                showAddButton={!isShowingFriends}
                accessible={true}
                accessibilityLabel={`Usuario ${index + 1} de ${dataToShow.length}: ${user.nombre}`}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView 
      style={styles.container}
      accessible={true}
      accessibilityLabel="Pantalla de amigos"
    >
      <StatusBar backgroundColor="#4A4A4A" barStyle="light-content" />
      
      {/* Header */}
      <View 
        style={[styles.header, { paddingTop: insets.top }]}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Encabezado de la aplicación"
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo/LogoXVerde.png')} 
            style={styles.logoImage}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Logo de la aplicación XploreAlbum"
            accessibilityRole="image"
          />
          <Text 
            style={styles.logoText}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Título de la sección: Amigos"
          >
            Amigos
          </Text>
        </View>
      </View>

      {/* Tab Buttons */}
      <View 
        style={styles.tabContainer}
        accessible={true}
        accessibilityRole="tablist"
        accessibilityLabel="Pestañas de navegación"
      >
        {renderTabButton('friends', 'Mis Amigos')}
        {renderTabButton('users', 'Buscar Usuarios')}
      </View>

      {/* Search Bar */}
      <View 
        style={styles.searchContainer}
        accessible={true}
        accessibilityLabel="Barra de búsqueda de usuarios"
        accessibilityRole="search"
      >
        <Icon 
          name="search" 
          size={20} 
          color="#666" 
          style={styles.searchIcon}
          accessible={false}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === 'friends' ? "Buscar Amigo" : "Buscar Usuario"}
          value={searchText}
          onChangeText={setSearchText}
          accessible={true}
          accessibilityLabel={`Campo de búsqueda de ${activeTab === 'friends' ? 'amigos' : 'usuarios'}`}
          accessibilityHint={`Escribe el nombre del ${activeTab === 'friends' ? 'amigo' : 'usuario'} que deseas buscar`}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Users/Friends List */}
      {renderUsersList()}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 25,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#8BC34A',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabButtonText: {
    color: 'white',
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
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

export default FriendsScreen;