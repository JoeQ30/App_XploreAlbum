import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { register } from '../services/api'; // Asume que tienes esta función

const logo = require('../assets/images/logo/Letter1-F_Verde.png'); // Cambia por tu logo

export default function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const navigation = useNavigation();

  // Verificar si las contraseñas coinciden
  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [password, confirmPassword]);

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

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
        //(thisEmail, thisPassword, thisName)
      const userData = await register(email, password, nombre);
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

  return (
    <View 
      style={styles.container}
      accessible={false}
      accessibilityLabel="Pantalla de registro"
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
      </View>

      {/* Tarjeta de registro */}
      <View 
        style={styles.registerCard}
        accessible={false}
        accessibilityLabel="Formulario de registro"
      >
        <Text 
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
          accessibilityLevel={1}
        >
          Crear Cuenta
        </Text>
        
        <View 
          style={styles.loginSection}
          accessible={true}
          accessibilityLabel="Opción de inicio de sesión"
        >
          <Text 
            style={styles.loginText}
            accessible={true}
            accessibilityRole="text"
          >
            ¿Ya tienes una cuenta? 
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
            accessibilityHint="Ir a la pantalla de inicio de sesión"
          >
            <Text style={styles.loginLink}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Campo Nombre */}
        <Text 
          style={styles.label}
          accessible={true}
          accessibilityRole="text"
        >
          Nombre Completo
        </Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
          placeholder="Ingresa tu nombre completo"
          accessible={true}
          accessibilityLabel="Campo de nombre completo"
          accessibilityHint="Ingresa tu nombre completo"
          accessibilityRole="none"
          textContentType="name"
          autoComplete="name"
        />

        {/* Campo Email */}
        <Text 
          style={styles.label}
          accessible={true}
          accessibilityRole="text"
        >
          Email
        </Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="usuario@ejemplo.com"
          accessible={true}
          accessibilityLabel="Campo de correo electrónico"
          accessibilityHint="Ingresa tu dirección de correo electrónico"
          accessibilityRole="none"
          textContentType="emailAddress"
          autoComplete="email"
        />

        {/* Campo Contraseña */}
        <Text 
          style={styles.label}
          accessible={true}
          accessibilityRole="text"
        >
          Contraseña
        </Text>
        <View 
          style={styles.passwordContainer}
          accessible={false}
        >
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!mostrarPassword}
            placeholder="••••••••"
            accessible={true}
            accessibilityLabel="Campo de contraseña"
            accessibilityHint="Ingresa tu contraseña"
            accessibilityRole="none"
            textContentType="newPassword"
            autoComplete="password-new"
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={toggleMostrarPassword}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            accessibilityHint={mostrarPassword ? "Oculta la contraseña" : "Muestra la contraseña"}
          >
            <MaterialIcons 
              name={mostrarPassword ? "visibility-off" : "visibility"}
              size={24}
              color="#999"
              accessible={false}
            />
          </TouchableOpacity>
        </View>

        {/* Campo Confirmar Contraseña */}
        <Text 
          style={styles.label}
          accessible={true}
          accessibilityRole="text"
        >
          Confirmar Contraseña
        </Text>
        <View 
          style={getPasswordConfirmStyle()}
          accessible={false}
        >
          <TextInput
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!mostrarConfirmPassword}
            placeholder="••••••••"
            accessible={true}
            accessibilityLabel="Campo de confirmación de contraseña"
            accessibilityHint="Confirma tu contraseña"
            accessibilityRole="none"
            textContentType="newPassword"
            autoComplete="password-new"
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={toggleMostrarConfirmPassword}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={mostrarConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
          >
            <MaterialIcons 
              name={mostrarConfirmPassword ? "visibility-off" : "visibility"}
              size={24}
              color="#999"
              accessible={false}
            />
          </TouchableOpacity>
          {passwordsMatch !== null && (
            <View style={styles.matchIndicator}>
              <Text style={styles.matchIcon}>
                {passwordsMatch ? "✓" : "✗"}
              </Text>
            </View>
          )}
        </View>

        {/* Mensaje de estado de contraseñas */}
        {passwordsMatch !== null && (
          <Text 
            style={[
              styles.passwordMessage,
              passwordsMatch ? styles.passwordMessageSuccess : styles.passwordMessageError
            ]}
            accessible={true}
            accessibilityRole="text"
          >
            {passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
          </Text>
        )}

        <TouchableOpacity 
          style={[
            styles.registerButton,
            (!nombre || !email || !password || !confirmPassword || !passwordsMatch) && styles.buttonDisabled
          ]} 
          onPress={handleRegister}
          disabled={!nombre || !email || !password || !confirmPassword || !passwordsMatch}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Crear cuenta"
          accessibilityHint="Crea una nueva cuenta con los datos ingresados"
        >
          <Text 
            style={[
              styles.registerButtonText,
              (!nombre || !email || !password || !confirmPassword || !passwordsMatch) && styles.buttonTextDisabled
            ]}
            accessible={false}
          >
            Crear Cuenta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8BC34A',
    paddingHorizontal: 16,
    paddingTop: 60,
    alignItems: 'center',
    width: '100%'
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
});