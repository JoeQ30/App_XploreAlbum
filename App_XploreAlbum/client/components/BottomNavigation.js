import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const BottomNavigation = ({ activeTab, onTabPress }) => {
  const navItems = [
    { name: 'Cámara', icon: 'camera' },
    { name: 'Album', icon: 'folder-open' },
    { name: 'Amigos', icon: 'users' },
    { name: 'Perfil', icon: 'user' }
  ];

  return (
    <View style={styles.bottomNavigation}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[
            styles.bottomNavItem,
            activeTab === item.name && styles.activeBottomNavItem
          ]}
          onPress={() => onTabPress(item.name)}
        >
          <FontAwesome 
            name={item.icon} 
            size={20} 
            color={activeTab === item.name ? 'white' : '#666'} 
            style={styles.bottomNavIcon}
          />
          <Text style={[
            styles.bottomNavText,
            activeTab === item.name && styles.activeBottomNavText
          ]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
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