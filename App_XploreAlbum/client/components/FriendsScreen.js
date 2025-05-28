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
          <Text style={styles.logoText}>Amigos</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Usuario"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Users List */}
      <ScrollView style={styles.friendsList} showsVerticalScrollIndicator={false}>
        {users
          .filter((u) => u.id_usuario !== loguedUser.id)
          .map((u) => (
            <TouchableOpacity 
              key={u.id_usuario}
              onPress={() => navigation.navigate('Profile', { user: u })}
          >
          <FriendItem
            key={u.id_usuario}
            name={u.nombre}
            location={u.ubicacion}
            onAddPress={() => handleAddFriend(u.id_usuario)}
          />
          </TouchableOpacity>
        ))}
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
  logoX: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8BC34A',
    marginRight: 8,
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
