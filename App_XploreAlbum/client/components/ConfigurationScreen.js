import React, { useCallback , useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect  } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { actualizarUsuario, actualizarPassword } from '../services/api'; 
import { normalizeUser } from '../utils/user';


const ConfigurationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  // Estados para los campos del formulario
  const [loguedUser, setLoguedUser] = useState(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseñaActual, setContraseñaActual] = useState('');
  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [biografia, setBiografia] = useState('');
  const [visibilidad, setVisibilidad] = useState('público');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  
  // Estados para validación
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useFocusEffect(
  useCallback(() => {
    const loadUser = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('usuario');
        if (jsonValue != null) {
          const user = JSON.parse(jsonValue);
          setLoguedUser(user);
          setNombre(user.nombre || '');
          setCorreo(user.correo || '');
          setBiografia(user.biografia || '');
          setVisibilidad(user.visibilidad_perfil || 'público');
          //console.log('[CONFIG]: Visibilidad del perfil:', user.visibilidad_perfil);
          setFotoPerfil(user.foto_perfil || null);
        }
      } catch (e) {
        console.error('Error al cargar el usuario:', e);
      }
    };

    loadUser();
  }, [])
);

  const handleImagePicker = () => {
    const options = {
      title: 'Seleccionar foto de perfil',
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 400,
      maxHeight: 400,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la selección');
      } else if (response.error) {
        console.log('Error:', response.error);
        Alert.alert('Error', 'No se pudo acceder a la galería');
      } else if (response.assets && response.assets[0]) {
        setFotoPerfil(response.assets[0].uri);
        console.log('Imagen seleccionada:', response.assets[0].uri);
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (nuevaContraseña || confirmarContraseña) {
      if (!contraseñaActual) {
        newErrors.contraseñaActual = 'Ingresa tu contraseña actual';
      }
      if (nuevaContraseña.length < 6) {
        newErrors.nuevaContraseña = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (nuevaContraseña !== confirmarContraseña) {
        newErrors.confirmarContraseña = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
  if (!validateForm()) {
    Alert.alert('Error', 'Por favor corrige los errores en el formulario');
    return;
  }

  setLoading(true);
  try {
    console.log('[CONFIG]: Visibilidad del perfil a enviar:', visibilidad);

    const updatedUser = await actualizarUsuario(loguedUser.id, {
      nombre,
      correo,
      foto_perfil: fotoPerfil,
      biografia,
      visibilidad_perfil: visibilidad, // ✓ Correcto
    });

    if (nuevaContraseña && confirmarContraseña && contraseñaActual) {
      const result = await actualizarPassword(loguedUser.id, nuevaContraseña, contraseñaActual);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const normalizedUser = normalizeUser(updatedUser);
    console.log('[CONFIG]: Usuario actualizado:', normalizedUser);

    // Guardar en AsyncStorage
    await AsyncStorage.setItem('usuario', JSON.stringify(normalizedUser));
    setLoguedUser(normalizedUser);

    Alert.alert(
      'Éxito', 
      'Configuración actualizada correctamente',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  } catch (error) {
    console.error('Error al actualizar:', error);
    Alert.alert('Error', 'No se pudo actualizar la configuración');
  } finally {
    setLoading(false);
  }
};

  const VisibilityModal = () => (
    <Modal
      visible={showVisibilityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowVisibilityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Visibilidad del perfil</Text>
          
          <TouchableOpacity
            style={[
              styles.modalOption,
              visibilidad === 'público' && styles.modalOptionSelected
            ]}
            onPress={() => {
              setVisibilidad('público');
              setShowVisibilityModal(false);
            }}
          >
            <Icon 
              name="public" 
              size={24} 
              color={visibilidad === 'público' ? '#8BC34A' : '#666'} 
            />
            <View style={styles.modalOptionText}>
              <Text style={[
                styles.modalOptionTitle,
                visibilidad === 'público' && styles.modalOptionTitleSelected
              ]}>
                Público
              </Text>
              <Text style={styles.modalOptionDescription}>
                Cualquier persona puede ver tu perfil
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalOption,
              visibilidad === 'solo_seguidores' && styles.modalOptionSelected
            ]}
            onPress={() => {
              setVisibilidad('solo_seguidores');
              setShowVisibilityModal(false);
            }}
          >
            <Icon 
              name="group" 
              size={24} 
              color={visibilidad === 'solo_seguidores' ? '#8BC34A' : '#666'} 
            />
            <View style={styles.modalOptionText}>
              <Text style={[
                styles.modalOptionTitle,
                visibilidad === 'solo_seguidores' && styles.modalOptionTitleSelected
              ]}>
                Solo seguidores
              </Text>
              <Text style={styles.modalOptionDescription}>
                Solo tus seguidores pueden ver tu perfil
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowVisibilityModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="#4A4A4A" 
        barStyle="light-content"
        accessible={true}
        accessibilityLabel="Barra de estado con fondo gris oscuro"
      />
      
      {/* Header */}
      <View 
        style={[styles.header, { paddingTop: insets.top }]}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Encabezado de la pantalla de configuración"
      >
        <View style={styles.logoContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Volver atrás"
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Image 
            source={require('../assets/images/logo/LogoXVerde.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Configuración</Text>
        </View>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Guardar cambios"
        >
          <Icon name="save" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollViewContent}
          enableOnAndroid={true}
        >
          {/* Foto de perfil */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foto de perfil</Text>
            <View style={styles.profileImageContainer}>
              <TouchableOpacity 
                style={styles.profileImageButton}
                onPress={handleImagePicker}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cambiar foto de perfil"
              >
                {fotoPerfil ? (
                  <Image source={{ uri: fotoPerfil }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Icon name="person" size={60} color="#666" />
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <Icon name="camera-alt" size={20} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Información personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información personal</Text>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={[styles.input, errors.nombre && styles.inputError]}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ingresa tu nombre"
                  accessible={true}
                  accessibilityLabel="Campo de nombre"
                />
                {errors.nombre && (
                  <Text style={styles.errorText}>{errors.nombre}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={[styles.input, errors.correo && styles.inputError]}
                  value={correo}
                  onChangeText={setCorreo}
                  placeholder="Ingresa tu correo"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessible={true}
                  accessibilityLabel="Campo de correo electrónico"
                />
                {errors.correo && (
                  <Text style={styles.errorText}>{errors.correo}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Biografía</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={biografia}
                  onChangeText={setBiografia}
                  placeholder="Cuéntanos sobre ti..."
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  accessible={true}
                  accessibilityLabel="Campo de biografía"
                />
              </View>
            </View>
          </View>

          {/* Privacidad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacidad</Text>
            <View style={styles.formContainer}>
              <TouchableOpacity 
                style={styles.visibilityButton}
                onPress={() => setShowVisibilityModal(true)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Seleccionar visibilidad del perfil"
              >
                <View style={styles.visibilityButtonContent}>
                  <View>
                    <Text style={styles.inputLabel}>Visibilidad del perfil</Text>
                    <Text style={styles.visibilityValue}>
                      {visibilidad === 'público' ? 'Público' : 'Solo seguidores'}
                    </Text>
                  </View>
                  <Icon name="keyboard-arrow-right" size={24} color="#8BC34A" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seguridad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seguridad</Text>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña actual</Text>
                <TextInput
                  style={[styles.input, errors.contraseñaActual && styles.inputError]}
                  value={contraseñaActual}
                  onChangeText={setContraseñaActual}
                  placeholder="Ingresa tu contraseña actual"
                  secureTextEntry={true}
                  accessible={true}
                  accessibilityLabel="Campo de contraseña actual"
                />
                {errors.contraseñaActual && (
                  <Text style={styles.errorText}>{errors.contraseñaActual}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nueva contraseña</Text>
                <TextInput
                  style={[styles.input, errors.nuevaContraseña && styles.inputError]}
                  value={nuevaContraseña}
                  onChangeText={setNuevaContraseña}
                  placeholder="Ingresa una nueva contraseña"
                  secureTextEntry={true}
                  accessible={true}
                  accessibilityLabel="Campo de nueva contraseña"
                />
                {errors.nuevaContraseña && (
                  <Text style={styles.errorText}>{errors.nuevaContraseña}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
                <TextInput
                  style={[styles.input, errors.confirmarContraseña && styles.inputError]}
                  value={confirmarContraseña}
                  onChangeText={setConfirmarContraseña}
                  placeholder="Confirma tu nueva contraseña"
                  secureTextEntry={true}
                  accessible={true}
                  accessibilityLabel="Campo de confirmación de contraseña"
                />
                {errors.confirmarContraseña && (
                  <Text style={styles.errorText}>{errors.confirmarContraseña}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      <VisibilityModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4A4A4A',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 15,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  logoText: {
    fontSize: 25,
    fontWeight: '600',
    color: 'white',
  },
  saveButton: {
    padding: 10
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, // Espacio adicional al final
  },
  section: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImageButton: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8BC34A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderBottomColor: '#F44336',
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  visibilityButton: {
    paddingVertical: 12,
  },
  visibilityButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visibilityValue: {
    fontSize: 16,
    color: '#8BC34A',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 100, // Aumentado para más espacio cuando el teclado esté visible
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalOptionSelected: {
    backgroundColor: '#F0F8E8',
  },
  modalOptionText: {
    marginLeft: 15,
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalOptionTitleSelected: {
    color: '#8BC34A',
  },
  modalOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ConfigurationScreen;