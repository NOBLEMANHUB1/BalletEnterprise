const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Make sure the uploads folder actually exists before multer tries to write to it
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function makeStorage(prefix) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
  });
}

function imageFileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP, and GIF images are allowed.'));
  }
}

function videoFileFilter(req, file, cb) {
  const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4, WEBM, and MOV videos are allowed.'));
  }
}

const imageUpload = multer({
  storage: makeStorage('product'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per image
});

const videoUpload = multer({
  storage: makeStorage('video'),
  fileFilter: videoFileFilter,
  limits: { fileSize: 60 * 1024 * 1024 } // 60MB — plenty for a short 3-minute clip
});

module.exports = { imageUpload, videoUpload };