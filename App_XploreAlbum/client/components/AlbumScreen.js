import React, { useState, useCallback, useEffect  } from 'react';

import { FontAwesome } from '@expo/vector-icons';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  Dimensions,
  Image,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect  } from '@react-navigation/native';
import { listarColeccionables, listarFotos } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 3; 

//App_XploreAlbum/client/assets/images/ejemplos/edificio-metalico.jpg

// Mapeo estático de imágenes - IMPORTANTE: Todas las imágenes deben estar importadas
const imageMap = {
  'collect/basilica.png': require('../assets/images/collect/basilica.png'),
  'collect/chirripo.png': require('../assets/images/collect/chirripo.png'),
  'collect/corcovado.png': require('../assets/images/collect/corcovado.png'),
  'collect/edificio-metalico.png': require('../assets/images/collect/edificio-metalico.png'),
  'collect/teatro-nacional.png': require('../assets/images/collect/teatro-nacional.png'),
  'collect/fortin.png': require('../assets/images/collect/fortin.png'),
  'collect/melico-salazar.png': require('../assets/images/collect/melico-salazar.png'),
  'collect/monteverde.png': require('../assets/images/collect/monteverde.png'),
  'collect/ruinas-ujarras.png': require('../assets/images/collect/ruinas-ujarras.png'),
  'collect/rio-celeste.png': require('../assets/images/collect/rio-celeste.png'),
};

// Mapeo estático de imágenes - IMPORTANTE: Todas las imágenes deben estar importadas
const imageEjMap = {
  'collect/basilica.png': require('../assets/images/ejemplos/basilica.jpg'),
  'collect/chirripo.png': require('../assets/images/ejemplos/chirripo.jpg'),
  'collect/corcovado.png': require('../assets/images/ejemplos/corcovado.jpg'),
  'collect/edificio-metalico.png': require('../assets/images/ejemplos/edificio-metalico.jpg'),
  'collect/teatro-nacional.png': require('../assets/images/ejemplos/teatro-nacional.jpg'),
  'collect/fortin.png': require('../assets/images/ejemplos/fortin.jpg'),
  'collect/melico-salazar.png': require('../assets/images/ejemplos/melico-salazar.jpg'),
  'collect/monteverde.png': require('../assets/images/ejemplos/monteverde.jpg'),
  'collect/ruinas-ujarras.png': require('../assets/images/ejemplos/ruinas-ujarras.jpg'),
  'collect/rio-celeste.png': require('../assets/images/ejemplos/rio-celeste.jpg'),
};


// Función para obtener la imagen correcta del coleccionable
const getColeccionableImage = (coleccionable, fotos) => {
  // Si está desbloqueado, buscar la imagen correspondiente
  if (coleccionable.desbloqueado) {
    const fotoCorrespondiente = fotos.find(foto => foto.id_lugar === coleccionable.id_lugar);
    if (fotoCorrespondiente && imageMap[fotoCorrespondiente.ruta_imagen]) {
      //console.log('Imagen encontrada para:', fotoCorrespondiente.ruta_imagen);
      return { 
        source: imageMap[fotoCorrespondiente.ruta_imagen], 
        isDefault: false 
      };
    } else {
      console.warn('Imagen no encontrada en el mapa para:', fotoCorrespondiente?.ruta_imagen);
    }
  }
  
  // Si no está desbloqueado o no se encontró la foto, usar imagen por defecto
  return { 
    source: require('../assets/images/fotos_predeterminadas/default.jpg'), 
    isDefault: true 
  };
};

// Función para obtener la imagen de ejemplo del coleccionable bloqueado
const getExampleImage = (coleccionable, fotos) => {
  const fotoCorrespondiente = fotos.find(foto => foto.id_lugar === coleccionable.id_lugar);
  if (fotoCorrespondiente && imageEjMap[fotoCorrespondiente.ruta_imagen]) {
    return imageEjMap[fotoCorrespondiente.ruta_imagen];
  }
  // Si no se encuentra la imagen específica, usar una imagen por defecto
  return require('../assets/images/fotos_predeterminadas/default.jpg');
};

// Componente Modal para coleccionable bloqueado
const LockedCollectibleModal = ({ visible, collectible, fotos, onClose, onUnlock }) => {
  if (!collectible) return null;

  const exampleImage = getExampleImage(collectible, fotos);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.modalContent}>
          {/* Ícono de candado */}
          <View style={styles.lockIconContainer}>
            <FontAwesome name="lock" size={40} color="#666" />
          </View>
          
          {/* Título del coleccionable */}
          <Text style={styles.modalTitle}>{collectible.nombre}</Text>
          
          {/* Mensaje */}
          <Text style={styles.modalMessage}>
            Para poder desbloquear este coleccionable, debes tomar una foto como esta
          </Text>
          
          {/* Imagen de ejemplo */}
          <View style={styles.exampleImageContainer}>
            <Image 
              source={exampleImage}
              style={styles.exampleImage}
              resizeMode="cover"
            />
          </View>
          
          {/* Botones */}
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.unlockButton}
              onPress={() => onUnlock(collectible)}
            >
              <Text style={styles.unlockButtonText}>Desbloquear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Componente Coleccionable individual actualizado
const ColeccionableItem = ({ coleccionable, fotos, onPress }) => {
  const imageInfo = getColeccionableImage(coleccionable, fotos);
  const isUnlocked = coleccionable.desbloqueado;
  
  // Descripción accesible del estado del coleccionable
  const accessibilityHint = isUnlocked 
    ? `Coleccionable desbloqueado. Toca para ver detalles de ${coleccionable.nombre}`
    : `Coleccionable bloqueado. Toca para ver cómo desbloquear ${coleccionable.nombre}`;
  
  return (
    <TouchableOpacity 
      style={[styles.coleccionableItem, { width: ITEM_WIDTH }]} 
      onPress={() => onPress(coleccionable)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Coleccionable ${coleccionable.nombre}`}
      accessibilityHint={accessibilityHint}
    >
      <View 
        style={styles.coleccionableImageContainer}
        accessible={true}
        accessibilityRole="image"
      >
        <Image 
          source={imageInfo.source}
          style={styles.coleccionableImage}
          resizeMode="cover"
          accessible={true}
          accessibilityLabel={
            isUnlocked 
              ? `Imagen del lugar ${coleccionable.nombre}` 
              : `Imagen bloqueada de ${coleccionable.nombre}`
          }
          onError={(error) => {
            console.log('Error cargando imagen:', error);
          }}
        />
        
        {/* Overlay para coleccionables no desbloqueados */}
        {!coleccionable.desbloqueado && (
          <View 
            style={styles.lockedOverlay}
            accessible={true}
            accessibilityLabel="Coleccionable bloqueado"
            accessibilityRole="image"
          >
            <FontAwesome 
              name="lock" 
              size={24} 
              color="white"
              accessible={false}
            />
          </View>
        )}
        
        {/* Indicador de desbloqueado */}
        {coleccionable.desbloqueado && (
          <View 
            style={styles.unlockedIndicator}
            accessible={true}
            accessibilityLabel="Coleccionable desbloqueado"
            accessibilityRole="image"
          >
            <FontAwesome 
              name="check-circle" 
              size={16} 
              color="#4CAF50"
              accessible={false}
            />
          </View>
        )}
      </View>
      
      <Text 
        style={[
          styles.coleccionableTitle,
          !coleccionable.desbloqueado && styles.lockedTitle
        ]}
        accessible={true}
        accessibilityRole="text"
      >
        {coleccionable.nombre}
      </Text>
    </TouchableOpacity>
  );
};

const AlbumScreen = ({onNavigateToCamera}) => {
  const [activeTab, setActiveTab] = useState('Todos');
  const navigation = useNavigation();
  const [coleccionables, setColeccionables] = useState([]);
  const [loguedUser, setLoguedUser] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCollectible, setSelectedCollectible] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchColeccionables = async () => {
        try {
          //console.log('[AlbumScreen] Cargando usuario...');
          const jsonValue = await AsyncStorage.getItem('usuario');
          const usuario = JSON.parse(jsonValue);
          
          // Verificar que el usuario existe y tiene id antes de continuar
          if (!usuario || !usuario.id) {
            console.error('[AlbumScreen] Usuario no válido:', usuario);
            return;
          }
          
          setLoguedUser(usuario);
          //console.log('[AlbumScreen] Usuario logueado:', usuario);

          const dataColectibles = await listarColeccionables(usuario.id);
          setColeccionables(dataColectibles);
        
          const dataFotos = await listarFotos();
          setFotos(dataFotos);
          //console.log('[AlbumScreen] Fotos obtenidas:', dataFotos);
          
          // Log para verificar la relación entre coleccionables y fotos
          dataColectibles.forEach(coleccionable => {
            const fotoCorrespondiente = dataFotos.find(foto => foto.id_lugar === coleccionable.id_lugar);
            //console.log(`Coleccionable: ${coleccionable.nombre}, Lugar: ${coleccionable.id_lugar}, Foto encontrada:`, fotoCorrespondiente?.ruta_imagen || 'No encontrada');
          });
          
        } catch (error) {
          console.error('[AlbumScreen] Error cargando datos:', error);
        }
      };
      
      fetchColeccionables();
    }, []) // Removido loguedUser.id de las dependencias
  );

  const filteredColeccionables = activeTab === 'Coleccionados' 
    ? coleccionables.filter(item => item.desbloqueado)
    : coleccionables;

  const handleColeccionablePress = (coleccionable) => {
    //console.log('[AlbumScreen] Coleccionable presionado:', coleccionable);
    
    if (coleccionable.desbloqueado) {
      // Si está desbloqueado, navegar a la pantalla de detalles
      navigation.navigate('CollectDetail', { collectible: coleccionable });
    } else {
      // Si está bloqueado, mostrar el modal
      setSelectedCollectible(coleccionable);
      setModalVisible(true);
    }
  };

  const handleUnlock = (collectible) => {
    //console.log('[AlbumScreen] Intentando desbloquear:', collectible);
    // Cerrar el modal
    setModalVisible(false);
    setSelectedCollectible(null);
    
    // Navegar a CameraScreen con el coleccionable como parámetro
    if (onNavigateToCamera) {
      onNavigateToCamera();
    } else {
      console.error('onNavigateToCamera no está disponible');
    }
    
    console.log('Navegando a cámara para desbloquear:', collectible.nombre);
    };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCollectible(null);
  };

  const renderColeccionable = ({ item }) => (
    <ColeccionableItem 
      coleccionable={item} 
      fotos={fotos}
      onPress={handleColeccionablePress}
    />
  );

  const insets = useSafeAreaInsets();

  // Conteo para accesibilidad
  const totalColeccionables = coleccionables.length;
  const coleccionablesDesbloqueados = coleccionables.filter(item => item.desbloqueado).length;
  const currentCount = filteredColeccionables.length;

  return (
    <View 
      style={styles.container}
      accessible={false}
      accessibilityLabel="Pantalla del álbum de coleccionables"
    >
      {/* Header de la pantalla principal */}
      <View 
        style={[styles.header, { paddingTop: insets.top + 30}]}
        accessible={true}
        accessibilityRole="header"
      >
        <View style={styles.headerContent}>
          {/* Logo y título a la izquierda */}
          <View 
            style={styles.headerLeft}
            accessible={true}
            accessibilityLabel="Título de la pantalla"
          >
            <Image 
              source={require('../assets/images/logo/LogoXVerde.png')} 
              style={styles.logoImage}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="Logo de la aplicación"
              accessibilityRole="image"
            />
            <Text 
              style={styles.albumText}
              accessible={true}
              accessibilityRole="header"
              accessibilityLevel={1}
            >
              Album
            </Text>
          </View>
          
          {/* Pestañas a la derecha */}
          <View 
            style={styles.tabContainer}
            accessible={true}
            accessibilityLabel="Filtros del álbum"
            accessibilityRole="tablist"
          >
            {['Coleccionados', 'Todos'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab)}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel={`Filtro ${tab}`}
                accessibilityHint={`Mostrar ${tab === 'Todos' ? 'todos los coleccionables' : 'solo coleccionables desbloqueados'}`}
                accessibilityState={{ selected: activeTab === tab }}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}>
                  {activeTab === tab && '✓ '}{tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Grid de coleccionables con FlatList optimizado */}
      <FlatList
        data={filteredColeccionables}
        renderItem={renderColeccionable}
        keyExtractor={(item) => item.id_coleccionable.toString()}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.row}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        windowSize={10}
        initialNumToRender={12}
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH + 40,
          offset: (ITEM_WIDTH + 40) * Math.floor(index / 3),
          index,
        })}
        accessible={true}
        accessibilityLabel="Lista de coleccionables"
        accessibilityHint="Desliza para ver más coleccionables"
      />

      {/* Modal para coleccionable bloqueado */}
      <LockedCollectibleModal
        visible={modalVisible}
        collectible={selectedCollectible}
        fotos={fotos}
        onClose={handleCloseModal}
        onUnlock={handleUnlock}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A4A4A',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  xText: {
    color: '#8BC34A',
  },
  logoImage: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  albumText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row'
  },
  tab: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#8BC34A',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  orderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E8F5E8',
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    marginRight: 8,
  },
  orderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  menuButton: {
    padding: 4,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  coleccionableItem: {
    alignItems: 'center',
  },
  coleccionableImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
    backgroundColor: '#E0E0E0',
  },
  coleccionableImage: {
    width: '100%',
    height: '100%',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  coleccionableTitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  lockedTitle: {
    color: '#999',
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 32,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lockIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  exampleImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  exampleImage: {
    width: '100%',
    height: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  unlockButton: {
    flex: 1,
    backgroundColor: '#8BC34A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  triangle: {
    display: 'none',
  },
  square: {
    display: 'none',
  },
  circle: {
    display: 'none',
  },
  coleccionablePlaceholder: {
    display: 'none',
  },
});

export default AlbumScreen;