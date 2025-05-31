import axios from 'axios';
import { Platform } from 'react-native';
import { normalizeUser } from '../utils/user';


const PORT = 3000;
const HOST = '192.168.1.28';

const API_BASE_URL = `http://${HOST}:${PORT}`; 

import AsyncStorage from '@react-native-async-storage/async-storage';


const api = axios.create({
  baseURL: API_BASE_URL,
});

export const guardarSesion = async (token, usuario) => {
  const normalizedUser = normalizeUser(usuario);
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('usuario', JSON.stringify(normalizedUser));
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
    console.log('error: ', error);
    throw new Error('Credenciales inválidas o error del servidor');
  }
};

export const register = async (thisEmail, thisPassword, thisName, thisLocation) => {
  try {
    console.log('Intentando registrar usuario con: \nnombre ->', thisName, 
      '\nemail ->', thisEmail, 
      '\npassword ->', thisPassword, 
      '\nubicación ->', thisLocation
    );

    const response = await api.post('/auth/register_user', {
      nombre: thisName,
      email: thisEmail,
      password: thisPassword,
      foto_perfil: null,
      biografia: null,
      ubicacion: thisLocation
    });
    //imprimir el JSON de respuesta
    const usuario = response.data;
    console.log('--------------\n[REGISTER] Respuesta del servidor:', usuario, '\n--------------');

    return usuario;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw new Error('Error al registrar usuario. Por favor, intenta de nuevo.');
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
    throw new Error('Error al enviar imagen al backend');
  }
};

export const listarColeccionables = async (id) => {
  try {
    const response = await api.get(`/users/${id}/collectibles`);
    //console.log('[Collectibles]\nColeccionables obtenidos:\n', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar coleccionables:', error);
    throw error;
  }
};

export const listarFotos = async () => {
  try {
    const response = await api.get(`/photos`);
    //console.log('[Photos]\nFotos obtenidas:\n', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar fotos:', error);
    throw error;
  }
};

//router.put('/users/:id', userController.updateUser);
//{ nombre, correo,  foto_perfil, biografia, visibilidad_perfil }

export const actualizarUsuario = async (id, data) => {
  try {
    const response = await api.put(`/users/${id}`, data);
    console.log('[UPDATE USER] Usuario actualizado:', response.data);
    return response.data[0];
  }
  catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw new Error('Error al actualizar usuario');
  }
}

//router.put('/users/:id/password', userController.updateUserPassword);

export const actualizarPassword = async (id, thisNewPassword, thisActualPassword) => {
  try {
    const response = await api.put(`/users/${id}/password`, { actualPassword: thisActualPassword, newPassword: thisNewPassword });
    console.log('[UPDATE PASSWORD] Contraseña actualizada:', response.data);
    return response.data[0];
  }
  catch (error) {
    console.error('Error al actualizar contraseña:', error);
    throw new Error('Error al actualizar contraseña');
  }
} 

export default api;
