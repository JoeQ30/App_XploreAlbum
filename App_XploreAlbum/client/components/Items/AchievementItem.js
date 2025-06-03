import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const AchievementItem = ({ 
  icon, 
  title, 
  description, 
  isUnlocked = false,
  lockedImage,
  customBadge
}) => {
  return (
    <View style={styles.achievementContainer}>
      <View style={[
        styles.iconContainer, 
        { backgroundColor: isUnlocked ? '#E8F5E8' : '#F0F0F0' }
      ]}>
        {isUnlocked ? (
          // Mostrar insignia personalizada si está desbloqueado
          customBadge ? (
            <Image 
              source={customBadge} 
              style={styles.badgeImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.unlockedIcon}>🏆</Text>
          )
        ) : (
          // Mostrar imagen de bloqueado si no está desbloqueado
          <Image 
            source={lockedImage || require('../../assets/images/fotos_predeterminadas/default_logros.jpg')} 
            style={styles.lockedImage}
            resizeMode="cover"
          />
        )}
      </View>
      
      <View style={styles.achievementInfo}>
        <Text style={[
          styles.achievementTitle,
          { color: isUnlocked ? '#333' : '#999' }
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.achievementDescription,
          { color: isUnlocked ? '#666' : '#AAA' }
        ]}>
          {description}
        </Text>
        
        {/* Indicador de estado */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isUnlocked ? '#8BC34A' : '#CCC' }
          ]} />
          <Text style={[
            styles.statusText,
            { color: isUnlocked ? '#8BC34A' : '#999' }
          ]}>
            {isUnlocked ? 'Desbloqueado' : 'Bloqueado'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  badgeImage: {
    width: 45,
    height: 45,
  },
  lockedImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    opacity: 0.6,
  },
  unlockedIcon: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});

export default AchievementItem;