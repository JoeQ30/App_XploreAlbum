import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FriendItem = ({ name, location, onAddPress }) => {
  return (
      <View style={styles.friendContainer}>
        <View style={styles.friendInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={30} color="#666" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.friendName}>{name}</Text>
            <Text style={styles.friendLocation}>{location}</Text>
          </View>
        </View>
      <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  friendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  friendLocation: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8BC34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FriendItem;