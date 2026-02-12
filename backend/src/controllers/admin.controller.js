import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Template from "../models/Template.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

// ============ VENDOR MANAGEMENT BY SUPER ADMIN ============

/**
 * @desc    Create new vendor/admin by Super Admin
 * @route   POST /api/admin/create-vendor
 * @access  Private (Super Admin only)
 */
export const createVendor = async (req, res) => {
  try {
    const {
      vendorName,
      ownerEmail,
      ownerName,
      password,
      subdomain,
      template,
      theme
    } = req.body;

    // 1. Check if Super Admin
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Only Super Admin can create vendors" 
      });
    }

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email: ownerEmail });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }

    // 3. Check if subdomain is available
    const existingVendor = await Vendor.findOne({ subdomain });
    if (existingVendor) {
      return res.status(400).json({ 
        success: false, 
        message: "Subdomain already taken" 
      });
    }

    // 4. Generate unique store URL
    const baseDomain = process.env.BASE_DOMAIN || "localhost:3000";
    const storeUrl = `http://${subdomain}.${baseDomain}`;

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create vendor record first
    const vendor = await Vendor.create({
      name: vendorName,
      subdomain,
      template: template || "modern-blue",
      theme: {
        primaryColor: theme?.primaryColor || "#4F46E5",
        secondaryColor: theme?.secondaryColor || "#10B981",
        accentColor: theme?.accentColor || "#F59E0B",
        fontFamily: theme?.fontFamily || "Inter",
        logo: theme?.logo || "/default-logo.png",
        bannerImage: theme?.bannerImage || "/default-banner.jpg",
        bannerText: theme?.bannerText || `Welcome to ${vendorName}!`
      },
      storeUrl,
      createdBy: req.user.id
    });

    // 7. Create vendor admin user
    const user = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: hashedPassword,
      role: "ADMIN", // ADMIN = vendor admin
      vendorId: vendor._id
    });

    // 8. Update vendor with owner ID
    vendor.owner = user._id;
    await vendor.save();

    // 9. Generate token for vendor (optional - for auto-login)
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.name,
          subdomain: vendor.subdomain,
          storeUrl: vendor.storeUrl,
          template: vendor.template,
          theme: vendor.theme
        },
        admin: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token // Send token if you want auto-login
      }
    });

  } catch (error) {
    console.error("Create Vendor Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Get all vendors (for Super Admin)
 * @route   GET /api/admin/vendors
 * @access  Private (Super Admin only)
 */
export const getAllVendors = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    const vendors = await Vendor.find()
      .populate("owner", "name email")
      .populate("createdBy", "name email")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Get single vendor details
 * @route   GET /api/admin/vendors/:id
 * @access  Private (Super Admin only)
 */
export const getVendorById = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    const vendor = await Vendor.findById(req.params.id)
      .populate("owner")
      .populate("createdBy");

    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Update vendor
 * @route   PUT /api/admin/vendors/:id
 * @access  Private (Super Admin only)
 */
export const updateVendor = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Delete vendor (soft delete)
 * @route   DELETE /api/admin/vendors/:id
 * @access  Private (Super Admin only)
 */
export const deleteVendor = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }

    // Soft delete - just deactivate
    vendor.isActive = false;
    await vendor.save();

    // Also deactivate the admin user
    if (vendor.owner) {
      await User.findByIdAndUpdate(vendor.owner, { isActive: false });
    }

    res.status(200).json({
      success: true,
      message: "Vendor deactivated successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Get all templates
 * @route   GET /api/admin/templates
 * @access  Private (Super Admin only)
 */
export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ isActive: true });
    
    res.status(200).json({
      success: true,
      data: templates
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * @desc    Create template
 * @route   POST /api/admin/templates
 * @access  Private (Super Admin only)
 */
export const createTemplate = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    const template = await Template.create(req.body);

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: template
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};