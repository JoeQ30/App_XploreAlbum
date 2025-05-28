const express = require('express');
const morgan = require('morgan');
const taskRoutes = require('./routes/tasks.routes.js');

const app = express();
app.use(morgan('dev'));
app.use(express.json());
// Configuración para servir archivos estáticos (para las imágenes subidas)
//app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(taskRoutes);
// Middleware para manejar errores
app.use((err, req, res, next) => {
    return res.json({
        error: err.message || 'An unexpected error occurred'
    });
});

const PORT = 3000;
//const HOST = '192.168.7.241'; // para que acepte conexiones externas
const HOST = '192.168.1.28';

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
