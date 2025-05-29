import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../services/api';

const logo = require('../assets/images/logo/Letter1-F_Verde.png');

export default function LoginForm() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const userData = await login(correo, contraseña);
      console.log(correo, contraseña);
      Alert.alert('Bienvenido', `Hola ${userData.nombre}`);
      console.log('[LOGIN] Datos del usuario:', userData);
      navigation.navigate('Navigator', { user: userData });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Credenciales inválidas');
    }
  };

  const toggleMostrarContraseña = () => {
    setMostrarContraseña(!mostrarContraseña);
  };

  return (
    <View 
      style={styles.container}
      accessible={false}
      accessibilityLabel="Pantalla de inicio de sesión"
    >
      {/* Logo */}
      <Image 
        source={logo} 
        style={styles.logo}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel="Logo de la aplicación"
      />

      {/* Tarjeta de login */}
      <View 
        style={styles.loginCard}
        accessible={false}
        accessibilityLabel="Formulario de inicio de sesión"
      >
        <Text 
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
          accessibilityLevel={1}
        >
          Iniciar Sesión
        </Text>
        
        <View 
          style={styles.registerSection}
          accessible={true}
          accessibilityLabel="Opción de registro"
        >
          <Text 
            style={styles.registerText}
            accessible={true}
            accessibilityRole="text"
          >
            No tienes una cuenta? 
          </Text>
          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Registrarme"
            accessibilityHint="Ir a la pantalla de registro"
          >
            <Text style={styles.registerLink}>Registrarme</Text>
          </TouchableOpacity>
        </View>

        <Text 
          style={styles.label}
          accessible={true}
          accessibilityRole="text"
        >
          Usuario
        </Text>
        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
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
            value={contraseña}
            onChangeText={setContraseña}
            secureTextEntry={!mostrarContraseña}
            placeholder="••••••••"
            accessible={true}
            accessibilityLabel="Campo de contraseña"
            accessibilityHint="Ingresa tu contraseña"
            accessibilityRole="none"
            textContentType="password"
            autoComplete="password"
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={toggleMostrarContraseña}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={mostrarContraseña ? "Ocultar contraseña" : "Mostrar contraseña"}
            accessibilityHint={mostrarContraseña ? "Oculta la contraseña" : "Muestra la contraseña"}
          >
            <Text 
              style={styles.eyeText}
              accessible={false}
            >
              {mostrarContraseña ? "🙈" : "👁"}
            </Text>
          </TouchableOpacity>
        </View>

        <View 
          style={styles.checkboxContainer}
          accessible={false}
        >
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setRecordarme(!recordarme)}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityLabel="Recordarme"
            accessibilityHint="Mantener la sesión iniciada"
            accessibilityState={{ checked: recordarme }}
          >
            <View 
              style={[styles.checkboxBox, recordarme && styles.checkboxChecked]}
              accessible={false}
            >
              {recordarme && (
                <Text 
                  style={styles.checkboxTick}
                  accessible={false}
                >
                  ✓
                </Text>
              )}
            </View>
            <Text 
              style={styles.checkboxText}
              accessible={false}
            >
              Recordarme
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Iniciar sesión"
          accessibilityHint="Inicia sesión con las credenciales ingresadas"
        >
          <Text 
            style={styles.loginButtonText}
            accessible={false}
          >
            Entrar
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
    paddingTop: 80,
    alignItems: 'center',
    width: '100%'
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 50,
  },
  loginCard: {
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
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  },
  eyeText: {
    fontSize: 18,
    color: '#999',
  },
  checkboxContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxTick: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    color: '#666',
  },
  loginButton: {
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
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});