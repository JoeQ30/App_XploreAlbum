import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obtenerHistoriaLugar, obtenerLugarPorId } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Constantes para la animación
const HEADER_MAX_HEIGHT = screenHeight * 0.4;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

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
  
  // Ref para la animación del scroll
  const scrollOffsetY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      
      const loadCollectibleData = async () => {
        try {
            //console.log('--------------------------------------------------');
            setLoading(true);
            // Carga el coleccionable desde la ruta
            const { collectible } = route.params || {};
            setCollectibleData(collectible || {});

            //console.log('[CollectDetail] Collectible data:', collectible);
            
            // Accede a los datos del usuario logueado en async storage
            const userData = await AsyncStorage.getItem('usuario');
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                setLoguedUser(parsedUserData);
                //console.log('Logued user data:', parsedUserData);
            }else {
                console.error('[CollectDetail] No se pudo obtener el usuario logueado');
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
                //console.log('[CollectDetail] Lugar data:', lugar);
            } else {
                console.error('[CollectDetail] No se encontraron datos del lugar');
            }

            // Carga la historia del lugar
            const historia = await obtenerHistoriaLugar(placeId);
            if (historia) {
                setStoryData(historia);
                //console.log('[CollectDetail] Historia del lugar:', historia);
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

  // Animaciones basadas en el scroll
  const headerHeight = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 1],
    extrapolate: 'clamp',
  });

  const titleScale = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

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
      
      {/* Header animado con imagen de fondo */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        {/* Imagen de fondo del lugar */}
        <Animated.View 
          style={[
            styles.backgroundImage,
            {
              opacity: imageOpacity,
              transform: [{ translateY: imageTranslateY }],
            }
          ]}
        >
          {placeData.imagen_principal ? (
            <Image 
              source={imageMap[placeData.imagen_principal]} 
              style={styles.backgroundImageStyle}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </Animated.View>
        
        {/* Overlay oscuro animado */}
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: imageOpacity,
              transform: [{ translateY: imageTranslateY }],
            }
          ]} 
        />
        
        {/* Botón de regreso */}
        <TouchableOpacity 
            onPress={() => navigation.goBack()}
            accessible={true}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Volver atrás"
            accessibilityHint="Toca para regresar a la pantalla anterior"
        >
            <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.headerInfo,
            {
              opacity: titleOpacity,
              transform: [{ scale: titleScale }],
            }
          ]}
        >
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
        </Animated.View>
      </Animated.View>

      {/* Contenido scrolleable */}
      <Animated.ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false }
        )}
      >        
        <View style={styles.descriptionContainer}>
          {/* Descripción del lugar */}
          <Text style={styles.historyTitle}>
            Descripción
          </Text>
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
      </Animated.ScrollView>

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
    zIndex: 1001,
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
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    // Simulamos un gradiente con multiple sombras
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  position: {
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