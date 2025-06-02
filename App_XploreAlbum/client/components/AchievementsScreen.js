import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AchievementItem from './Items/AchievementItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { listarLogros } from '../services/api';


const AchievementsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState('todos'); // 'todos', 'desbloqueados', 'bloqueados'
  const badge1 = require('../assets/images/insignias_logos/badge1.png');
  const badge2 = require('../assets/images/insignias_logos/badge2.png');
  const badge3 = require('../assets/images/insignias_logos/badge3.png');
  const badge4 = require('../assets/images/insignias_logos/badge4.png');
  const badge5 = require('../assets/images/insignias_logos/badge5.png');
  const defaultAvatar = require('../assets/images/fotos_predeterminadas/default_logros.jpg');

  useFocusEffect(
    useCallback(() => {
      const fetchAchievements = async () => {
        try {
          const data = await listarLogros();
          setAchievements(data);
          console.log('Logros cargados:', data);
        } catch (error) {
          console.error('Error al cargar logros:', error);
        }
      };

      fetchAchievements();
    }, [])
  );

  // Función para obtener la imagen de insignia personalizada basada en el logro
  const getCustomBadge = (achievementId, achievementType) => {
    const badgeMap = {
      'insignias_logros/pura_vida_starter.png': badge1,
      'insignias_logros/fotografo_tico.png': badge2,
      'insignias_logros/historiador_local.png': badge3,
      'insignias_logros/explorador_parques.png': badge4,
      'insignias_logros/coleccionista_tico.png': badge5,
    };

    return badgeMap[achievementType] || null;
  };

  // Filtrar logros según el filtro seleccionado
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'desbloqueados') return achievement.desbloqueado;
    if (filter === 'bloqueados') return !achievement.desbloqueado;
    return true; // 'todos'
  });

  const BackIcon = () => (
    <Icon name="arrow-back" size={24} color="white" />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A4A4A" barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo/LogoXVerde.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Logros</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {achievements.filter(a => a.desbloqueado).length}
          </Text>
          <Text style={styles.statLabel}>Desbloqueados</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {achievements.length}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {achievements.length > 0 ? 
              Math.round((achievements.filter(a => a.desbloqueado).length / achievements.length) * 100) : 0}%
          </Text>
          <Text style={styles.statLabel}>Progreso</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'todos' && styles.activeFilter]}
          onPress={() => setFilter('todos')}
        >
          <Text style={[styles.filterText, filter === 'todos' && styles.activeFilterText]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'desbloqueados' && styles.activeFilter]}
          onPress={() => setFilter('desbloqueados')}
        >
          <Text style={[styles.filterText, filter === 'desbloqueados' && styles.activeFilterText]}>
            Completados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'bloqueados' && styles.activeFilter]}
          onPress={() => setFilter('bloqueados')}
        >
          <Text style={[styles.filterText, filter === 'bloqueados' && styles.activeFilterText]}>
            Bloqueados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Achievements List */}
      <ScrollView 
        style={styles.achievementsList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.achievementsListContent}
      >
      
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => (
            <AchievementItem
              key={achievement.id_logro}
              title={achievement.nombre}
              description={achievement.descripcion}
              isUnlocked={achievement.desbloqueado || false}
              lockedImage={defaultAvatar}
              customBadge={getCustomBadge(achievement.id_logro, achievement.tipo)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="emoji-events" size={60} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {filter === 'todos' 
                ? 'No hay logros disponibles' 
                : `No hay logros ${filter}`
              }
            </Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8BC34A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#8BC34A',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
  },
  achievementsList: {
    flex: 1,
  },
  achievementsListContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default AchievementsScreen;