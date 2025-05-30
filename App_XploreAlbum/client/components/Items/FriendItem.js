import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FriendItem = ({ 
  name, 
  location, 
  onAddPress, 
  showAddButton = true, 
  accessible = true,
  accessibilityLabel 
}) => {
  return (
    <View 
      style={styles.container}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Icon name="person" size={30} color="#666" />
        </View>
        <View style={styles.userInfo}>
          <Text 
            style={styles.name}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Nombre: ${name}`}
          >
            {name}
          </Text>
          {location && (
            <Text 
              style={styles.location}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`Ubicación: ${location}`}
            >
              {location}
            </Text>
          )}
        </View>
      </View>
      
      {showAddButton && onAddPress && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={onAddPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Agregar a ${name} como amigo`}
          accessibilityHint="Toca para enviar solicitud de amistad"
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#8BC34A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FriendItem;