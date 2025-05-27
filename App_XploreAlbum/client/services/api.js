import axios from 'axios';

// const API_BASE_URL = 'http://192.168.7.241:3000'; // reemplaza por tu IP y puerto real
const API_BASE_URL = 'http://192.168.56.1:3000'; // reemplaza por tu IP y puerto real

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const login = async (correo, contraseña) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: correo,
      password: contraseña,
    });
    return response.data;
  } catch (error) {
    throw new Error('Credenciales inválidas o error del servidor');
  }
};

export default api;
