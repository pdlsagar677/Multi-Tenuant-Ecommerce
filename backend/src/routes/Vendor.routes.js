import express from "express";
import { 
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
} from "../controllers/vendor.controller.js";
import { protect, vendorAdminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require vendor admin authentication
router.use(protect);
router.use(vendorAdminOnly);

// Dashboard
router.get("/dashboard", getVendorDashboard);

// Products
router.get("/products", getProducts);
router.get("/products/:id", getProduct);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/bulk-delete", bulkDeleteProducts);

// Orders
router.get("/orders", getOrders);
router.get("/orders/:id", getOrder);
router.put("/orders/:id/status", updateOrderStatus);

// Settings
router.put("/settings", updateStoreSettings);
router.post("/settings/logo", uploadLogo);

// Analytics
router.get("/analytics", getAnalytics);

// Customers
router.get("/customers", getCustomers);

export default router;