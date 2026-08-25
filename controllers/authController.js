import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

//Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role || "user" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // token valid for 7 days
  );
};

//Register new user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "❌ User already exists" });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      msg: "✅ User registered successfully",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ msg: "❌ Server error" });
  }
};

//Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "❌ Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "❌ Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({
      msg: "✅ Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("❌ Error logging in:", err);
    res.status(500).json({ msg: "❌ Server error" });
  }
};

//Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "❌ User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ msg: "❌ Server error" });
  }
};
