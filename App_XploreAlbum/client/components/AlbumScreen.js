import React, { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  Dimensions,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { listarColeccionables, listarFotos } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 3; 

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

// Componente Coleccionable individual actualizado
const ColeccionableItem = ({ coleccionable, fotos, onPress }) => {
  const imageInfo = getColeccionableImage(coleccionable, fotos);
  const isUnlocked = coleccionable.desbloqueado;
  
  // Descripción accesible del estado del coleccionable
  const accessibilityHint = isUnlocked 
    ? `Coleccionable desbloqueado. Toca para ver detalles de ${coleccionable.nombre}`
    : `Coleccionable bloqueado. ${coleccionable.nombre} aún no ha sido desbloqueado`;
  
  return (
    <TouchableOpacity 
      style={[styles.coleccionableItem, { width: ITEM_WIDTH }]} 
      onPress={() => onPress(coleccionable)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Coleccionable ${coleccionable.nombre}`}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isUnlocked }}
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

const AlbumScreen = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Todos');
  const navigation = useNavigation();
  const [coleccionables, setColeccionables] = useState([]);
  const [loguedUser, setLoguedUser] = useState(null);
  const [fotos, setFotos] = useState([]);
  
  useEffect(() => {
    const fetchColeccionables = async () => {
      try {
        //console.log('Usuario en AlbumScreen:', user);
   
        const dataColectibles = await listarColeccionables(user.id);
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
        console.log(' ');
      }
    };
    fetchColeccionables();
  }, []);

  const filteredColeccionables = activeTab === 'Coleccionados' 
    ? coleccionables.filter(item => item.desbloqueado)
    : coleccionables;

  const handleColeccionablePress = (coleccionable) => {
    //TODO> Implementar navegación a detalle del coleccionable
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
  // Eliminamos los estilos del placeholder ya que ya no los usamos
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