import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized - No token" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false, 
      message: "Not authorized - Token failed" 
    });
  }
};

export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied - Super Admin only" 
    });
  }
  next();
};

export const vendorAdminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied - Vendor Admin only" 
    });
  }
  
  // Add vendorId from user token to request
  req.vendorId = req.user.vendorId;
  next();
};