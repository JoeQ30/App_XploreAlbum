import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Image
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onLoadingComplete }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animación de aparición
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de rotación continua para el loader
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Iniciar animación después de un breve delay
    setTimeout(() => {
      rotateAnimation.start();
    }, 1000);

    // Simular tiempo de carga (3 segundos)
    const timer = setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      rotateAnimation.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Logo y texto */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Logo de XploreAlbum */}
        <View style={styles.logo}>
          <Image 
            source={require('../assets/images/logo/LogoPrincipal-F_Blanco.png')} 
            style={{ width: 100, height: 100 }} 
            resizeMode="contain"
          />
        </View>
        
        {/* Texto XploreAlbum */}
        <Text style={styles.appName}>
          <Text style={styles.xplore}>Xplore</Text>
          <Text style={styles.album}>Album</Text>
        </Text>
      </Animated.View>
      
      {/* Loader circular */}
      <View style={styles.loaderContainer}>
        <Animated.View
          style={[
            styles.loader,
            {
              transform: [{ rotate }],
            }
          ]}
        >
          <View style={styles.loaderInner} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.2,
  },
  logo: {
    marginBottom: 20,
  },
  leafContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaf: {
    position: 'absolute',
    width: 60,
    height: 80,
    borderRadius: 30,
  },
  leafTopLeft: {
    backgroundColor: '#7CB342',
    top: -10,
    left: -10,
    transform: [{ rotate: '-45deg' }],
  },
  leafTopRight: {
    backgroundColor: '#8BC34A',
    top: -10,
    right: -10,
    transform: [{ rotate: '45deg' }],
  },
  leafBottomLeft: {
    backgroundColor: '#689F38',
    bottom: -10,
    left: -10,
    transform: [{ rotate: '-135deg' }],
  },
  leafBottomRight: {
    backgroundColor: '#9CCC65',
    bottom: -10,
    right: -10,
    transform: [{ rotate: '135deg' }],
  },
  appName: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 1,
  },
  xplore: {
    color: '#2c3e50',
    fontWeight: '400',
  },
  album: {
    color: '#7CB342',
    fontWeight: '400',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: height * 0.15,
  },
  loader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#e8f5e8',
    borderTopColor: '#7CB342',
    borderLeftColor: '#7CB342',
  },
  loaderInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
});

export default SplashScreen;