# **Multi-Vendor SaaS E-commerce Platform - Complete Technical Documentation**

## **📋 PROJECT DOCUMENTATION**

---

## **1. PROJECT OVERVIEW**

### **1.1 Executive Summary**
A SaaS-based multi-vendor e-commerce platform where a single Super Admin can create and manage multiple independent vendor stores, each with its own subdomain, branding, and product catalog.

### **1.2 Core Concept**
**"One Codebase, Multiple Stores"** - A single application that dynamically renders different stores based on subdomain, with complete data isolation between vendors.

### **1.3 Key Differentiators**
- **Rapid Store Deployment**: New vendor store in < 5 minutes
- **Zero-Code for Vendors**: Ready-to-use templates
- **Centralized Management**: Super Admin controls all vendors
- **Cost-Effective**: No per-store development costs

---

## **2. SYSTEM ARCHITECTURE**

### **2.1 High-Level Architecture**
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  Super Admin Portal │ Vendor Dashboard │ Customer Store  │
└─────────────────────┴──────────────────┴─────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    API GATEWAY                           │
│          Express.js + Dynamic Subdomain Routing          │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    BUSINESS LAYER                        │
│  Vendor Mgmt │ Product Mgmt │ Order Mgmt │ Theme Mgmt   │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                            │
│  MongoDB Collections with Multi-Tenant Isolation         │
└─────────────────────────────────────────────────────────┘
```

### **2.2 Multi-Tenancy Approach**
- **Database**: Single database with `vendorId` field on all collections
- **Subdomain Routing**: `{vendor-subdomain}.platform-domain.com`
- **Data Isolation**: Row-level security with vendor context

### **2.3 Technical Stack**
```
┌─────────────────┬─────────────────────────────────────┐
│ Layer           │ Technology                          │
├─────────────────┼─────────────────────────────────────┤
│ Backend         │ Node.js + Express.js                │
│ Database        │ MongoDB + Mongoose                  │
│ Frontend        │ Next.js 14 (App Router)             │
│ Styling         │ Tailwind CSS + CSS Variables        │
│ Authentication  │ JWT + Role-based access             │
│ Deployment      │ Vercel (Frontend) + Railway/Render  │
│ Storage         │ Cloudinary (Images)                 │
│ Email           │ Resend/Nodemailer                   │
└─────────────────┴─────────────────────────────────────┘
```

---

## **3. DATABASE SCHEMA**

### **3.1 Collections Overview**
```javascript
// Core Collections
users = []          // All platform users
vendors = []        // Vendor/store configurations
products = []       // Products with vendor_id
orders = []         // Orders with vendor_id
templates = []      // Available store templates
categories = []     // Product categories per vendor
```

### **3.2 Detailed Schema Design**

#### **User Collection**
```javascript
{
  _id: ObjectId,
  email: String,          // unique
  password: String,       // bcrypt hashed
  role: String,           // 'superadmin', 'vendor', 'customer'
  vendorId: ObjectId,     // null for superadmin/customer
  firstName: String,
  lastName: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

#### **Vendor Collection**
```javascript
{
  _id: ObjectId,
  name: String,           // Display name
  subdomain: String,      // Unique subdomain identifier
  template: String,       // Template ID from templates collection
  theme: {
    primaryColor: String, // Hex code
    secondaryColor: String,
    accentColor: String,
    fontFamily: String,
    logo: String,         // Cloudinary URL
    favicon: String,
    bannerImage: String,
    bannerText: String
  },
  settings: {
    currency: String,     // 'USD', 'EUR', etc.
    language: String,     // 'en', 'es', etc.
    timezone: String,
    taxRate: Number,
    shippingCost: Number
  },
  contact: {
    email: String,
    phone: String,
    address: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  isActive: Boolean,
  subscription: {
    plan: String,         // 'basic', 'pro', 'premium'
    status: String,       // 'active', 'suspended', 'canceled'
    billingCycle: String, // 'monthly', 'annual'
    nextBillingDate: Date
  },
  analytics: {
    totalProducts: Number,
    totalOrders: Number,
    totalRevenue: Number,
    monthlyVisitors: Number
  },
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId     // Super Admin who created
}
```

#### **Product Collection**
```javascript
{
  _id: ObjectId,
  vendorId: ObjectId,     // Critical: Links to vendor
  sku: String,            // Unique SKU
  name: String,
  description: String,
  shortDescription: String,
  price: Number,
  comparePrice: Number,
  costPrice: Number,
  quantity: Number,
  lowStockThreshold: Number,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: String          // 'cm', 'in'
  },
  images: [String],       // Array of Cloudinary URLs
  categories: [String],
  tags: [String],
  attributes: [{
    name: String,
    values: [String]
  }],
  variants: [{
    name: String,
    price: Number,
    sku: String,
    quantity: Number,
    attributes: [{
      name: String,
      value: String
    }]
  }],
  seo: {
    title: String,
    description: String,
    slug: String
  },
  isActive: Boolean,
  isFeatured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Order Collection**
```javascript
{
  _id: ObjectId,
  orderNumber: String,    // Format: VENDOR-YYYYMMDD-001
  vendorId: ObjectId,
  customer: {
    userId: ObjectId,     // Optional if registered
    email: String,
    firstName: String,
    lastName: String,
    phone: String,
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    billingAddress: {
      sameAsShipping: Boolean,
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  items: [{
    productId: ObjectId,
    name: String,
    sku: String,
    price: Number,
    quantity: Number,
    variant: {
      name: String,
      value: String
    },
    image: String,
    total: Number
  }],
  summary: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    discount: Number,
    total: Number
  },
  payment: {
    method: String,       // 'cod', 'card', 'esewa'
    status: String,       // 'pending', 'completed', 'failed'
    transactionId: String,
    gatewayResponse: Object
  },
  status: String,         // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  shippingMethod: String,
  trackingNumber: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Template Collection**
```javascript
{
  _id: ObjectId,
  name: String,           // 'Modern Blue', 'Dark Tech'
  identifier: String,     // 'modern-blue', 'dark-tech'
  version: String,        // '1.0.0'
  description: String,
  previewImage: String,
  category: String,       // 'fashion', 'electronics', 'general'
  isActive: Boolean,
  config: {
    customizable: {
      colors: [String],   // ['primary', 'secondary', 'accent']
      fonts: [String],    // ['heading', 'body']
      sections: [String]  // ['header', 'footer', 'hero']
    },
    features: [String],   // ['product-grid', 'search', 'cart']
    layouts: {
      homepage: String,   // 'grid', 'list', 'mixed'
      product: String     // 'standard', 'modern', 'minimal'
    }
  },
  assets: {
    css: String,          // Base CSS file
    components: [String], // React component paths
    images: [String]      // Default images
  },
  price: Number,          // 0 for free templates
  createdAt: Date,
  updatedAt: Date
}
```

---

## **4. API SPECIFICATION**

### **4.1 Authentication Endpoints**
```
POST   /api/auth/register           # User registration
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
GET    /api/auth/me                 # Get current user
POST   /api/auth/forgot-password    # Forgot password
POST   /api/auth/reset-password     # Reset password
```

### **4.2 Super Admin Endpoints**
```
GET    /api/admin/vendors           # List all vendors
POST   /api/admin/vendors           # Create new vendor
GET    /api/admin/vendors/:id       # Get vendor details
PUT    /api/admin/vendors/:id       # Update vendor
DELETE /api/admin/vendors/:id       # Delete vendor
GET    /api/admin/analytics         # Platform analytics
POST   /api/admin/templates         # Add template
PUT    /api/admin/templates/:id     # Update template
```

### **4.3 Vendor Endpoints**
```
GET    /api/vendor/dashboard        # Vendor dashboard data
GET    /api/vendor/products         # List vendor products
POST   /api/vendor/products         # Create product
GET    /api/vendor/products/:id     # Get product
PUT    /api/vendor/products/:id     # Update product
DELETE /api/vendor/products/:id     # Delete product
GET    /api/vendor/orders           # List orders
PUT    /api/vendor/orders/:id       # Update order status
GET    /api/vendor/analytics        # Vendor analytics
PUT    /api/vendor/settings         # Update vendor settings
GET    /api/vendor/settings         # Get vendor settings
```

### **4.4 Storefront Endpoints (Public)**
```
GET    /api/store/:subdomain        # Get vendor store config
GET    /api/store/:subdomain/products     # List products
GET    /api/store/:subdomain/products/:id # Get single product
GET    /api/store/:subdomain/categories   # List categories
POST   /api/store/:subdomain/orders       # Create order
POST   /api/store/:subdomain/contact      # Contact form
```

---

## **5. FRONTEND ARCHITECTURE**

### **5.1 Next.js App Structure**
```
/src
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (admin)/             # Super Admin area
│   │   ├── dashboard/
│   │   ├── vendors/
│   │   └── templates/
│   ├── (vendor)/            # Vendor Admin area
│   │   ├── dashboard/
│   │   ├── products/
│   │   └── orders/
│   ├── (store)/[vendor]/    # Dynamic store frontend
│   │   ├── products/
│   │   ├── cart/
│   │   └── checkout/
│   └── layout.tsx           # Root layout
├── components/
│   ├── common/              # Shared components
│   ├── admin/               # Admin components
│   ├── vendor/              # Vendor components
│   ├── storefront/          # Store components
│   └── ui/                  # UI primitives
├── lib/
│   ├── api/                 # API clients
│   ├── auth/                # Authentication utilities
│   ├── database/            # Database helpers
│   └── utils/               # Utility functions
├── hooks/                   # Custom React hooks
├── contexts/                # React contexts
├── types/                   # TypeScript types
└── services/                # Business logic services
```

### **5.2 Dynamic Routing Logic**
```javascript
// Middleware for subdomain detection
export async function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host');
  
  // Extract subdomain
  const subdomain = hostname?.split('.')[0];
  
  // Check if it's a vendor subdomain
  if (subdomain && !['www', 'admin', 'app'].includes(subdomain)) {
    // Rewrite to storefront with vendor context
    url.pathname = `/store/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
}
```

### **5.3 Theme Application System**
```javascript
// Theme provider for dynamic styling
export function ThemeProvider({ vendor, children }) {
  useEffect(() => {
    // Apply CSS variables based on vendor theme
    document.documentElement.style.setProperty(
      '--primary-color', 
      vendor.theme.primaryColor || '#4F46E5'
    );
    
    // Set favicon
    if (vendor.theme.favicon) {
      const link = document.querySelector("link[rel*='icon']");
      if (link) link.href = vendor.theme.favicon;
    }
  }, [vendor]);
  
  return children;
}
```

---

## **6. AUTHENTICATION & AUTHORIZATION**

### **6.1 Role-Based Access Control**
```javascript
// User Roles Hierarchy
ROLES = {
  SUPER_ADMIN: {
    permissions: ['*'],
    scope: 'platform'
  },
  VENDOR_ADMIN: {
    permissions: ['manage_products', 'manage_orders', 'view_analytics'],
    scope: 'vendor'  // Limited to their vendor
  },
  VENDOR_STAFF: {
    permissions: ['manage_products', 'view_orders'],
    scope: 'vendor'
  },
  CUSTOMER: {
    permissions: ['place_orders', 'view_profile'],
    scope: 'personal'
  }
}
```

### **6.2 JWT Token Structure**
```javascript
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    userId: "user_123",
    role: "vendor_admin",
    vendorId: "vendor_456",  // Critical for multi-tenancy
    permissions: ["manage_products", "view_orders"],
    iat: 1672531200,
    exp: 1672617600
  },
  signature: "hashed_data"
}
```

### **6.3 Protected Route Example**
```javascript
// Middleware to protect vendor routes
export function requireVendorAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user has vendor role
    if (!['vendor_admin', 'vendor_staff'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Attach vendor context to request
    req.vendorId = decoded.vendorId;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## **7. DEPLOYMENT & INFRASTRUCTURE**

### **7.1 Environment Configuration**
```env
# .env.production
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Frontend URLs
NEXT_PUBLIC_API_URL=https://api.yourplatform.com
NEXT_PUBLIC_APP_URL=https://app.yourplatform.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=your-email
SMTP_PASS=your-password
```

### **7.2 Vercel Configuration**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/nextjs" }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.yourplatform.com"
  }
}
```

### **7.3 Docker Setup**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Start
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

---

## **8. DEVELOPMENT WORKFLOW**

### **8.1 Git Branch Strategy**
```
main
├── develop
│   ├── feature/vendor-management
│   ├── feature/product-crud
│   ├── feature/checkout-flow
│   └── bugfix/login-issue
└── release/v1.0.0
```

### **8.2 Code Standards**
```javascript
// Naming Conventions
- Components: PascalCase (ProductCard.jsx)
- Files/Folders: kebab-case (vendor-management)
- Variables: camelCase (productList)
- Constants: UPPER_SNAKE_CASE (API_URL)
- Types/Interfaces: PascalCase (IUser, TProduct)
```

### **8.3 Commit Convention**
```
feat: add vendor creation form
fix: resolve subdomain routing issue
docs: update API documentation
style: format product card component
refactor: improve authentication middleware
test: add unit tests for product service
chore: update dependencies
```

---

## **9. TESTING STRATEGY**

### **9.1 Test Pyramid**
```
         E2E Tests (10%)
          /       \
         /         \
Integration Tests (20%)
        |         |
        |         |
    Unit Tests (70%)
```

### **9.2 Test Coverage Goals**
```javascript
// Minimum coverage requirements
{
  "statements": 80,
  "branches": 75,
  "functions": 85,
  "lines": 80
}
```

### **9.3 Critical Test Scenarios**
1. **Vendor Creation Flow**
2. **Subdomain Routing**
3. **Data Isolation between Vendors**
4. **Authentication & Authorization**
5. **Checkout Process**
6. **Theme Application**

---

## **10. SECURITY CONSIDERATIONS**

### **10.1 Security Checklist**
- [ ] SQL/NoSQL Injection Prevention
- [ ] XSS Protection
- [ ] CSRF Tokens
- [ ] Rate Limiting
- [ ] Input Validation & Sanitization
- [ ] Secure Password Hashing (bcrypt)
- [ ] JWT Token Expiration
- [ ] HTTPS Enforcement
- [ ] CORS Configuration
- [ ] Security Headers (Helmet.js)

### **10.2 Data Protection**
```javascript
// Sensitive Data Handling
1. Never log sensitive data
2. Encrypt PII at rest
3. Implement data retention policies
4. Regular security audits
5. Vendor data isolation at database level
```

---

## **11. MONITORING & ANALYTICS**

### **11.1 Key Metrics to Track**
```javascript
// Platform Metrics
- Total Vendors
- Active Vendors
- Platform Revenue
- API Response Times
- Error Rates

// Vendor Metrics
- Store Traffic
- Conversion Rate
- Average Order Value
- Product Performance
- Customer Retention
```

### **11.2 Monitoring Tools**
- **Application**: Sentry (Error tracking)
- **Performance**: New Relic / Datadog
- **Logging**: Winston + ELK Stack
- **Analytics**: Google Analytics / Mixpanel
- **Uptime**: UptimeRobot / Pingdom

---

## **12. SCALING STRATEGY**

### **12.1 Horizontal Scaling**
```
Initial: Single Server → MongoDB Atlas
Stage 1: Load Balancer + Multiple App Instances
Stage 2: Database Read Replicas
Stage 3: Microservices Architecture
Stage 4: Kubernetes Cluster
```

### **12.2 Database Optimization**
```javascript
// Index Strategy
1. vendorId on all collections
2. compoundIndex: { vendorId: 1, createdAt: -1 }
3. Text indexes for search
4. TTL indexes for session data
```

### **12.3 Caching Strategy**
```javascript
// Redis Cache Structure
{
  // Vendor storefront data (5 min TTL)
  `vendor:${subdomain}:config`: {...},
  
  // Product listings (1 min TTL)
  `vendor:${vendorId}:products:page:${page}`: [...],
  
  // Session data (30 min TTL)
  `session:${sessionId}`: {...}
}
```

---

## **13. DISASTER RECOVERY**

### **13.1 Backup Strategy**
```yaml
Daily Backups:
  - Full database backup at 2 AM
  - Retention: 30 days
  
Weekly Backups:
  - Full system backup
  - Retention: 12 weeks
  
Monthly Backups:
  - Archived to cold storage
  - Retention: 7 years
```

### **13.2 Recovery Procedures**
1. **Database Failure**: Restore from latest backup
2. **Application Failure**: Redeploy from Git
3. **Infrastructure Failure**: Failover to backup region
4. **Data Corruption**: Point-in-time recovery

---

## **14. FUTURE ENHANCEMENTS**

### **14.1 Phase 2 (3-6 Months)**
- Mobile App (React Native)
- Advanced Analytics Dashboard
- Email Marketing Integration
- Multi-language Support
- Advanced Search (Elasticsearch)

### **14.2 Phase 3 (6-12 Months)**
- AI Product Recommendations
- Inventory Management System
- Subscription Billing
- API for Third-party Integrations
- Custom Domain Support

### **14.3 Phase 4 (12+ Months)**
- Mobile POS Integration
- Marketplace Features
- International Shipping
- Fraud Detection System
- White-label Solutions

---

## **15. SUPPORT & MAINTENANCE**

### **15.1 Support Channels**
- Email Support: support@yourplatform.com
- Live Chat: During business hours
- Knowledge Base: docs.yourplatform.com
- Community Forum: community.yourplatform.com

### **15.2 Maintenance Windows**
```
Weekly Maintenance: Sunday 2 AM - 4 AM UTC
Monthly Updates: First Sunday of the month
Emergency Maintenance: As needed with 2-hour notice
```

### **15.3 SLAs (Service Level Agreements)**
- Uptime: 99.5%
- Support Response: < 4 hours for critical issues
- Bug Fixes: Critical within 24 hours
- Feature Requests: Evaluated monthly

---

## **16. GLOSSARY**

| Term | Definition |
|------|------------|
| Super Admin | Platform owner with full system access |
| Vendor Admin | Store owner with store-specific access |
| Subdomain | Unique identifier for vendor store (storename.platform.com) |
| Template | Pre-designed storefront layout and styling |
| Multi-tenancy | Architecture where single instance serves multiple tenants |
| Vendor Isolation | Logical separation of vendor data |
| Theme | Customizable visual settings (colors, fonts, logo) |
| SKU | Stock Keeping Unit - unique product identifier |

---

## **APPENDIX**

### **A. API Rate Limits**
```
Super Admin: 1000 requests/hour
Vendor Admin: 500 requests/hour
Customer: 100 requests/hour
Public API: 50 requests/hour
```

### **B. File Size Limits**
```
Product Images: 5MB each, max 10 images
Vendor Logo: 2MB
Store Banner: 10MB
CSV Import: 50MB
```

### **C. Browser Support**
```
Chrome: Last 2 versions
Firefox: Last 2 versions
Safari: Last 2 versions
Edge: Last 2 versions
Mobile: iOS Safari 12+, Chrome for Android
```

---

## **📞 CONTACT**

**Technical Lead**: [Your Name]
**Email**: tech@yourplatform.com
**Documentation Version**: 1.0
**Last Updated**: [Current Date]

---

**This document is a living document and should be updated as the project evolves. All team members should have access to the latest version.**

**🎯 Next Steps:**
1. Review and approve this documentation
2. Set up development environment
3. Begin with Phase 1 implementation
4. Regular progress reviews every 2 weeks