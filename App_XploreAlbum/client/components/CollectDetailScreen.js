import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obtenerHistoriaLugar, obtenerLugarPorId } from '../services/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

//App_XploreAlbum\client\assets\images\fotos_predeterminadas\edificio_metalico.jpg

// Mapeo estático de imágenes - IMPORTANTE: Todas las imágenes deben estar importadas
const imageMap = {
  'fotos_predeterminadas/basilica.jpg': require('../assets/images/fotos_predeterminadas/basilica.jpg'),
  'fotos_predeterminadas/chirripo.jpg': require('../assets/images/fotos_predeterminadas/chirripo.jpg'),
  'fotos_predeterminadas/corcovado.jpg': require('../assets/images/fotos_predeterminadas/corcovado.jpg'),
  'fotos_predeterminadas/edificio-metalico.jpg': require('../assets/images/fotos_predeterminadas/edificio_metalico.jpg'),
  'fotos_predeterminadas/teatro-nacional.jpg': require('../assets/images/fotos_predeterminadas/teatro_nacional.jpg'),
  'fotos_predeterminadas/fortin.jpg': require('../assets/images/fotos_predeterminadas/fortin.jpg'),
  'fotos_predeterminadas/melico-salazar.jpg': require('../assets/images/fotos_predeterminadas/melico_salazar.jpg'),
  'fotos_predeterminadas/puente-monteverde.jpg': require('../assets/images/fotos_predeterminadas/puente_monteverde.jpg'),
  'fotos_predeterminadas/ruinas-ujarras.jpg': require('../assets/images/fotos_predeterminadas/ruinas_ujarras.jpg'),
  'fotos_predeterminadas/rio-celeste.jpg': require('../assets/images/fotos_predeterminadas/rio_celeste.jpg'),
};

const CollectDetailScreen = ({ navigation, route }) => {
  const [collectibleData, setCollectibleData] = useState([]);
  const [loguedUser, setLoguedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storyData, setStoryData] = useState([]);
  const [placeData, setPlaceData] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      
      const loadCollectibleData = async () => {
        try {
            console.log('--------------------------------------------------');
            setLoading(true);
            // Carga el coleccionable desde la ruta
            const { collectible } = route.params || {};
            setCollectibleData(collectible || {});

            console.log('[CollectDetail] Collectible data:', collectible);
            
            // Accede a los datos del usuario logueado en async storage
            const userData = await AsyncStorage.getItem('usuario');
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                setLoguedUser(parsedUserData);
                console.log('Logued user data:', parsedUserData);
            }else {
                console.log('[CollectDetail] No se pudo obtener el usuario logueado');
                setLoguedUser(null);
                }

            const placeId = collectible?.id_lugar;
            if (!placeId) {
                console.error('[CollectDetail] No se encontró el ID del lugar en los datos del coleccionable');
                return;
            }

            // Carga los datos del lugar asociado al coleccionable
            const lugar = await obtenerLugarPorId(placeId);
            if (lugar) {
                setPlaceData(lugar);
                console.log('[CollectDetail] Lugar data:', lugar);
            } else {
                console.error('[CollectDetail] No se encontraron datos del lugar');
            }

            // Carga la historia del lugar
            const historia = await obtenerHistoriaLugar(placeId);
            if (historia) {
                setStoryData(historia);
                console.log('[CollectDetail] Historia del lugar:', historia);
            } else {
                console.error('[CollectDetail] No se encontraron datos de la historia del lugar');
            }

          
        } catch (error) {
          console.error('[CollectDetail] Error en la carga de la información: ', error);
        } finally {
          setLoading(false);
        }
      };

      loadCollectibleData();
    }, [route.params])
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header con imagen de fondo */}
      <View style={styles.headerContainer}>
        {/* Imagen de fondo del lugar */}
        <View style={styles.backgroundImage}>
          {placeData.imagen_principal ? (
            <Image 
              source={imageMap[placeData.imagen_principal]} 
              style={styles.backgroundImageStyle}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>
        
        {/* Overlay oscuro */}
        <View style={styles.overlay} />
        
        {/* Botón de regreso */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        {/* Información del lugar en el header */}
        <View style={styles.headerInfo}>
          <View style={styles.titleContainer}>
            <Text style={styles.logoText}>
                <Image 
                  source={require('../assets/images/logo/LogoXBlanca.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
            </Text>
            <Text style={styles.placeName}>{placeData.nombre}</Text>
          </View>
          <Text style={styles.placeLocation}>{placeData.ubicacion}</Text>
        </View>
      </View>

      {/* Contenido scrolleable */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.descriptionContainer}>
          {/* Descripción del lugar */}
          <Text style={styles.descriptionText}>
            {placeData.descripcion}
          </Text>
          
          {/* Información histórica */}
          {storyData && storyData.length > 0 && (
            <View style={styles.historySection}>
              {storyData.map((historia, index) => (
                <View key={historia.id_dato || index} style={styles.historyItem}>
                  <Text style={styles.historyTitle}>{historia.titulo}</Text>
                  <Text style={styles.historyDescription}>{historia.descripcion}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* Espaciado adicional al final */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Indicador inferior */}
      <View style={styles.bottomIndicator}>
        <View style={styles.indicatorLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  headerContainer: {
    height: screenHeight * 0.4,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImageStyle: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: '#4a90a4',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 10 || 40,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerInfo: {
    padding: 20,
    paddingBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  logoImage: {
    width: 50,
    height: 50,
    marginRight: 20,
  },
  placeName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  placeLocation: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginLeft: 55, // Alineado con el nombre (considerando el logo + margin)
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  descriptionContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 20,
  },
  historySection: {
    marginTop: 10,
  },
  historyItem: {
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  historyDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    textAlign: 'justify',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  indicatorLine: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
});

export default CollectDetailScreen;