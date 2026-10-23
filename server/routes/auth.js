const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    college: user.college,
    email: user.email,
    category: user.category
  };
}

// Registration
router.post("/register", async (req, res) => {
  try {
    const { name, college, email, password, category } = req.body;

    if (
      !name?.trim() ||
      !college?.trim() ||
      !email?.trim() ||
      !password ||
      !category
    ) {
      return res.status(400).json({
        message: "Please fill in all fields."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        message: "Email already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      college,
      email: normalizedEmail,
      password: hashedPassword,
      category
    });

    return res.status(201).json({
      message: "Registration successful!",
      token: makeToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered."
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Registration failed."
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Enter email and password."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    return res.json({
      message: "Login successful!",
      token: makeToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Login failed."
    });
  }
});

// Protected student profile
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please log in."
      });
    }

    const decoded = jwt.verify(
      header.split(" ")[1],
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Account not found."
      });
    }

    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(401).json({
      message: "Invalid or expired session."
    });
  }
});

module.exports = router;