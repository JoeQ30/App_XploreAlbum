const express = require('express');
const router = express.Router();

const app = express();
app.use(express.json());

// Controladores (tú los crearás después)
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const followController = require('../controllers/followController');
const placeController = require('../controllers/placeController');
const photoController = require('../controllers/photoController');
const albumController = require('../controllers/albumController');
const achievementController = require('../controllers/achievementController');
const collectibleController = require('../controllers/collectibleController');
const locationController = require('../controllers/locationController');
const notificationController = require('../controllers/notificationController');
const adminController = require('../controllers/adminController');
const iaRoutes = require('./iaRoutes');

// -------- IA y Reconocimiento de Imágenes --------
router.use('/ai', iaRoutes);



// -------- Autenticación --------
router.post('/auth/register_user', authController.registerUser);
router.post('/auth/register_admin', authController.registerAdmin);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// -------- Usuarios --------
router.get('/users', userController.list);
router.delete('/users/:id', userController.deleteUserById);
router.delete('/users', userController.deleteUserByName);
router.get('/users/search/:name', userController.getUserByName);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.put('/users/:id/password', userController.updateUserPassword);

// -------- Seguimientos --------
router.post('/users/:id/follow', followController.follow);
router.delete('/users/:id/unfollow', followController.unfollow);
router.get('/users/:id/followers', followController.getFollowers);
router.get('/users/:id/following', followController.getFollowing);
router.get('/users/:id/following/count', followController.getFollowingCount);
router.get('/users/:id/followers/count', followController.getFollowersCount);
router.get('/users/:id/isFollowing', followController.isFollowing);


// -------- Lugares y categorías --------
router.get('/places', placeController.list);
router.get('/places/:id', placeController.get);
router.get('/places/:id/history', placeController.getHistory);
router.get('/places/:id/schedule', placeController.getSchedule);
router.get('/categories', placeController.getCategories);

// -------- Fotos --------
router.post('/photos', photoController.upload);
router.get('/photos/:id', photoController.get);
router.delete('/photos/:id', photoController.remove);
router.get('/photos', photoController.listar);
router.get('/places/:id/photos', photoController.getByPlace);

// -------- Álbumes --------
router.post('/albums', albumController.create);
router.get('/albums/:id', albumController.get);
router.put('/albums/:id', albumController.update);
router.delete('/albums/:id', albumController.remove);
router.post('/albums/:id/photos', albumController.addPhoto);
router.delete('/albums/:id/photos/:pid', albumController.removePhoto);
router.get('/users/:id/albums', albumController.getByUser);

// -------- Logros --------
router.get('/achievements', achievementController.list);
router.get('/users/:id/achievements', achievementController.getByUser);

// -------- Coleccionables --------
router.get('/collectibles', collectibleController.list);
router.get('/users/:id/collectibles', collectibleController.getByUser);
router.get('/users/:id/collectibles/count', collectibleController.getCantColeccionablesDesbloqueados);

// -------- Ubicación y visitas --------
router.post('/locations/validate', locationController.validateLocation);
router.post('/places/:id/visit', locationController.registerVisit);
router.get('/users/:id/visits', locationController.getUserVisits);

// -------- Notificaciones --------
router.get('/notifications', notificationController.getAll);
router.put('/notifications/:id/read', notificationController.markAsRead);

// -------- Admin --------
router.get('/admin/photos/pending', adminController.getPendingPhotos);
router.put('/admin/photos/:id', adminController.reviewPhoto);
router.get('/admin/users', adminController.getUsers);
router.delete('/admin/users/:id', adminController.removeUser);

module.exports = router;
