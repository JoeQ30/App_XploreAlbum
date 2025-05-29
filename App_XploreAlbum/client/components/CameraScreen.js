import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Easing
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const CameraScreen = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const cameraRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const API_BASE_URL = 'http://192.168.1.28:3000';

  useEffect(() => {
    if (!permission?.granted) requestPermission();
    if (!mediaLibraryPermission?.granted) requestMediaLibraryPermission();
  }, []);

  useEffect(() => {
    if (showAnalysis) {
      startProgressAnimation();
    }
  }, [showAnalysis]);

  const startProgressAnimation = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      });

      setCapturedPhoto(photo);
      analyzeImage(photo);
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    // Pide permisos en iOS
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Debes permitir acceso a la galería.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setCapturedPhoto(result.assets[0]);
        analyzeImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const analyzeImage = async (photo) => {
    try {
      setShowAnalysis(true);
      setAnalysisProgress(0);
      
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        name: 'landmark.jpg',
        type: 'image/jpeg',
      });
        
      // Código comentado para análisis de imagen
    } catch (error) {
      console.error('Error al analizar imagen:', error);
      Alert.alert('Error', 'Ocurrió un error al analizar la imagen');
    } finally {
      setShowAnalysis(false);
      setShowPreview(true);
    }
  };

  const saveCollection = async () => {
    if (!predictionResult || !capturedPhoto) return;

    try {
      setIsLoading(true);
      
      const response = await axios.post('http://tu-backend/api/ai/save-collection', {
        lugarId: predictionResult.lugar.id_lugar,
        imageBase64: capturedPhoto.base64
      }, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        Alert.alert(
          'Colección Guardada',
          'La foto ha sido guardada en tu álbum oficial',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPreview(false);
                setCapturedPhoto(null);
                setPredictionResult(null);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error al guardar colección:', error);
      Alert.alert('Error', 'No se pudo guardar el coleccionable');
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowPreview(false);
    setPredictionResult(null);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text 
          style={styles.permissionText}
          accessibilityRole="text"
        >
          Cargando...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View 
          style={styles.permissionContainer}
          accessibilityRole="main"
        >
          <FontAwesome 
            name="camera" 
            size={60} 
            color="#8BC34A"
            accessibilityElementsHidden={true}
          />
          <Text 
            style={styles.permissionTitle}
            accessibilityRole="header"
          >
            Acceso a la Cámara
          </Text>
          <Text 
            style={styles.permissionText}
            accessibilityRole="text"
          >
            Necesitamos acceso a tu cámara para capturar nuevos coleccionables
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestPermission}
            accessibilityRole="button"
            accessibilityLabel="Dar permisos de cámara"
            accessibilityHint="Otorga acceso a la cámara para poder tomar fotos"
          >
            <Text style={styles.permissionButtonText}>Dar Permisos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View 
        style={[styles.header, { paddingTop: insets.top }]}
        accessibilityRole="header"
      >
        <Text 
          style={styles.headerTitle}
          accessibilityRole="header"
          accessibilityLabel="Pantalla de cámara"
        >
          <Image 
            source={require('../assets/images/logo/Letter1-F_Gris.png')} 
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Logo de la aplicación"
          />
        </Text>
      </View>

      {/* Cámara */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode="picture"
          accessibilityLabel={`Vista de cámara ${facing === 'back' ? 'trasera' : 'frontal'}`}
        >
          {/* Overlay con controles */}
          <View style={styles.cameraOverlay}>
            {/* Botón para cambiar cámara */}
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
              accessibilityRole="button"
              accessibilityLabel={`Cambiar a cámara ${facing === 'back' ? 'frontal' : 'trasera'}`}
              accessibilityHint="Alterna entre la cámara frontal y trasera"
            >
              <FontAwesome 
                name="refresh" 
                size={24} 
                color="white"
                accessibilityElementsHidden={true}
              />
            </TouchableOpacity>

            {/* Instrucciones */}
            <View 
              style={styles.instructionContainer}
              accessibilityRole="text"
            >
              <Text 
                style={styles.instructionText}
                accessibilityLabel="Instrucciones: Apunta la cámara hacia el landmark que deseas desbloquear y toca el botón de captura"
              >
                Apunta la cámara hacia el landmark que deseas desbloquear y toca el botón de captura.
              </Text>
            </View>

            {/* Controles inferiores */}
            <View style={styles.cameraControls}>
              <View style={styles.controlsRow}>
                {/* Botón de galería */}
                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={pickImage}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Seleccionar imagen de la galería"
                  accessibilityHint="Abre la galería de fotos para seleccionar una imagen existente"
                  accessibilityState={{ disabled: isLoading }}
                >
                  <FontAwesome 
                    name="photo" 
                    size={24} 
                    color="white"
                    accessibilityElementsHidden={true}
                  />
                </TouchableOpacity>

                {/* Botón de captura */}
                <TouchableOpacity
                  style={[styles.captureButton, isLoading && styles.captureButtonDisabled]}
                  onPress={takePicture}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={isLoading ? "Tomando foto" : "Tomar foto"}
                  accessibilityHint="Captura una foto del landmark para analizarla"
                  accessibilityState={{ disabled: isLoading, busy: isLoading }}
                >
                  {isLoading ? (
                    <ActivityIndicator 
                      color="white" 
                      size="large"
                      accessibilityLabel="Cargando"
                    />
                  ) : (
                    <View 
                      style={styles.captureButtonInner}
                      accessibilityElementsHidden={true}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Modal de análisis */}
      <Modal 
        visible={showAnalysis} 
        transparent={true} 
        animationType="fade"
        accessibilityViewIsModal={true}
      >
        <View 
          style={styles.analysisContainer}
          accessibilityRole="dialog"
          accessibilityLabel="Analizando imagen"
        >
          <View style={styles.analysisBox}>
            <ActivityIndicator 
              size="large" 
              color="#8BC34A"
              accessibilityLabel="Analizando imagen, por favor espera"
            />
            <Text 
              style={styles.analysisText}
              accessibilityRole="text"
            >
              Analizando imagen...
            </Text>
            
            <View 
              style={styles.progressBarContainer}
              accessibilityRole="progressbar"
              accessibilityLabel="Progreso del análisis"
            >
              <Animated.View 
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
                accessibilityElementsHidden={true}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de previsualización */}
      <Modal 
        visible={showPreview} 
        animationType="slide"
        accessibilityViewIsModal={true}
      >
        <View 
          style={styles.previewContainer}
          accessibilityRole="dialog"
          accessibilityLabel="Vista previa de la foto capturada"
        >
          <View 
            style={styles.header}
          >
            <Text 
              style={styles.headerTitle}
              accessibilityRole="header"
            >
              <Text style={styles.xText}>Vista</Text>
              <Text style={styles.albumText}> Previa</Text>
            </Text>
          </View>

          {capturedPhoto && (
            <Image 
              source={{ uri: capturedPhoto.uri }} 
              style={styles.previewImage}
              accessibilityLabel="Foto capturada del landmark"
              accessibilityRole="image"
            />
          )}

          {/* Resultado de la predicción */}
          {predictionResult && (
            <View 
              style={styles.predictionResult}
              accessibilityLabel="Resultado del análisis"
            >
              <Text 
                style={styles.predictionTitle}
                accessibilityRole="header"
              >
                Lugar Identificado
              </Text>
              <Text 
                style={styles.predictionName}
                accessibilityRole="text"
                accessibilityLabel={`Lugar identificado: ${predictionResult.lugar.nombre}`}
              >
                {predictionResult.lugar.nombre}
              </Text>
              <Text 
                style={styles.predictionConfidence}
                accessibilityRole="text"
                accessibilityLabel={`Nivel de confianza: ${(predictionResult.prediction.confidence * 100).toFixed(1)} por ciento`}
              >
                Confianza: {(predictionResult.prediction.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          )}

          <View 
            style={styles.previewControls}
            accessibilityRole="toolbar"
            accessibilityLabel="Controles de la vista previa"
          >
            <TouchableOpacity
              style={[styles.previewButton, styles.retakeButton]}
              onPress={retakePhoto}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Repetir foto"
              accessibilityHint="Regresa a la cámara para tomar otra foto"
              accessibilityState={{ disabled: isLoading }}
            >
              <FontAwesome 
                name="refresh" 
                size={20} 
                color="#666"
                accessibilityElementsHidden={true}
              />
              <Text style={styles.retakeButtonText}>Repetir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.previewButton, styles.saveButton]}
              onPress={saveCollection}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={isLoading ? "Guardando coleccionable" : "Obtener coleccionable"}
              accessibilityHint="Guarda la foto como un coleccionable en tu álbum"
              accessibilityState={{ disabled: isLoading, busy: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator 
                  color="white" 
                  size="small"
                  accessibilityLabel="Guardando"
                />
              ) : (
                <>
                  <FontAwesome 
                    name="trophy" 
                    size={20} 
                    color="white"
                    accessibilityElementsHidden={true}
                  />
                  <Text style={styles.saveButtonText}>Obtener Coleccionable</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#4A4A4A',
    paddingVertical: 16,
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  xText: {
    color: '#8BC34A',
  },
  albumText: {
    color: 'white',
  },
  logoImage: {
    height: 40,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  flipButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 25,
  },
  instructionContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  cameraControls: {
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  galleryButton: {
    marginRight: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#8BC34A',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8BC34A',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#8BC34A',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  analysisBox: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
  },
  analysisText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  progressBarContainer: {
    height: 10,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8BC34A',
    borderRadius: 5,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  predictionResult: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  predictionTitle: {
    color: '#8BC34A',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  predictionName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  predictionConfidence: {
    color: 'white',
    fontSize: 14,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: '#666',
  },
  retakeButtonText: {
    color: '#666',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8BC34A',
  },
  saveButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraScreen;