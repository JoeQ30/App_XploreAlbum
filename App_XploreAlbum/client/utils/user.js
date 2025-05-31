// Por incongruencias en la forma en la que el backend envía el id del usuario
// y la forma en la que el frontend lo espera, se normaliza el objeto usuario
// para que siempre tenga un campo `id` que sea consistente.
// utils/user.js
export const normalizeUser = (user) => {
  return {
    ...user,
    id: user.id || user.id_usuario,
  };
};