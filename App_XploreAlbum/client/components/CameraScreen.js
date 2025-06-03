import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendImageToBackend, saveCollectionToBackend } from '../services/api';

// Configuración del umbral de confianza mínimo (puedes ajustarlo según necesites)
const MINIMUM_CONFIDENCE_THRESHOLD = 0.9; // 

const CameraScreen = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isValidPrediction, setIsValidPrediction] = useState(false); // Nueva state para validación
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [progressText, setProgressText] = useState('Iniciando análisis...');
  const cameraRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
    if (!mediaLibraryPermission?.granted) requestMediaLibraryPermission();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (showAnalysis) {
        startProgressAnimation();
      }
    }, [showAnalysis])
  );

  const startProgressAnimation = () => {
    progressAnim.setValue(0);
    
    // Simulate realistic progress steps
    const progressSteps = [
      { progress: 0.2, text: 'Enviando imagen...', duration: 800 },
      { progress: 0.5, text: 'Analizando con IA...', duration: 1500 },
      { progress: 0.8, text: 'Identificando lugar...', duration: 1000 },
      { progress: 1.0, text: 'Finalizando...', duration: 500 }
    ];

    let currentStep = 0;
    
    const animateStep = () => {
      if (currentStep >= progressSteps.length) return;
      
      const step = progressSteps[currentStep];
      setProgressText(step.text);
      
      Animated.timing(progressAnim, {
        toValue: step.progress,
        duration: step.duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(() => {
        currentStep++;
        if (currentStep < progressSteps.length) {
          setTimeout(animateStep, 200);
        }
      });
    };
    
    animateStep();
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false, // We'll handle base64 conversion in the API call
        skipProcessing: false,
      });

      setCapturedPhoto(photo);
      await analyzeImage(photo);
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Debes permitir acceso a la galería.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled) {
        setCapturedPhoto(result.assets[0]);
        await analyzeImage(result.assets[0]);
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
      setPredictionResult(null);
      setIsValidPrediction(false);
      
      // Call backend API for image analysis
      const result = await sendImageToBackend(photo.uri);
      
      if (result.success) {
        setPredictionResult(result);
        
        // Validar confianza mínima
        const confidence = result.bestPrediction?.confidence || 0;
        const isValid = confidence >= MINIMUM_CONFIDENCE_THRESHOLD;
        setIsValidPrediction(isValid);
        
        if (isValid) {
          setProgressText('¡Análisis completado!');
        } else {
          setProgressText('Análisis completado');
        }
      } else {
        throw new Error(result.error || 'No se pudo identificar el lugar');
      }

    } catch (error) {
      console.error('Error al analizar imagen:', error);
      
      // Hide analysis modal and show error
      setShowAnalysis(false);
      
      Alert.alert(
        'Error de Análisis', 
        error.message || 'Ocurrió un error al analizar la imagen. ¿Deseas intentar nuevamente?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              setCapturedPhoto(null);
              setPredictionResult(null);
              setIsValidPrediction(false);
            }
          },
          {
            text: 'Reintentar',
            onPress: () => analyzeImage(photo)
          }
        ]
      );
      return;
    }

    // Wait a moment to show completion, then show preview
    setTimeout(() => {
      setShowAnalysis(false);
      setShowPreview(true);
    }, 1000);
  };

  const saveCollection = async () => {
    if (!predictionResult || !capturedPhoto || !isValidPrediction) return;

    try {
      setIsLoading(true);
      
      const response = await saveCollectionToBackend({
        lugarId: predictionResult.lugar.id_lugar,
        imageUri: capturedPhoto.uri
      });

      if (response.success) {
        Alert.alert(
          'Colección Guardada',
          `¡Felicidades! Has desbloqueado ${response.nuevosColeccionables.length || 0} nuevo(s) coleccionable(s).`,
          [
            {
              text: 'Ver Colección',
              onPress: () => {
                setShowPreview(false);
                setCapturedPhoto(null);
                setPredictionResult(null);
                setIsValidPrediction(false);
                navigation.navigate('Collection');
              }
            },
            {
              text: 'Continuar',
              onPress: () => {
                setShowPreview(false);
                setCapturedPhoto(null);
                setPredictionResult(null);
                setIsValidPrediction(false);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error al guardar colección:', error);
      Alert.alert('Error', 'No se pudo guardar el coleccionable. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowPreview(false);
    setPredictionResult(null);
    setIsValidPrediction(false);
    setAnalysisProgress(0);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Cargando...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <FontAwesome name="camera" size={60} color="#8BC34A" />
          <Text style={styles.permissionTitle}>Acceso a la Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a tu cámara para capturar nuevos coleccionables
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Dar Permisos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>
          <Image 
            source={require('../assets/images/logo/Letter1-F_Gris.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Text>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode="picture"
        >
          <View style={styles.cameraOverlay}>
            {/* Flip button */}
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <FontAwesome name="refresh" size={24} color="white" />
            </TouchableOpacity>

            {/* Instructions */}
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Apunta la cámara hacia el landmark que deseas desbloquear y toca el botón de captura.
              </Text>
            </View>

            {/* Camera controls */}
            <View style={styles.cameraControls}>
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={pickImage}
                  disabled={isLoading}
                >
                  <FontAwesome name="photo" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.captureButton, isLoading && styles.captureButtonDisabled]}
                  onPress={takePicture}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="large" />
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Analysis Modal */}
      <Modal visible={showAnalysis} transparent={true} animationType="fade">
        <View style={styles.analysisContainer}>
          <View style={styles.analysisBox}>
            <ActivityIndicator size="large" color="#8BC34A" />
            <Text style={styles.analysisText}>{progressText}</Text>
            
            <View style={styles.progressBarContainer}>
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
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={showPreview} animationType="slide">
        <View style={styles.previewContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              <Text style={styles.xText}>XploreAlbum</Text>
              <Text style={styles.albumText}> Reconocimiento</Text>
            </Text>
          </View>

          {capturedPhoto && (
            <Image 
              source={{ uri: capturedPhoto.uri }} 
              style={styles.previewImage}
            />
          )}

          {/* Prediction Result */}
          {predictionResult && (
            <View style={styles.predictionResult}>
              {isValidPrediction ? (
                // Resultado válido - mostrar información del lugar
                <>
                  <View style={styles.successHeader}>
                    <FontAwesome name="check-circle" size={24} color="#8BC34A" />
                    <Text style={styles.predictionTitle}>¡Lugar Identificado!</Text>
                  </View>
                  <Text style={styles.predictionName}>
                    {predictionResult.bestPrediction.class}
                  </Text>
                  <Text style={styles.predictionConfidence}>
                    Confianza: {(predictionResult.bestPrediction.confidence * 100).toFixed(1)}%
                  </Text>
                </>
              ) : (
                // Resultado no válido - mostrar mensaje de no coincidencia
                <>
                  <View style={styles.errorHeader}>
                    <FontAwesome name="times-circle" size={24} color="#FF6B6B" />
                    <Text style={styles.noMatchTitle}>No hay coincidencias</Text>
                  </View>
                  <Text style={styles.noMatchMessage}>
                    La imagen no coincide con ningún coleccionable conocido.
                  </Text>
                  <Text style={styles.noMatchHint}>
                    Intenta capturar el landmark desde un ángulo diferente o asegúrate de que esté completamente visible.
                  </Text>
                  {predictionResult.bestPrediction && (
                    <Text style={styles.lowConfidenceText}>
                      Mejor coincidencia: ({(predictionResult.bestPrediction.confidence * 100).toFixed(1)}% - Muy baja)
                    </Text>
                  )}
                </>
              )}
            </View>
          )}

          <View style={styles.previewControls}>
            <TouchableOpacity
              style={[styles.previewButton, styles.retakeButton]}
              onPress={retakePhoto}
              disabled={isLoading}
            >
              <FontAwesome name="refresh" size={20} color="#666" />
              <Text style={styles.retakeButtonText}>
                {isValidPrediction ? 'Repetir' : 'Intentar Nuevamente'}
              </Text>
            </TouchableOpacity>

            {isValidPrediction ? (
              <TouchableOpacity
                style={[styles.previewButton, styles.saveButton]}
                onPress={saveCollection}
                disabled={isLoading || !predictionResult}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <FontAwesome name="trophy" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Obtener Coleccionable</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.previewButton, styles.helpButton]}
                onPress={() => {
                  Alert.alert(
                    'Consejos para mejores resultados',
                    '• Asegúrate de que el landmark esté completamente visible\n• Toma la foto con buena iluminación\n• Evita obstáculos que tapen el lugar\n• Acércate o aléjate para obtener un mejor encuadre',
                    [{ text: 'Entendido', style: 'default' }]
                  );
                }}
              >
                <FontAwesome name="question-circle" size={20} color="#8BC34A" />
                <Text style={styles.helpButtonText}>Obtener Ayuda</Text>
              </TouchableOpacity>
            )}
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
    textAlign: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  // Estilos para resultado exitoso
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  predictionTitle: {
    color: '#8BC34A',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  predictionName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  predictionConfidence: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
  },
  // Estilos para resultado no válido
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noMatchTitle: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noMatchMessage: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  noMatchHint: {
    color: '#B0B0B0',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  lowConfidenceText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: '#666',
  },
  retakeButtonText: {
    color: '#999',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#8BC34A',
  },
  saveButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  helpButton: {
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    borderWidth: 1,
    borderColor: '#8BC34A',
  },
  helpButtonText: {
    color: '#8BC34A',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CameraScreen;