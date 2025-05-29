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
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FriendItem from './Items/FriendItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listarUsuarios } from '../services/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const FriendsScreen = () => {
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [loguedUser, setLoguedUser] = useState(null);	

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('usuario');
        setLoguedUser(JSON.parse(jsonValue));

        //console.log('[FRIENDS]: Usuario logueado:', JSON.parse(jsonValue));

        const data = await listarUsuarios();
        setUsers(data);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleAddFriend = (friendId) => {
    console.log('Agregando amigo:', friendId);
  };

  const filteredUsers = users
    .filter((u) => u.id_usuario !== loguedUser?.id)
    .filter((u) => 
      searchText === '' || 
      u.nombre.toLowerCase().includes(searchText.toLowerCase())
    );

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
          placeholder="Buscar Usuario"
          value={searchText}
          onChangeText={setSearchText}
          accessible={true}
          accessibilityLabel="Campo de búsqueda de usuarios"
          accessibilityHint="Escribe el nombre del usuario que deseas buscar"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Users List */}
      <ScrollView 
        style={styles.friendsList} 
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel={`Lista de usuarios disponibles. ${filteredUsers.length} usuarios encontrados`}
        accessibilityRole="list"
      >
        {filteredUsers.length === 0 ? (
          <View 
            style={styles.emptyContainer}
            accessible={true}
            accessibilityLabel="No se encontraron usuarios"
            accessibilityRole="text"
          >
            <Text style={styles.emptyText}>
              {searchText ? 'No se encontraron usuarios con ese nombre' : 'No hay usuarios disponibles'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((u, index) => (
            <TouchableOpacity 
              key={u.id_usuario}
              onPress={() => navigation.navigate('Profile', { user: u })}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Ver perfil de ${u.nombre}, ubicado en ${u.ubicacion || 'ubicación no especificada'}`}
              accessibilityHint="Toca para ver el perfil completo de este usuario"
              accessibilityState={{ selected: false }}
            >
              <FriendItem
                key={u.id_usuario}
                name={u.nombre}
                location={u.ubicacion}
                onAddPress={() => handleAddFriend(u.id_usuario)}
                accessible={true}
                accessibilityLabel={`Usuario ${index + 1} de ${filteredUsers.length}: ${u.nombre}`}
              />
            </TouchableOpacity>
          ))
        )}
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