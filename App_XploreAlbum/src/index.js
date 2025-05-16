const express = require('express');
const morgan = require('morgan');
const taskRoutes = require('./routes/tasks.routes.js');

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use(taskRoutes);
// Middleware para manejar errores
app.use((err, req, res, next) => {
    return res.json({
        error: err.message || 'An unexpected error occurred'
    });
});

app.listen(4000);
console.log('Server is running on port 4000');