import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Unique order number (readable format)
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    
    // Which vendor this order belongs to (CRITICAL for multi-tenancy)
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true
    },

    // Customer information
    customer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: true
      },
      shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zipCode: { type: String, required: true }
      },
      billingAddress: {
        sameAsShipping: { type: Boolean, default: true },
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
      }
    },

    // Order items
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: {
          type: String,
          required: true
        },
        sku: String,
        price: {
          type: Number,
          required: true,
          min: 0
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        variant: {
          name: String,
          value: String
        },
        image: String,
        total: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    // Order summary
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },

    // Payment information
    payment: {
      method: {
        type: String,
        enum: ["cod", "esewa", "khalti", "card", "bank"],
        required: true
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending"
      },
      transactionId: String,
      paidAt: Date,
      gatewayResponse: mongoose.Schema.Types.Mixed
    },

    // Order status
    status: {
      type: String,
      enum: [
        "pending",      // Order placed, waiting for confirmation
        "confirmed",    // Order confirmed by vendor
        "processing",   // Being prepared
        "shipped",      // Dispatched
        "delivered",    // Received by customer
        "cancelled",    // Cancelled by customer/vendor
        "refunded",     // Refunded
        "failed"        // Payment failed
      ],
      default: "pending"
    },

    // Shipping tracking
    shippingMethod: {
      type: String,
      default: "standard"
    },
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,

    // Additional information
    notes: String,
    cancellationReason: String,
    
    // Metadata
    ipAddress: String,
    userAgent: String,
    
    // Audit
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        note: String,
        changedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============ INDEXES FOR PERFORMANCE ============
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ createdAt: 1 });

// ============ MIDDLEWARE ============

// Generate order number before saving
orderSchema.pre("save", async function(next) {
  if (this.isNew) {
    // Get vendor prefix (first 3 letters of vendor name or subdomain)
    const Vendor = mongoose.model("Vendor");
    const vendor = await Vendor.findById(this.vendorId);
    const prefix = vendor?.subdomain?.slice(0, 3).toUpperCase() || "VND";
    
    // Generate unique order number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    // Count orders today for sequence
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const orderCount = await this.constructor.countDocuments({
      vendorId: this.vendorId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const sequence = (orderCount + 1).toString().padStart(4, "0");
    
    // Format: VND-240215-0001 (Vendor Prefix - YYMMDD - Sequence)
    this.orderNumber = `${prefix}-${year}${month}${day}-${sequence}`;
  }
  next();
});

// Calculate totals before saving
orderSchema.pre("save", function(next) {
  // Calculate item totals if not provided
  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      item.total = item.price * item.quantity;
    });
  }
  
  // Calculate order totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.total = this.subtotal + this.tax + this.shipping - this.discount;
  
  next();
});

// Track status changes
orderSchema.pre("save", function(next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      note: `Status changed to ${this.status}`,
      changedAt: new Date()
    });
  }
  next();
});

// ============ VIRTUAL PROPERTIES ============

// Get order age
orderSchema.virtual("age").get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffMs = now - created;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  return diffHours;
});

// Check if order is paid
orderSchema.virtual("isPaid").get(function() {
  return this.payment.status === "completed";
});

// Check if order is cancellable
orderSchema.virtual("isCancellable").get(function() {
  return ["pending", "confirmed"].includes(this.status);
});

// ============ INSTANCE METHODS ============

// Mark order as paid
orderSchema.methods.markAsPaid = async function(transactionId, gatewayResponse) {
  this.payment.status = "completed";
  this.payment.transactionId = transactionId;
  this.payment.paidAt = new Date();
  this.payment.gatewayResponse = gatewayResponse;
  this.status = "confirmed";
  return this.save();
};

// Cancel order
orderSchema.methods.cancel = async function(reason) {
  this.status = "cancelled";
  this.cancellationReason = reason;
  
  // Restore product quantities
  const Product = mongoose.model("Product");
  for (const item of this.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { quantity: item.quantity }
    });
  }
  
  return this.save();
};

// ============ STATIC METHODS ============

// Get sales report for date range
orderSchema.statics.getSalesReport = async function(vendorId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        vendorId: mongoose.Types.ObjectId(vendorId),
        createdAt: { $gte: startDate, $lte: endDate },
        "payment.status": "completed"
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        orders: { $sum: 1 },
        revenue: { $sum: "$total" },
        items: { $sum: { $size: "$items" } }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]);
};

// Get best selling products
orderSchema.statics.getBestSellers = async function(vendorId, limit = 10) {
  return this.aggregate([
    {
      $match: {
        vendorId: mongoose.Types.ObjectId(vendorId),
        "payment.status": "completed"
      }
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.name" },
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.total" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit }
  ]);
};

export default mongoose.model("Order", orderSchema);