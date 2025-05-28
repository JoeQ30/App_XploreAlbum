import axios from 'axios';



const ApiBaseURL = process.env.API_BASE_URL; // reemplaza por tu IP y puerto real


const api = axios.create({
  baseURL: ApiBaseURL,
});

export const login = async (correo, contraseña) => {
  try {
    const response = await axios.post(`${ApiBaseURL}/auth/login`, {
      email: correo,
      password: contraseña,
    });
    return response.data;
  } catch (error) {
    throw new Error('Credenciales inválidas o error del servidor');
  }
};

export default api;
