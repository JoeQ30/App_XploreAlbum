import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 3; 


// Componente Coleccionable individual
const ColeccionableItem = ({ coleccionable, onPress }) => (
  <TouchableOpacity 
    style={[styles.coleccionableItem, { width: ITEM_WIDTH }]} 
    onPress={() => onPress(coleccionable)}
  >
    <View style={styles.coleccionablePlaceholder}>
      {/* Placeholder con formas geométricas */}
      <View style={styles.triangle} />
      <View style={styles.square} />
      <View style={styles.circle} />
    </View>
    <Text style={styles.coleccionableTitle}>{coleccionable.nombre}</Text>
  </TouchableOpacity>
);

const AlbumScreen = () => {
  const [activeTab, setActiveTab] = useState('Todos');

  // Datos simulados de coleccionables (más elementos para probar el scroll)
  const coleccionables = Array(24).fill(null).map((_, index) => ({
    id: index + 1,
    nombre: `Título ${index + 1}`,
    imagen: null,
    coleccionado: Math.random() > 0.5,
    categoria: 'MiAlbum1'
  }));

  const filteredColeccionables = activeTab === 'Coleccionados' 
    ? coleccionables.filter(item => item.coleccionado)
    : coleccionables;

  const handleColeccionablePress = (coleccionable) => {
    console.log('Coleccionable seleccionado:', coleccionable);
  };

  const renderColeccionable = ({ item }) => (
    <ColeccionableItem 
      coleccionable={item} 
      onPress={handleColeccionablePress}
    />
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header de la pantalla principal */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          {/* Logo y título a la izquierda */}
          <View style={styles.headerLeft}>
            <Image 
              source={require('../assets/images/logo/LogoXVerde.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.albumText}>Album</Text>
          </View>
          
          {/* Pestañas a la derecha */}
          <View style={styles.tabContainer}>
            {['Coleccionados', 'Todos'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab)}
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


      {/* Sección de orden */}
      <View style={styles.orderSection}>
        <View style={styles.orderLeft}>
          <FontAwesome name="random" size={16} color="#666" style={styles.orderIcon} />
          <Text style={styles.orderText}>Orden</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <FontAwesome name="bars" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Grid de coleccionables con FlatList optimizado */}
      <FlatList
        data={filteredColeccionables}
        renderItem={renderColeccionable}
        keyExtractor={(item) => item.id.toString()}
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
          length: ITEM_WIDTH + 40, // altura del item + margin
          offset: (ITEM_WIDTH + 40) * Math.floor(index / 3),
          index,
        })}
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
  coleccionablePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#D3D3D3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#999',
    position: 'absolute',
    top: 20,
  },
  square: {
    width: 20,
    height: 20,
    backgroundColor: '#999',
    position: 'absolute',
    bottom: 25,
    left: 25,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#999',
    position: 'absolute',
    bottom: 25,
    right: 25,
  },
  coleccionableTitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default AlbumScreen;