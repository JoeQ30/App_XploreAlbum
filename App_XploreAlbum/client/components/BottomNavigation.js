import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const BottomNavigation = ({ activeTab, onTabPress }) => {
  const navItems = [
    { name: 'Cámara', icon: 'camera', description: 'Abrir cámara para tomar fotos' },
    { name: 'Album', icon: 'folder-open', description: 'Ver álbum de fotos' },
    { name: 'Amigos', icon: 'users', description: 'Ver lista de amigos' },
    { name: 'Perfil', icon: 'user', description: 'Ver perfil de usuario' }
  ];

  return (
    <View 
      style={styles.bottomNavigation}
      accessibilityRole="tablist"
      accessibilityLabel="Navegación principal"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.name;
        
        return (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.bottomNavItem,
              isActive && styles.activeBottomNavItem
            ]}
            onPress={() => onTabPress(item.name)}
            accessibilityRole="tab"
            accessibilityLabel={`${item.name}${isActive ? ', seleccionado' : ''}`}
            accessibilityHint={item.description}
            accessibilityState={{ selected: isActive }}
            accessible={true}
          >
            <FontAwesome 
              name={item.icon} 
              size={20} 
              color={isActive ? 'white' : '#666'} 
              style={styles.bottomNavIcon}
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants"
            />
            <Text 
              style={[
                styles.bottomNavText,
                isActive && styles.activeBottomNavText
              ]}
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants"
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    // Mejora el área táctil para accesibilidad
    minHeight: 44,
    justifyContent: 'center',
  },
  activeBottomNavItem: {
    backgroundColor: '#8BC34A',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  bottomNavIcon: {
    marginBottom: 4,
  },
  bottomNavText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeBottomNavText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default BottomNavigation;