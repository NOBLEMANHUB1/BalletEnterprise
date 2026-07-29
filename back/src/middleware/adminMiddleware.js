const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Verifies an admin's JWT. Attaches req.admin if valid.
async function protectAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    req.admin = await Admin.findById(decoded.id).select('-passwordHash');

    if (!req.admin) {
      return res.status(401).json({ message: 'Admin no longer exists.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token.' });
  }
}

module.exports = { protectAdmin };