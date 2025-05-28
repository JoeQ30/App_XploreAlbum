import axios from 'axios';
import { Platform } from 'react-native';

//const API_BASE_URL = 'http://192.168.7.241:3000'; 
const API_BASE_URL = 'http://192.168.1.28:3000';

import AsyncStorage from '@react-native-async-storage/async-storage';


const api = axios.create({
  baseURL: API_BASE_URL,
});

export const guardarSesion = async (token, usuario) => {
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
};

export const login = async (thisEmail, thisPassword) => {
  try {

    console.log('Intentando iniciar sesión con:', thisEmail, thisPassword);

    if (!thisEmail || !thisPassword) {
      throw new Error('Por favor, ingresa tu correo y contraseña');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: thisEmail,
      password: thisPassword,
    });

    console.log('Respuesta del servidor:', response.data);

    const { token, usuario } = response.data;

    await guardarSesion(token, usuario);

    return usuario;

  } catch (error) {
    console.log('error: ', error);
    throw new Error('Credenciales inválidas o error del servidor');
  }
};

export const listarLogros = async () => {
  try {
    const response = await api.get('/achievements');
    //console.log('[Achievements]\nLogros obtenidos:\n', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar logros:', error);
    throw error;
  }
};

export const listarUsuarios = async () => {
  try {
    const response = await api.get('/users');
    //console.log('[Users]\nUsuarios obtenidos:\n', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    throw error;
  }
};

export const sendImageToBackend = async (imageUri) => {
  const formData = new FormData();

  // Extrae el nombre del archivo desde la URI (puedes ajustar esto según tu librería de imágenes)
  const filename = imageUri.split('/').pop();
  const fileType = filename.split('.').pop();

  formData.append('image', {
    uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
    name: filename,
    type: `image/${fileType}`
  });

  try {
    const response = await axios.post(`${API_BASE_URL}/api/ia/recognize`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error al enviar imagen al backend:', error.response?.data || error.message);
    throw error;
  }
};

export default api;
