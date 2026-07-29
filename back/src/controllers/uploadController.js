// POST /api/upload/image and POST /api/upload/video — admin only.
// Both save the file to disk and return a public URL the frontend can
// store directly on a product.

function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file was received.' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
}

function uploadVideo(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No video file was received.' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
}

module.exports = { uploadImage, uploadVideo };