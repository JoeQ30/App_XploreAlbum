import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Alert, 
  Modal, 
  FlatList, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { register } from '../services/api'; // Asume que tienes esta función

const logo = require('../assets/images/logo/Letter1-F_Verde.png'); // Cambia por tu logo

// Datos de provincias y cantones de Costa Rica
const locationData = {
  "San José": [
    "San José", "Escazú", "Desamparados", "Puriscal", "Tarrazú", "Aserrí", 
    "Mora", "Goicoechea", "Santa Ana", "Alajuelita", "Vásquez de Coronado", 
    "Acosta", "Tibás", "Moravia", "Montes de Oca", "Turrubares", "Dota", 
    "Curridabat", "Pérez Zeledón", "León Cortés Castro"
  ],
  "Alajuela": [
    "Alajuela", "San Ramón", "Grecia", "San Mateo", "Atenas", "Naranjo",
    "Palmares", "Poás", "Orotina", "San Carlos", "Zarcero", "Sarchí",
    "Upala", "Los Chiles", "Guatuso", "Río Cuarto"
  ],
  "Cartago": [
    "Cartago", "Paraíso", "La Unión", "Jiménez", "Turrialba", "Alvarado",
    "Oreamuno", "El Guarco"
  ],
  "Heredia": [
    "Heredia", "Barva", "Santo Domingo", "Santa Bárbara", "San Rafael",
    "San Isidro", "Belén", "Flores", "San Pablo", "Sarapiquí"
  ],
  "Guanacaste": [
    "Liberia", "Nicoya", "Santa Cruz", "Bagaces", "Carrillo", "Cañas",
    "Abangares", "Tilarán", "Nandayure", "La Cruz", "Hojancha"
  ],
  "Puntarenas": [
    "Puntarenas", "Esparza", "Buenos Aires", "Montes de Oro", "Osa",
    "Quepos", "Golfito", "Coto Brus", "Parrita", "Corredores", "Garabito"
  ],
  "Limón": [
    "Limón", "Pococí", "Siquirres", "Talamanca", "Matina", "Guácimo"
  ]
};

const provincias = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón", "Extranjero"];

export default function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [provincia, setProvincia] = useState('');
  const [canton, setCanton] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [showProvinciaModal, setShowProvinciaModal] = useState(false);
  const [showCantonModal, setShowCantonModal] = useState(false);
  const navigation = useNavigation();

  // Verificar si las contraseñas coinciden
  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [password, confirmPassword]);

  // Limpiar cantón cuando cambia la provincia
  useEffect(() => {
    setCanton('');
  }, [provincia]);

  const handleRegister = async () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!provincia) {
      Alert.alert('Error', 'Por favor selecciona tu provincia');
      return;
    }

    if (provincia !== 'Extranjero' && !canton) {
      Alert.alert('Error', 'Por favor selecciona tu cantón');
      return;
    }

    try {
      // Agregar los datos de ubicación al registro en formato String
      const locationInfo = provincia === 'Extranjero' ? 
        'Extranjero' : `${canton}, ${provincia}`;

      const userData = await register(email, password, nombre, locationInfo);
      Alert.alert('Éxito', 'Usuario creado exitosamente', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo crear el usuario. Intenta nuevamente.');
    }
  };

  const toggleMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword);
  };

  const toggleMostrarConfirmPassword = () => {
    setMostrarConfirmPassword(!mostrarConfirmPassword);
  };

  const getPasswordConfirmStyle = () => {
    if (passwordsMatch === null) return styles.passwordContainer;
    return passwordsMatch 
      ? [styles.passwordContainer, styles.passwordMatch] 
      : [styles.passwordContainer, styles.passwordMismatch];
  };

  const selectProvincia = (selectedProvincia) => {
    setProvincia(selectedProvincia);
    setShowProvinciaModal(false);
  };

  const selectCanton = (selectedCanton) => {
    setCanton(selectedCanton);
    setShowCantonModal(false);
  };

  const renderProvinciaItem = ({ item }) => (
    React.createElement(TouchableOpacity, {
      style: styles.modalItem,
      onPress: () => selectProvincia(item),
      accessible: true,
      accessibilityRole: "button",
      accessibilityLabel: `Seleccionar provincia ${item}`
    },
      React.createElement(Text, { style: styles.modalItemText }, item)
    )
  );

  const renderCantonItem = ({ item }) => (
    React.createElement(TouchableOpacity, {
      style: styles.modalItem,
      onPress: () => selectCanton(item),
      accessible: true,
      accessibilityRole: "button",
      accessibilityLabel: `Seleccionar cantón ${item}`
    },
      React.createElement(Text, { style: styles.modalItemText }, item)
    )
  );

  const getAvailableCantones = () => {
    return provincia && provincia !== 'Extranjero' ? locationData[provincia] || [] : [];
  };

  return (
    React.createElement(KeyboardAvoidingView, {
      style: styles.keyboardAvoidingView,
      behavior: Platform.OS === 'ios' ? 'padding' : 'height',
      keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20
    },
      React.createElement(TouchableWithoutFeedback, {
        onPress: Keyboard.dismiss
      },
        React.createElement(ScrollView, {
          style: styles.scrollContainer,
          contentContainerStyle: styles.container,
          showsVerticalScrollIndicator: false,
          keyboardShouldPersistTaps: "handled",
          accessible: false,
          accessibilityLabel: "Pantalla de registro"
        },
          // Logo
          React.createElement(View, { style: styles.logoContainer },
            React.createElement(Image, { source: logo, style: styles.logo })
          ),

          // Tarjeta de registro
          React.createElement(View, {
            style: styles.registerCard,
            accessible: false,
            accessibilityLabel: "Formulario de registro"
          },
            React.createElement(Text, {
              style: styles.title,
              accessible: true,
              accessibilityRole: "header",
              accessibilityLevel: 1
            }, "Crear Cuenta"),
            
            React.createElement(View, {
              style: styles.loginSection,
              accessible: true,
              accessibilityLabel: "Opción de inicio de sesión"
            },
              React.createElement(Text, {
                style: styles.loginText,
                accessible: true,
                accessibilityRole: "text"
              }, "¿Ya tienes una cuenta? "),
              React.createElement(TouchableOpacity, {
                onPress: () => navigation.navigate('Login'),
                accessible: true,
                accessibilityRole: "button",
                accessibilityLabel: "Iniciar sesión",
                accessibilityHint: "Ir a la pantalla de inicio de sesión"
              },
                React.createElement(Text, { style: styles.loginLink }, "Iniciar Sesión")
              )
            ),

            // Campo Nombre
            React.createElement(Text, {
              style: styles.label,
              accessible: true,
              accessibilityRole: "text"
            }, "Nombre Completo"),
            React.createElement(TextInput, {
              style: styles.input,
              value: nombre,
              onChangeText: setNombre,
              autoCapitalize: "words",
              placeholder: "Ingresa tu nombre completo",
              accessible: true,
              accessibilityLabel: "Campo de nombre completo",
              accessibilityHint: "Ingresa tu nombre completo",
              accessibilityRole: "none",
              textContentType: "name",
              autoComplete: "name"
            }),

            // Campo Email
            React.createElement(Text, {
              style: styles.label,
              accessible: true,
              accessibilityRole: "text"
            }, "Email"),
            React.createElement(TextInput, {
              style: styles.input,
              value: email,
              onChangeText: setEmail,
              autoCapitalize: "none",
              keyboardType: "email-address",
              placeholder: "usuario@ejemplo.com",
              accessible: true,
              accessibilityLabel: "Campo de correo electrónico",
              accessibilityHint: "Ingresa tu dirección de correo electrónico",
              accessibilityRole: "none",
              textContentType: "emailAddress",
              autoComplete: "email"
            }),

            // Campo Provincia
            React.createElement(Text, {
              style: styles.label,
              accessible: true,
              accessibilityRole: "text"
            }, "Provincia"),
            React.createElement(TouchableOpacity, {
              style: [styles.input, styles.selectButton],
              onPress: () => setShowProvinciaModal(true),
              accessible: true,
              accessibilityRole: "button",
              accessibilityLabel: "Seleccionar provincia",
              accessibilityHint: "Abre la lista de provincias para seleccionar"
            },
              React.createElement(Text, {
                style: [styles.selectButtonText, !provincia && styles.placeholder]
              }, provincia || 'Selecciona tu provincia'),
              React.createElement(MaterialIcons, {
                name: "keyboard-arrow-down",
                size: 24,
                color: "#999"
              })
            ),

            // Campo Cantón
            React.createElement(Text, {
              style: styles.label,
              accessible: true,
              accessibilityRole: "text"
            }, "Cantón"),
            React.createElement(TouchableOpacity, {
              style: [
                styles.input,
                styles.selectButton,
                ((provincia === 'Extranjero' || !provincia) && styles.inputDisabled)
              ],
              onPress: () => provincia !== 'Extranjero' && provincia && setShowCantonModal(true),
              disabled: provincia === 'Extranjero' || !provincia,
              accessible: true,
              accessibilityRole: "button",
              accessibilityLabel: "Seleccionar cantón",
              accessibilityHint: provincia === 'Extranjero' ? 'Campo deshabilitado para extranjeros' : 'Abre la lista de cantones para seleccionar'
            },
              React.createElement(Text, {
                style: [
                  styles.selectButtonText,
                  !canton && styles.placeholder,
                  ((provincia === 'Extranjero' || !provincia) && styles.textDisabled)
                ]
              }, provincia === 'Extranjero' ? 'No aplica' : (canton || 'Selecciona tu cantón')),
              React.createElement(MaterialIcons, {
                name: "keyboard-arrow-down",
                size: 24,
                color: provincia === 'Extranjero' || !provincia ? "#ccc" : "#999"
              })
            ),

            // Campo Contraseña
            React.createElement(Text, {
              style: styles.label,
              accessible: true,
              accessibilityRole: "text"
            }, "Contraseña"),
            React.createElement(View, {
              style: styles.passwordContainer,
              accessible: false
            },
              React.createElement(TextInput, {
                style: styles.passwordInput,
                value: password,
                onChangeText: setPassword,
                secureTextEntry: !mostrarPassword,
                placeholder: "••••••••",
                accessible: true,
                accessibilityLabel: "Campo de contraseña",
                accessibilityHint: "Ingresa tu contraseña",
                accessibilityRole: "none",
                textContentType: "newPassword",
                autoComplete: "password-new"
              }),
              React.createElement(TouchableOpacity, {
                style: styles.eyeIcon,
                onPress: toggleMostrarPassword,
                accessible: true,
                accessibilityRole: "button",
                accessibilityLabel: mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña",
                accessibilityHint: mostrarPassword ? "Oculta la contraseña" : "Muestra la contraseña"
              },
                React.createElement(MaterialIcons, {
                  name: mostrarPassword ? "visibility-off" : "visibility",
                  size: 24,
                  color: "#999",
                  accessible: false
                })
              )
            ),

            // Campo Confirmar Contraseña
            React.createElement(Text, {
              style: styles.label,
              accessible: true,
              accessibilityRole: "text"
            }, "Confirmar Contraseña"),
            React.createElement(View, {
              style: getPasswordConfirmStyle(),
              accessible: false
            },
              React.createElement(TextInput, {
                style: styles.passwordInput,
                value: confirmPassword,
                onChangeText: setConfirmPassword,
                secureTextEntry: !mostrarConfirmPassword,
                placeholder: "••••••••",
                accessible: true,
                accessibilityLabel: "Campo de confirmación de contraseña",
                accessibilityHint: "Confirma tu contraseña",
                accessibilityRole: "none",
                textContentType: "newPassword",
                autoComplete: "password-new"
              }),
              React.createElement(TouchableOpacity, {
                style: styles.eyeIcon,
                onPress: toggleMostrarConfirmPassword,
                accessible: true,
                accessibilityRole: "button",
                accessibilityLabel: mostrarConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"
              },
                React.createElement(MaterialIcons, {
                  name: mostrarConfirmPassword ? "visibility-off" : "visibility",
                  size: 24,
                  color: "#999",
                  accessible: false
                })
              ),
              passwordsMatch !== null && React.createElement(View, { style: styles.matchIndicator },
                React.createElement(Text, { style: styles.matchIcon }, passwordsMatch ? "✓" : "✗")
              )
            ),

            // Mensaje de estado de contraseñas
            passwordsMatch !== null && React.createElement(Text, {
              style: [
                styles.passwordMessage,
                passwordsMatch ? styles.passwordMessageSuccess : styles.passwordMessageError
              ],
              accessible: true,
              accessibilityRole: "text"
            }, passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"),

            React.createElement(TouchableOpacity, {
              style: [
                styles.registerButton,
                ((!nombre || !email || !password || !confirmPassword || !passwordsMatch || !provincia || (provincia !== 'Extranjero' && !canton)) && styles.buttonDisabled)
              ],
              onPress: handleRegister,
              disabled: !nombre || !email || !password || !confirmPassword || !passwordsMatch || !provincia || (provincia !== 'Extranjero' && !canton),
              accessible: true,
              accessibilityRole: "button",
              accessibilityLabel: "Crear cuenta",
              accessibilityHint: "Crea una nueva cuenta con los datos ingresados"
            },
              React.createElement(Text, {
                style: [
                  styles.registerButtonText,
                  ((!nombre || !email || !password || !confirmPassword || !passwordsMatch || !provincia || (provincia !== 'Extranjero' && !canton)) && styles.buttonTextDisabled)
                ],
                accessible: false
              }, "Crear Cuenta")
            )
          ),

          // Modal para Provincias
          React.createElement(Modal, {
            visible: showProvinciaModal,
            transparent: true,
            animationType: "slide",
            onRequestClose: () => setShowProvinciaModal(false)
          },
            React.createElement(View, { style: styles.modalOverlay },
              React.createElement(View, { style: styles.modalContainer },
                React.createElement(View, { style: styles.modalHeader },
                  React.createElement(Text, { style: styles.modalTitle }, "Seleccionar Provincia"),
                  React.createElement(TouchableOpacity, {
                    onPress: () => setShowProvinciaModal(false),
                    accessible: true,
                    accessibilityRole: "button",
                    accessibilityLabel: "Cerrar modal"
                  },
                    React.createElement(MaterialIcons, {
                      name: "close",
                      size: 24,
                      color: "#333"
                    })
                  )
                ),
                React.createElement(FlatList, {
                  data: provincias,
                  renderItem: renderProvinciaItem,
                  keyExtractor: (item) => item,
                  style: styles.modalList
                })
              )
            )
          ),

          // Modal para Cantones
          React.createElement(Modal, {
            visible: showCantonModal,
            transparent: true,
            animationType: "slide",
            onRequestClose: () => setShowCantonModal(false)
          },
            React.createElement(View, { style: styles.modalOverlay },
              React.createElement(View, { style: styles.modalContainer },
                React.createElement(View, { style: styles.modalHeader },
                  React.createElement(Text, { style: styles.modalTitle }, "Seleccionar Cantón"),
                  React.createElement(TouchableOpacity, {
                    onPress: () => setShowCantonModal(false),
                    accessible: true,
                    accessibilityRole: "button",
                    accessibilityLabel: "Cerrar modal"
                  },
                    React.createElement(MaterialIcons, {
                      name: "close",
                      size: 24,
                      color: "#333"
                    })
                  )
                ),
                React.createElement(FlatList, {
                  data: getAvailableCantones(),
                  renderItem: renderCantonItem,
                  keyExtractor: (item) => item,
                  style: styles.modalList
                })
              )
            )
          )
        )
      )
    )
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#8BC34A',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    width: '100%',
    minHeight: '100%',
  },
  logoContainer: {
    width: 300,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  registerCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d0d0d0',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  textDisabled: {
    color: '#aaa',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordMatch: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  passwordMismatch: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchIndicator: {
    paddingRight: 15,
  },
  matchIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  passwordMessage: {
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  passwordMessageSuccess: {
    color: '#4CAF50',
  },
  passwordMessageError: {
    color: '#F44336',
  },
  registerButton: {
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#888',
  },
  // Estilos para los modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '80%',
    maxHeight: '70%',
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalList: {
    paddingHorizontal: 20,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});