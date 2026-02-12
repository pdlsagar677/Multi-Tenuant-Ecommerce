import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ============ VENDOR DASHBOARD & STORE MANAGEMENT ============

/**
 * @desc    Get vendor dashboard data
 * @route   GET /api/vendor/dashboard
 * @access  Private (Vendor Admin only)
 */
export const getVendorDashboard = async (req, res) => {
  try {
    // Get vendor ID from authenticated user
    const vendorId = req.user.vendorId;
    
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "No vendor associated with this user"
      });
    }

    // Fetch vendor details
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    // Fetch vendor's products
    const products = await Product.find({ vendorId })
      .sort("-createdAt")
      .limit(10);

    // Fetch recent orders
    const recentOrders = await Order.find({ vendorId })
      .sort("-createdAt")
      .limit(5);

    // Calculate statistics
    const totalProducts = await Product.countDocuments({ vendorId });
    const totalOrders = await Order.countDocuments({ vendorId });
    
    // Calculate total revenue
    const orders = await Order.find({ 
      vendorId, 
      "payment.status": "completed" 
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Calculate today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      vendorId,
      createdAt: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.name,
          subdomain: vendor.subdomain,
          storeUrl: vendor.storeUrl,
          template: vendor.template,
          theme: vendor.theme,
          settings: vendor.settings
        },
        stats: {
          totalProducts,
          totalOrders,
          totalRevenue,
          todayOrders
        },
        recentProducts: products,
        recentOrders
      }
    });

  } catch (error) {
    console.error("Vendor Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============ PRODUCT MANAGEMENT ============

/**
 * @desc    Get all products for vendor
 * @route   GET /api/vendor/products
 * @access  Private (Vendor Admin only)
 */
export const getProducts = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { vendorId };
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === "true";
    }

    // Search by name or SKU
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { sku: { $regex: req.query.search, $options: "i" } }
      ];
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "-createdAt");

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/vendor/products/:id
 * @access  Private (Vendor Admin only)
 */
export const getProduct = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const productId = req.params.id;

    const product = await Product.findOne({
      _id: productId,
      vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/vendor/products
 * @access  Private (Vendor Admin only)
 */
export const createProduct = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;

    // Generate SKU if not provided
    if (!req.body.sku) {
      const vendor = await Vendor.findById(vendorId);
      const prefix = vendor.subdomain.slice(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      req.body.sku = `${prefix}-${timestamp}`;
    }

    // Add vendorId to product data
    const productData = {
      ...req.body,
      vendorId
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (error) {
    // Handle duplicate SKU error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists. Please use a different SKU."
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/vendor/products/:id
 * @access  Private (Vendor Admin only)
 */
export const updateProduct = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const productId = req.params.id;

    // Check if product exists and belongs to vendor
    const product = await Product.findOne({
      _id: productId,
      vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission"
      });
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/vendor/products/:id
 * @access  Private (Vendor Admin only)
 */
export const deleteProduct = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const productId = req.params.id;

    const product = await Product.findOne({
      _id: productId,
      vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission"
      });
    }

    // Soft delete - just mark as inactive
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Bulk delete products
 * @route   POST /api/vendor/products/bulk-delete
 * @access  Private (Vendor Admin only)
 */
export const bulkDeleteProducts = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { productIds } = req.body;

    await Product.updateMany(
      { _id: { $in: productIds }, vendorId },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: `${productIds.length} products deactivated successfully`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============ ORDER MANAGEMENT ============

/**
 * @desc    Get vendor orders
 * @route   GET /api/vendor/orders
 * @access  Private (Vendor Admin only)
 */
export const getOrders = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { vendorId };
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search by order number or customer email
    if (req.query.search) {
      query.$or = [
        { orderNumber: { $regex: req.query.search, $options: "i" } },
        { "customer.email": { $regex: req.query.search, $options: "i" } },
        { "customer.name": { $regex: req.query.search, $options: "i" } }
      ];
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const orders = await Order.find(query)
      .skip(skip)
      .limit(limit)
      .sort("-createdAt");

    const total = await Order.countDocuments(query);

    // Calculate order statistics
    const stats = {
      pending: await Order.countDocuments({ vendorId, status: "pending" }),
      processing: await Order.countDocuments({ vendorId, status: "processing" }),
      completed: await Order.countDocuments({ vendorId, status: "delivered" }),
      cancelled: await Order.countDocuments({ vendorId, status: "cancelled" })
    };

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/vendor/orders/:id
 * @access  Private (Vendor Admin only)
 */
export const getOrder = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const orderId = req.params.id;

    const order = await Order.findOne({
      _id: orderId,
      vendorId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/vendor/orders/:id/status
 * @access  Private (Vendor Admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const orderId = req.params.id;
    const { status, trackingNumber } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      vendorId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update order status
    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============ STORE SETTINGS ============

/**
 * @desc    Update store settings
 * @route   PUT /api/vendor/settings
 * @access  Private (Vendor Admin only)
 */
export const updateStoreSettings = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    const { theme, settings, contact } = req.body;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    // Update theme
    if (theme) {
      vendor.theme = {
        ...vendor.theme,
        ...theme
      };
    }

    // Update settings
    if (settings) {
      vendor.settings = {
        ...vendor.settings,
        ...settings
      };
    }

    // Update contact info
    if (contact) {
      vendor.contact = {
        ...vendor.contact,
        ...contact
      };
    }

    await vendor.save();

    res.status(200).json({
      success: true,
      message: "Store settings updated successfully",
      data: {
        theme: vendor.theme,
        settings: vendor.settings,
        contact: vendor.contact
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Upload store logo
 * @route   POST /api/vendor/settings/logo
 * @access  Private (Vendor Admin only)
 */
export const uploadLogo = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const vendor = await Vendor.findById(vendorId);
    
    // Update logo URL (you'll need to implement file upload logic)
    vendor.theme.logo = req.file.path; // or Cloudinary URL
    
    await vendor.save();

    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      data: {
        logo: vendor.theme.logo
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============ ANALYTICS ============

/**
 * @desc    Get sales analytics
 * @route   GET /api/vendor/analytics
 * @access  Private (Vendor Admin only)
 */
export const getAnalytics = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    const { period = "month" } = req.query;
    
    let startDate = new Date();
    
    // Set date range based on period
    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get orders in date range
    const orders = await Order.find({
      vendorId,
      createdAt: { $gte: startDate },
      "payment.status": "completed"
    });

    // Group by date
    const salesByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          orders: 0,
          revenue: 0
        };
      }
      salesByDate[date].orders += 1;
      salesByDate[date].revenue += order.total;
    });

    // Get top products
    const topProducts = await Product.find({ vendorId })
      .sort("-soldCount")
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        period,
        salesByDate: Object.values(salesByDate),
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: orders.length > 0 
          ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
          : 0,
        topProducts
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============ CUSTOMER MANAGEMENT ============

/**
 * @desc    Get vendor's customers
 * @route   GET /api/vendor/customers
 * @access  Private (Vendor Admin only)
 */
export const getCustomers = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    
    // Get unique customers from orders
    const customers = await Order.aggregate([
      { $match: { vendorId } },
      { $group: {
        _id: "$customer.email",
        name: { $first: "$customer.name" },
        email: { $first: "$customer.email" },
        phone: { $first: "$customer.phone" },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total" },
        lastOrder: { $max: "$createdAt" }
      }},
      { $sort: { lastOrder: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getVendorDashboard,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  getOrders,
  getOrder,
  updateOrderStatus,
  updateStoreSettings,
  uploadLogo,
  getAnalytics,
  getCustomers
};