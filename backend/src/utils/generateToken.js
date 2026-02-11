import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      vendorId: user.vendorId
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
