const express = require('express');
const router = express.Router();
const { imageUpload, videoUpload } = require('../middleware/upload');
const { uploadImage, uploadVideo } = require('../controllers/uploadController');
const { protectAdmin } = require('../middleware/adminMiddleware');

router.post('/image', protectAdmin, imageUpload.single('image'), uploadImage);
router.post('/video', protectAdmin, videoUpload.single('video'), uploadVideo);

module.exports = router;