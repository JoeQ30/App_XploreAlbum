import axios from 'axios';

const API_BASE_URL = 'http://192.168.7.241:3000'; 
//const API_BASE_URL = 'http://192.168.56.1:3000'; 
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

    const response = await api.post('/auth/login', {
      email: thisEmail,
      password: thisPassword,
    });

    //console.log('Respuesta del servidor:', response.data);

    const { token, usuario } = response.data;

    await guardarSesion(token, usuario);

    return usuario;

  } catch (error) {
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

export const listarColeccionables = async (id) => {
  try {
    const response = await api.get(`/users/${id}/collectibles`);
    console.log('[Collectibles]\nColeccionables obtenidos:\n', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar coleccionables:', error);
    throw error;
  }
};

export const listarFotos = async () => {
  try {
    const response = await api.get(`/photos`);
    console.log('[Photos]\nFotos obtenidas:\n', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar fotos:', error);
    throw error;
  }
};

export default api;
