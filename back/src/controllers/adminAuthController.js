const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// POST /api/admin/login
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Incorrect admin email or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect admin email or password.' });
    }

    const token = generateToken({ id: admin._id, isAdmin: true });
    res.json({ token, admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    next(err);
  }
}

module.exports = { adminLogin };