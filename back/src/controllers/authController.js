const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const logActivity = require("../utils/logActivity");

function isEmail(contact) {
  return /\S+@\S+\.\S+/.test(contact);
}

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { fullName, contact, password } = req.body;

    if (!fullName || !contact || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required.",
      });
    }

    if (!isEmail(contact)) {
      return res.status(400).json({
        message: "Please use a valid email address.",
      });
    }

    const existing = await User.findOne({ contact });

    if (existing) {
      return res.status(409).json({
        message: "An account with that email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: fullName,
      contact,
      contactType: "email",
      passwordHash,
      isVerified: true,
    });

    logActivity({
      category: "Auth",
      action: "New user registered",
      user: `${user.name} (${user.contact})`,
      details: "Account created successfully.",
      req,
    });

    const token = generateToken({ id: user._id });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        contact: user.contact,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/signin
async function signin(req, res, next) {
  try {
    const { contact, password } = req.body;

    const user = await User.findOne({ contact });

    if (!user) {
      logActivity({
        category: "Auth",
        action: "Failed sign-in attempt",
        user: contact,
        details: "User not found.",
        req,
      });

      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      logActivity({
        category: "Auth",
        action: "Failed sign-in attempt",
        user: `${user.name} (${user.contact})`,
        details: "Wrong password.",
        req,
      });

      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    logActivity({
      category: "Auth",
      action: "User signed in",
      user: `${user.name} (${user.contact})`,
      details: "",
      req,
    });

    const token = generateToken({ id: user._id });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        contact: user.contact,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  signin,
};
