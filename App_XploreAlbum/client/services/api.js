import axios from 'axios';
import { Platform } from 'react-native';
import { normalizeUser } from '../utils/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PORT = 3000;
const HOST = '192.168.6.182';
const API_BASE_URL = `http://${HOST}:${PORT}`; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // Increased timeout for image processing
});

// Add token to requests automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export const guardarSesion = async (token, usuario) => {
  const normalizedUser = normalizeUser(usuario);
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('usuario', JSON.stringify(normalizedUser));
};

export const login = async (thisEmail, thisPassword) => {
  try {
    if (!thisEmail || !thisPassword) {
      throw new Error('Por favor, ingresa tu correo y contraseña');
    }

    const response = await api.post('/auth/login', {
      email: thisEmail,
      password: thisPassword,
    });

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
    const response = await api.post('/auth/register_user', {
      nombre: thisName,
      email: thisEmail,
      password: thisPassword,
      foto_perfil: null,
      biografia: null,
      ubicacion: thisLocation
    });
    
    const usuario = response.data;
    return usuario;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw new Error('Error al registrar usuario. Por favor, intenta de nuevo.');
  }
};

// FIXED: More efficient and consistent image sending function
export const sendImageToBackend = async (imageUri) => {
  try {
    console.log('Preparing image for analysis...');
    
    const formData = new FormData();
    
    // Extract filename and type
    const filename = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
    const fileType = filename.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Ensure we have a valid image type
    const validTypes = ['jpg', 'jpeg', 'png', 'webp'];
    const actualType = validTypes.includes(fileType) ? fileType : 'jpg';
    
    // Prepare the image file for FormData
    formData.append('image', {
      uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
      name: `image.${actualType}`,
      type: `image/${actualType === 'jpg' ? 'jpeg' : actualType}`
    });

    console.log('Sending image to backend for analysis...');
    
    // Call the backend recognize endpoint
    const response = await api.post('/ia/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 65000, // 65 seconds timeout for image processing
    });

    console.log('Analysis completed successfully');
    return response.data;
    
  } catch (error) {
    console.error('Error al enviar imagen al backend:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('La conexión tardó demasiado. La imagen puede ser muy grande o tu conexión es lenta.');
    }
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || 'Error del servidor';
      
      if (status === 400) {
        throw new Error('Imagen no válida. Asegúrate de que sea una foto clara.');
      } else if (status === 413) {
        throw new Error('La imagen es demasiado grande. Intenta con una imagen más pequeña.');
      } else if (status === 404) {
        throw new Error(message); // Use backend's specific error message
      } else if (status >= 500) {
        throw new Error('Error del servidor. Intenta de nuevo en unos momentos.');
      } else {
        throw new Error(message);
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      throw new Error('Error inesperado al procesar la imagen. Intenta de nuevo.');
    }
  }
};

// FIXED: Consistent image handling for collection saving
export const saveCollectionToBackend = async ({ lugarId, imageUri }) => {
  try {
    console.log('Converting image for collection save...');
    
    // Convert image to base64 more reliably
    const response = await fetch(imageUri);
    
    if (!response.ok) {
      throw new Error('No se pudo acceder a la imagen');
    }
    
    const blob = await response.blob();
    
    // Convert blob to base64
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Error al procesar la imagen'));
      reader.readAsDataURL(blob);
    });

    console.log('Saving collection to backend...');
    
    const saveResponse = await api.post('/ia/save-collection', {
      lugarId: lugarId,
      imageBase64: base64Data
    });
    
    console.log('Collection saved successfully');
    return saveResponse.data;
    
  } catch (error) {
    console.error('Error al guardar colección:', error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || 'Error del servidor';
      
      if (status === 401) {
        throw new Error('Sesión expirada. Inicia sesión de nuevo.');
      } else if (status === 404) {
        throw new Error('Lugar no encontrado. Intenta de nuevo.');
      } else if (status >= 500) {
        throw new Error('Error del servidor al guardar. Intenta de nuevo.');
      } else {
        throw new Error(message);
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor para guardar.');
    } else {
      throw new Error('Error inesperado al guardar la colección.');
    }
  }
};

// Existing functions...
export const listarLogros = async () => {
  try {
    const response = await api.get('/achievements');
    return response.data;
  } catch (error) {
    console.error('Error al listar logros:', error);
    throw error;
  }
};

//router.get('/users/:id/achievements', achievementController.getByUser);
export const listarLogrosPorUsuario = async (id) => {
  try {
    const response = await api.get(`/users/${id}/achievements`);
    console.log('[Achievements by User]\nLogros obtenidos por el usuario:\n', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar logros por usuario:', error);
    throw error;
  }
};

export const listarUsuarios = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    throw error;
  }
};

export const listarColeccionables = async (id) => {
  try {
    const response = await api.get(`/users/${id}/collectibles`);
    return response.data;
  } catch (error) {
    console.error('Error al listar coleccionables:', error);
    throw error;
  }
};

export const listarFotos = async () => {
  try {
    const response = await api.get(`/photos`);
    return response.data;
  } catch (error) {
    console.error('Error al listar fotos:', error);
    throw error;
  }
};

export const actualizarUsuario = async (id, data) => {
  try {
    const response = await api.put(`/users/${id}`, data);
    return response.data[0];
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw new Error('Error al actualizar usuario');
  }
};

export const actualizarPassword = async (id, thisNewPassword, thisActualPassword) => {
  try {
    const response = await api.put(`/users/${id}/password`, { 
      actualPassword: thisActualPassword, 
      newPassword: thisNewPassword 
    });
    return response.data[0];
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    throw new Error('Error al actualizar contraseña');
  }
};

export const obtenerHistoriaLugar = async (id) => {
  try {
    const response = await api.get(`/places/${id}/history`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial del lugar:', error);
    throw new Error('Error al obtener historial del lugar');
  }
};

export const obtenerLugarPorId = async (id) => {
  try {
    const response = await api.get(`/places/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles del lugar:', error);
    throw new Error('Error al obtener detalles del lugar');
  }
};

//router.post('/users/:id/follow', followController.follow);
export const seguirUsuario = async (id, idSeguido) => {
  try {
    const response = await api.post(`/users/${idSeguido}/follow`, { id_seguidor: id });
    //console.log('[FOLLOW USER] Usuario seguido:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al seguir usuario:', error);
    throw new Error('Error al seguir usuario');
  }
};


//router.get('/users/:id/following', followController.getFollowing);

export const obtenerSeguidos = async (id) => {
  try {
    const response = await api.get(`/users/${id}/following`);
    //console.log('[FOLLOWING USERS] Usuarios seguidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios seguidos:', error);
    throw new Error('Error al obtener usuarios seguidos');
  }
};

//router.post('/users/:id/isFollowing', followController.isFollowing);
export const isFollowing = async (idSeguidor, idSeguido) => {
  try {
    const response = await api.get(`/users/${idSeguido}/isFollowing`, {
      params: { id_seguidor: idSeguidor },
    });
    return response.data.isFollowing;
  } catch (error) {
    console.error('Error al verificar seguimiento:', error);
    return false; // Por defecto, no permitir acceso
  }
};

//router.get('/users/:id/following/count', followController.getFollowingCount);
export const obtenerCantidadSeguidos = async (id) => {
  try {
    const response = await api.get(`/users/${id}/following/count`);
    //console.log('[FOLLOWING COUNT] Cantidad de seguidos:', response.data);
    return response.data.count;
  } catch (error) {
    console.error('Error al obtener cantidad de seguidos:', error);
    throw new Error('Error al obtener cantidad de seguidos');
  }
};

//router.get('/users/:id/followers/count', followController.getFollowersCount);
export const obtenerCantidadSeguidores = async (id) => {
  try {
    const response = await api.get(`/users/${id}/followers/count`);
    //console.log('[FOLLOWERS COUNT] Cantidad de seguidores:', response.data);
    return response.data.count;
  } catch (error) {
    console.error('Error al obtener cantidad de seguidores:', error);
    throw new Error('Error al obtener cantidad de seguidores');
  }
};

//router.get('/users/:id/collectibles/count', collectibleController.getCantColeccionablesDesbloqueados);
export const obtenerCantidadColeccionablesDesbloqueados = async (id) => {
  try {
    const response = await api.get(`/users/${id}/collectibles/count`);
    //console.log('[COLLECTIBLES COUNT] Cantidad de coleccionables desbloqueados:', response.data);
    return response.data.cantidad;
  } catch (error) {
    console.error('Error al obtener cantidad de coleccionables desbloqueados:', error);
    throw new Error('Error al obtener cantidad de coleccionables desbloqueados');
  }
};


export default api;
