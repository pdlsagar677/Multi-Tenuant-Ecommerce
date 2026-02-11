import User from "../models/User.js";
import bcrypt from "bcrypt";

// Create a vendor/admin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, frontendTheme } = req.body;

    // Only SUPER_ADMIN can create
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate frontend URL (subdomain)
    const frontendUrl = `https://${email.split("@")[0]}.yourapp.com`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "ADMIN",
      frontendTheme: frontendTheme || "default",
      frontendUrl,
    });

    res.status(201).json({
      message: "Admin created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        frontendUrl: user.frontendUrl,
        frontendTheme: user.frontendTheme,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
